import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    try {
    
        const videoStats = await Video.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: "$views" },
                    totalVideos: { $count: {} }
                }
            }
        ]);

        // 1. Total Subscribers
        const subscriberStats = await Subscription.aggregate([
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $count: "subscribersCount"
            }
        ]);

        // 2. Total Likes Across all videos owned by this channel
        const likeStats = await Video.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes"
                }
            },
            {
                $project: {
                    likesCount: { $size: "$likes" }
                }
            },
            {
                $group: {
                    _id: null,
                    totalLikes: { $sum: "$likesCount" }
                }
            }
        ]);

        const stats = {
            subscribers: subscriberStats[0]?.subscribersCount || 0,
            views: videoStats[0]?.totalViews || 0,
            videos: videoStats[0]?.totalVideos || 0,
            likes: likeStats[0]?.totalLikes || 0
        };

        return res
            .status(200)
            .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        throw new ApiError(500, "An error occurred while fetching channel stats");
    }
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    try {
        const videos = await Video.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes"
                }
            },
            {
                $addFields: {
                    likesCount: { $size: "$likes" },
                    createdAt: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $project: {
                    likes: 0 
                }
            }
        ]);

        return res
            .status(200)
            .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));

    } catch (error) {
        console.error("Dashboard Videos Error:", error);
        throw new ApiError(500, "An error occurred while fetching channel videos");
    }
});

export {
    getChannelStats,
    getChannelVideos
}