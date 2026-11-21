import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.models.js";


const toggleSubscription = asyncHandler( async(req, res)=>{
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)){
        throw new ApiError(400, "Channel doesn't exists");
    }

    const existing = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    })
    // Delete
    if(existing){
        await Subscription.findByIdAndDelete(existing._id);
    }
    // Create
    else{
        await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId
        })
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,
        {},
        existing ? "Unsubscriber successfully" : "Subscribed successfully"
    )
    )

})

const getUserChannelSubscribers = asyncHandler( async(req, res)=> {
    const { channelId } = req.params
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber", // subscriber field holds the user's ID
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscriber: {
                    $first: "$subscriber"
                }
            }
        }
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribers, "User channels fetched successfully")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    
    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscribedChannel: {
                    $first: "$subscribedChannel"
                }
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, channels, "Subscribed Channels Fetched")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}