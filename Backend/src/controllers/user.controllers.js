import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        if (!user) {
            throw new ApiError(404, "User Not Found")
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        console.log("Error while generating tokens", error)
        throw new ApiError(500, "Something Went Wrong While generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Every Field is required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User Already Exist")
    }

    console.warn(req.files);
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }


    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("Avatar Uploaded successfully", avatar)
    } catch (error) {
        console.log("Error while uploading avatar", error)
        throw new ApiError(500, "Failed to Upload Avatar")
    }
    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverLocalPath)
        console.log("Cover Image Uploaded successfully", coverImage)
    } catch (error) {
        console.log("Error while uploading Cover image", error)
        throw new ApiError(500, "Failed to Upload Cover Image")
    }

    try {
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })
        const createdUser = await User.findById(user._id).select(
            "-password -email -refreshToken"
        )

        if (!createdUser) {
            throw new ApiError(500, "Error while creating new user")
        }
        return res.status(201).json(new ApiResponse(201, createdUser, "User Registered successfully"))
    } catch (error) {
        console.log("User Creation failed", error)
        if (avatar) {
            await deleteFromCloudinary(avatar.public_id)
        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id)
        }
        throw new ApiError(500, "Something Went Wrong while registering user and images were deleted")
    }

})

const loginUser = asyncHandler(async (req, res) => {
    //get data from body
    const { username, email, password } = req.body
    //validation
    if (!email && password) {
        throw new ApiError(400, "Email and password is required")
    }
    const checkingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!checkingUser) {
        throw new ApiError(404, "User Not found")
    }
    //validate password
    const isPasswordValid = await checkingUser.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Password incorrect");
    }

    const { accessToken, refreshToken } = await generateTokens(checkingUser._id)

    const loggedInUser = await checkingUser.findById(checkingUser._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, loggedInUser, accessToken, "User logged in Successfully"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh Token is required")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid Refresh Token")
        }


        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }
        const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user._id)
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, {
                accessToken,
                refreshToken: newRefreshToken
            }, "Access Token Refreshed Successfully"))
    } catch (error) {
        console.log("Something Went wrong", error)
        throw new ApiError(500, "Something Went Wrong While Refreshing access Token")
    }
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, {
        $set: {
            refreshToken: undefined,
        }
    },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged out successfully"))
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changed Successfully"))
})
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current User Details"))
})
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body
    if (!fullname && !email) {
        throw new ApiError(400, "Fullname and Email is required while updating details")
    }
    const user = User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullname,
            email: email
        }
    }, {
        new: true
    }).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account Details Updated Successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "File is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar?.url) {
        throw new ApiError(500, "Something went wrong while uploading avatar")
    }
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar.url
        }
    },
        {
            new: true
        }).select("-password -refreshToken")
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar Updated Successfully"))
})
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverLocalPath = req.file?.path
    if (!coverLocalPath) {
        throw new ApiError(400, "File is Required")
    }
    const coverImage = await uploadOnCloudinary(coverLocalPath)
    if (!coverImage?.url) {
        throw new ApiError(500, "Something Went Wrong while uploading cover image")
    }
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            coverImage: coverImage.url
        }
    }, {
        new: true
    }).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover Image Updated Successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {

    const { username } = req.params

    if(!username?.trim()){
        throw new ApiError(400," Username is required ")
    }

    const channel = await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase( )
            }
        },{
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },{
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribeTo"

            }
        },{
            $addFields:{
                subscriberCount:{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribeTO"
                },
                isSubscribed:{
                    $cond:{
                        if:{
                            $in:[req.user?._id,"$subscribers.subscriber"]
                        },
                        then:true,
                        else:false
                    }
                }
            }
        },{
            $project:{
                fullname:1,
                email:1,
                username:1,
                avatar:1,
                subscriberCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                coverImage:1
            }
        }
    ],
)
if(!channel?.length){
    throw new ApiError(404,"Channel Not Found")
}

return res
    .status(200)
    .json(new ApiResponse(200,channel[0],"Channel Profile Fetched Successfully"))

})

const getWatchHistory = asyncHandler(async (req, res) => {
const user = await User.aggregate([
    {
        $match:{
            _id:new mongoose.Types.ObjectId(req.user?._id)
        }
    },{
        $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[
                {
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:_id,
                        as:"owner",
                        pipeline:[
                            {
                                $project:{
                                    fullname:1,
                                    username:1,
                                    avatar:1
                                }
                                
                            }
                        ]
                    }
                },
                {
                    $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                    }
                }
            ]
        }
    }
])
if(!user){
    throw new ApiError(404,"User Not Found")
}
return res
    .status(200)
    .json(new ApiResponse(200,user[0]?.watchHistory,"Watch history fetched successfully"))
})


export {
    registerUser, loginUser, refreshAccessToken, logoutUser, changeCurrentPassword,
    getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage,
    getWatchHistory,getUserChannelProfile
}