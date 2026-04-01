import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query
    const user = req.User?._id

    const pageNumber = parseInt(page)
    const pageLimit = parseInt(limit)

    const sortDirection = sortType === "asc" ? 1 : -1;
    const skip = (pageNumber - 1) * pageLimit


    let pipeline = [
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
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                ownerDetails: {
                    $first: "$ownerDetails"
                }
            }
        },
        {
            $sort: {
                [sortBy]: sortDirection
            }
        },
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

const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    if (!(title && description)) {
        throw new ApiError(400, "title and description is required")
    }
    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path
    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoFile) {
        throw new ApiError(400, "Video upload failed");
    }
    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail upload failed");
    }

    try {
        const video = await Video.create(
            {
                title,
                description,
                duration: videoFile.duration,
                videoFile: videoFile.url,
                thumbnail: thumbnail.url,
                isPublished: true,
                owner: req.user?._id
            }
        );

        const createdVideo = await Video.findById(video._id);
        if (!createdVideo) {
            throw new ApiError(500, "Something Went Wrong while publishing the video")
        }
        res
            .status(201)
            .json(new ApiResponse(201, createdVideo, "Video Uploaded Successfully"))
    } catch (error) {
        console.log(error)
        if (videoFile) {
            await deleteFromCloudinary(videoFile.public_id)
        }
        if (thumbnail) {
            await deleteFromCloudinary(thumbnail.public_id)
        }
        throw new ApiError(500, "Error while uploading video")
    }

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const user = req.User?._id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id")
    }

    //1. on clicking video increment the view count by 1  immediately
    await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1 }
    })

    // 2. now aggregation pipeline to show the detail information of the video
    let pipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        }, {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers",

                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: { $size: "$subscribers" },
                            isSubscribed: {
                                $cond: {
                                    if: { $in: [user, "$subscribers.subscriber"] },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    }, {
                        $project: {
                            username: 1,
                            avatar: 1,
                            subscribersCount: 1,
                            isSubscribed: 1,
                        }
                    },


                ]

            }
        },
        // 3.likes details
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likeDetails"
            }
        }, {
            $addFields: {
                likesCount: { $size: "$likeDetails" },
                isLiked: {
                    $cond: {
                        if: { $in: [user, "$likeDetails.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        // 4.comment details 
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "commenter",
                            pipeline: [
                                {
                                    $project: { username: 1, avatar: 1 }
                                }
                            ]
                        }
                    }, {
                        $addFields: {
                            commenter: {
                                $first: "$commenter"
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                totalComment: { $size: "$comments" }
            }
        }, {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                views: 1,
                createdAt: 1,
                duration: 1,
                owner: 1,
                likesCount: 1,
                isLiked: 1,
                totalComment: 1,
                comments: 1,
                isPublished: 1
            }
        }
    ]
    try {
        if (!pipeline || pipeline.length === 0) {
            throw new ApiError(500, "Pipeline initialization failed")
        }
        const videoResults = await Video.aggregate(pipeline);
        if (!videoResults?.length) {
            throw new ApiError(404, "Video not found");
        }
        const video = videoResults[0];

        if (!video.isPublished && video.owner?._id.toString() !== user?.toString()) {
            throw new ApiError(403, "This video is private");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, video, "Video details fetched successfully"));
    } catch (error) {
        console.log(error)
        throw new ApiError(500, error?.message || "Internal Server Error while fetching video");
    }
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body;
    const thumbnailLocalPath = req.file?.path;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }
    if (!title || !description) {
        throw new ApiError(400, "Title and Description are required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this video");
    }

    let uploadedThumbnail;
    if (thumbnailLocalPath) {
        try {
            uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
            console.log("New thumbnail uploaded successfully", uploadedThumbnail);
        } catch (error) {
            console.log("Error while uploading thumbnail", error);
            throw new ApiError(500, "Failed to upload new thumbnail");
        }
    }

    try {
        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    title,
                    description,
                    thumbnail: uploadedThumbnail?.url || video.thumbnail
                }
            },
            { new: true }
        );

        if (!updatedVideo) {
            throw new ApiError(500, "Error while updating video in database");
        }

        if (uploadedThumbnail && video.thumbnail) {
            const oldThumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0];
            await deleteFromCloudinary(oldThumbnailPublicId);
        }

        return res
            .status(200)
            .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
    } catch (error) {
        console.log(error)
        if (uploadedThumbnail) {
            await deleteFromCloudinary(uploadedThumbnail.public_id);
        }

        throw new ApiError(500, "Something went wrong while updating the video information");
    }


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

     if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const video = await Video.findById(videoId);

     if (!video) {
        throw new ApiError(404, "Video not found");
    }

     if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this video");
    }

    try {
        const thumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0];
        const videoPublicId = video.videoFile.split("/").pop().split(".")[0];

     
        const deletedVideo = await Video.findByIdAndDelete(videoId);

        if (!deletedVideo) {
            throw new ApiError(500, "Something went wrong while deleting video from DB");
        }

        
        const videoComments = await Comment.find({ video: videoId });
        const commentIds = videoComments.map(c => c._id);
        await Comment.deleteMany({ video: videoId });

        
        await Like.deleteMany({
            $or: [
                { video: videoId },
                { comment: { $in: commentIds } }
            ]
        });

        await Playlist.updateMany(
            { videos: videoId },
            { $pull: { videos: videoId } }
        );

        
        await User.updateMany(
            { watchHistory: videoId },
            { $pull: { watchHistory: videoId } }
        );

        
        await deleteFromCloudinary(thumbnailPublicId); 
        await deleteFromCloudinary(videoPublicId, "video"); 

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Video and all associated data deleted successfully"));

    } catch (error) {
         console.error( error);
        throw new ApiError(500, error?.message || "Internal Server Error during video deletion");
    }

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video id")
    }

    const video = await Video.findById(videoId)

 if (!video) {
        throw new ApiError(404, "Video not found");
    }

     if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to toggle the status of this video");
    }

   try {
     video.isPublished = !video.isPublished;
 
     await video.save({ validateBeforeSave: false });
 
     return res
            .status(200)
            .json(new ApiResponse(200,{ isPublished: video.isPublished }, `Video status updated to: ${video.isPublished ? "Published" : "Unpublished"}`))
   } catch (error) {
    console.log("Error in toggle publish status",error)
     throw new ApiError(500, "An error occurred while updating the publish status in the database");
   }

})


export {
    getAllVideos,
    uploadVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}