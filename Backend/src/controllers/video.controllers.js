import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query="", sortBy="createdAt", sortType="desc", userId } = req.query
    const user = req.User?._id

    const pageNumber = parseInt(page)
    const pageLimit = parseInt(limit)

     const sortDirection = sortType === "asc" ? 1 : -1;
    const skip = (pageNumber-1)*pageLimit


    let pipeline =[
        {
        $match: {
            $and: [
                query ? {
                    $or: [
                        { title: { $regex: query, $options: "i" } },
                        { description: { $regex: query, $options: "i" } }
                    ]
                } : {},
                userId ? { owner: new mongoose.Types.ObjectId(userId) } : {}
            ]
        }
    },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerDetails",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar:1,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                ownerDetails:{
                    $first:"$ownerDetails"
                }
            }
        },
        {$sort: {
                [sortBy]: sortDirection 
            }},
        { $skip: skip },
        { $limit: pageLimit }
    ]
    try {
           if (!pipeline || pipeline.length === 0) {
            throw new ApiError(500, "Pipeline initialization failed");
        }

        const videos = await Video.aggregate(pipeline);
             const totalVideos = await Video.countDocuments({
            ...(query ? { $or: [{ title: { $regex: query, $options: "i" } }, { description: { $regex: query, $options: "i" } }] } : {}),
            ...(userId ? { owner: new mongoose.Types.ObjectId(userId) } : {})
        });

          if (!videos) {
            throw new ApiError(500, "Failed to load videos from database");
        }
        return res.status(200).json(
            new ApiResponse(
                200, 
                {
                    videos,
                    totalVideos,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(totalVideos / pageLimit)
                }, 
                "Videos fetched and paginated successfully"
            )
        );
    } catch (error) {
        console.log(error)
        throw new ApiError(500, error?.message || "Internal Server Error");
    }
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
   
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}