import mongoose, {isValidObjectId} from "mongoose"
import { Video } from "../models/video.model.js"
import {Like} from "../models/like.model.js"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"video not found")
    }

    try {
        const isLiked = await Like.findOne({video:videoId,likedBy:req?.user?._id})

        if(isLiked){
            //user has already liked the video so delete it
            await Like.deleteOne({_id:isLiked?._id}) 
            res
            .status(200)
            .json(new ApiResponse(200, null, "Like removed successfully"));
        }else{
            // make the video liked by the user
            const newLike = await Like.create({video:videoId,likedBy:req?.user?._id})
            res.status(200).json(new ApiResponse(200, newLike, "Like added successfully"));
        }

    } catch (error) {
        console.log("Error While toggling video like ",error)
        throw new ApiError(500,error,"Error While toggling video like ")
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid Comment id")
    }

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"comment not found")
    }

    try {
         const isCommented = await Like.findOne({comment:commentId,likedBy:req?.user?._id})

        if(isCommented){
            //user has already liked the comment so remove like 
            await Like.deleteOne({_id:isCommented?._id}) 
            res
            .status(200)
            .json(new ApiResponse(200, null, "Like removed successfully"));
        }else{
            // make the comment liked by the user
            const newLike = await Like.create({comment:commentId,likedBy:req?.user?._id})
            res.status(200).json(new ApiResponse(200, newLike, "Like added successfully"));
        }
 
    } catch (error) {
        console.log("Error While toggling comment like ",error)
        throw new ApiError(500,error,"Error While toggling comment like ")
    }

})


const getMostLikedVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10,query="" } = req.query;
    const pageNumber = parseInt(page);
    const pageLimit = parseInt(limit);
    const skip = (pageNumber - 1) * pageLimit;
    
    let pipeline=[
        {
            $match: {
                    isPublished: true,
                    ...(query ? {
                        $or: [
                            { title: { $regex: query, $options: "i" } },
                            { description: { $regex: query, $options: "i" } }
                        ]
                    } : {})
                }
        },{
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"allLikes"
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$allLikes"
                }
            }
        },
         {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                avatar: 1,
                                // fullName: 1
                            }
                        }
                    ]
                }
            },
             { $addFields: { ownerDetails: { $first: "$ownerDetails" } } },
                {
                $sort: {
                    likesCount: -1, 
                    createdAt: -1   // If two videos have the same likes, show the newer one first
                }
            },
            { $skip: skip },
            { $limit: pageLimit },
            {
            $project: {
                allLikes: 0 
            }
        }

    ]
   try {
      if (!pipeline || pipeline.length === 0) {
            throw new ApiError(500, "Pipeline initialization failed");
        }
     const likedVideos = await Video.aggregate(pipeline);
       const totalVideos = await Video.countDocuments({
            isPublished: true,
            ...(query ? {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                ]
            } : {})
        });
     if (!likedVideos) {
            throw new ApiError(500, "Failed to load videos from database");
        }
      return res
             .status(200)
             .json(new ApiResponse(200,{likedVideos,totalVideos,currentPage: pageNumber, totalPages: Math.ceil(totalVideos / pageLimit)} , "Liked Videos details fetched successfully"));
   } catch (error) {
    console.log(error)
    throw new ApiError(500, error?.message || "Internal Server Error");
   }

})

const getMyLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id; 
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page);
    const pageLimit = parseInt(limit);
    const skip = (pageNumber - 1) * pageLimit;

    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }

    const pipeline = [
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1,
                                        fullName: 1
                                    }
                                }
                            ]
                        }
                    },
                    { $addFields: { owner: { $first: "$ownerDetails" } } },
                    { $project: { ownerDetails: 0 } } 
                ]
            }
        },
        { $unwind: "$videoDetails" },

      
        { $sort: { createdAt: -1 } },


        { $skip: skip },
        { $limit: pageLimit },


        {
            $project: {
                _id: 0, 
                likedVideo: {
                    _id: "$videoDetails._id",
                    videoFile: "$videoDetails.videoDetails",
                    thumbnail: "$videoDetails.thumbnail",
                    title: "$videoDetails.title",
                    description: "$videoDetails.description",
                    views: "$videoDetails.views",
                    duration: "$videoDetails.duration",
                    createdAt: "$videoDetails.createdAt",
                    owner: "$videoDetails.owner"
                }
            }
        }
    ];

    try {
        const likedVideos = await Like.aggregate(pipeline);


        const totalLikedVideos = await Like.countDocuments({
            likedBy: userId,
            video: { $exists: true, $ne: null }
        });

        return res.status(200).json(
            new ApiResponse(
                200, 
                {
                    likedVideos,
                    totalLikedVideos,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(totalLikedVideos / pageLimit)
                }, 
                "Your liked videos fetched successfully"
            )
        );
    } catch (error) {
        console.error("Error in getMyLikedVideos:", error);
        throw new ApiError(500, "Internal Server Error while fetching your liked videos");
    }
});

export {
    toggleCommentLike,
    toggleVideoLike,
    getMostLikedVideos,
    getMyLikedVideos
}