import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createChannel = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id")
    }
    const existChannel = await Subscription.findOne({
        channel:userId
    })
    if(existChannel){
        throw new ApiError(400,"Channel already exist for user")
    }
    try {
        const newChannel = await Subscription.create({
            channel:userId,
            subscriber:null
        })

        if(!newChannel){
            throw new ApiError(400,"CouldNot create a channel")
        }
        res.status(201)
            .json(new ApiResponse(201,newChannel,"New channel successfully created"))
    } catch (error) {
        console.log(error)
        throw new ApiError(500,"Error while creating a channel")
    }
})

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user?._id; 

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Channel id")
    }

      if (channelId.toString() === userId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }
   
    try {
         const existingSub = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    });
    if (existingSub) {
        await Subscription.findByIdAndDelete(existingSub._id);

        return res
            .status(200)
            .json(new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully"));
    } else {
        const newSub = await Subscription.create({
            subscriber: userId,
            channel: channelId
        });

            if (!newSub) {
                throw new ApiError(500, "Failed to create subscription record");
            }

            return res
                .status(201)
                .json(new ApiResponse(
                    201, 
                    { subscribed: true, subscription: newSub }, 
                    "Subscribed successfully"
                ));

    }

        
    } catch (error) {
        console.log("Toggle subscription Error",error)
         throw new ApiError(500,error?.message || "Something went wrong while toggling subscription");
    }

})

// subscriber list of the channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const currentUserId = req.user?._id

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid user id")
    }

    if (channelId.toString() !== currentUserId.toString()) {
        throw new ApiError(403, "Unauthorized: Only the channel owner can view their subscriber list");
    }

    const pipeline=[
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },{
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriberDetails",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                subscriberDetails:{ $first:"$subscriberDetails"}
            }
        },{
            $project:{
                subscriberDetails:1,
                createdAt:1
            }
        }
    ]
    try {
        if (!pipeline || pipeline.length === 0) {
            throw new ApiError(500, "Pipeline initialization failed");
        }
         const subscriberList = await Subscription.aggregate(pipeline);

         res.status(200)
            .json(new ApiResponse(200,subscriberList,"Subscriber list fetched successfully"))
    } catch (error) {
        console.log(error);
        throw new ApiError(500,"Something went wrong while getting subscriber list")
    }
})

// list of channel that i have subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const currentUserId = req.user?._id;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber ID");
    }
    if (subscriberId.toString() !== currentUserId.toString()) {
        throw new ApiError(403, "Unauthorized: You can only view your own subscriptions");
    }
    const pipeline=[
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"subscribedChannel",
                pipeline:[
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
         {
            $addFields: {
                subscribedChannel: { $first: "$subscribedChannel" }
            }
        },
        {
            $project: {
                subscribedChannel: 1,
                createdAt: 1
            }
        }
    ]

    try {
        const subscribedChannelsList = await Subscription.aggregate(pipeline);
         return res
            .status(200)
            .json(new ApiResponse(
                200, 
                subscribedChannelsList, 
                "Subscribed channels fetched successfully"
            ));
    } catch (error) {
        console.error("subscribed channel list Error:", error);
        throw new ApiError(500, "Something went wrong while getting subscribed channels");
    }
})

export {
    createChannel,
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}