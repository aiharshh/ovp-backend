import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler( async(req, res) => {

    const { videoId } = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Video not found");
    }
    const existing = await Like.findOne({
        likedBy: req.user._id,
        video: videoId
    })
    // if Like exists unlike it
    if(existing){
        await Like.findByIdAndDelete(existing._id);
    }
    // if Like doesn't exists then add like
    else{
        await Like.create({
            likedBy: req.user?._id,
            video: videoId
        })
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            existing ? "Unliked the video" : "Liked the video"
        )
    )

})

const toggleCommentLike = asyncHandler( async(req, res)=> {
    const {commentId} = req.params;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid Comment Id")
    }

    const existing = await Like.findOne({
        likedBy: req.user?._id,
        comment: commentId
    })
    if(existing){
        await Like.findByIdAndDelete(existing?._id);
    }
    else{
        await Like.create({
            likedBy: req.user?._id,
            comment: commentId
        })
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            {},
            existing ? "Unliked Comment Successfully" : "Liked Comment Successfully"
        )
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet Id")
    }

    const existing = await Like.findOne({
        likedBy: req.user?._id,
        tweet: tweetId
    })
    if (existing) {
        await Like.findByIdAndDelete(existing?._id);
    }
    else {
        await Like.create({
            likedBy: req.user?._id,
            tweet: tweetId
        })
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200,
                {},
                existing ? "Unliked Tweet Successfully" : "Liked Tweet Successfully"
            )
        )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike
}