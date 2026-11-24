import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";

const getChannelStats = asyncHandler( async(req, res) => {
    const user = req.user?._id;
    if(!req.user?._id){
        throw new ApiError(400, "User not found")
    }

    const totalSubscribers = await Subscription.countDocuments({
        channel: req.user._id
    })

    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: {
                    $sum: 1
                },
                totalViews: {
                    $sum: "$views"
                }
            }
        }
    ])


    const totalLikes = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoInfo"
            }
        },
        {
            $unwind: "$videoInfo"
        },
        {
            $match: {
                "videoInfo.owner": new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $count: "totalLikes"
        }
    ])

    const channelStats = {
        totalSubscribers,
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        totalLikes: totalLikes[0]?.totalLikes || 0
    };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channelStats,
                "Channel stats fetched successfully"
            )
        );
})

const getChannelVideos = asyncHandler( async(req, res) => {
    const video = await Video.find({
        owner: req.user?._id
    })
    .sort({
        createdAt: -1
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videos,
                "Channel videos fetched successfully!"
            )
        )
})

export {
    getChannelStats,
    getChannelVideos
}