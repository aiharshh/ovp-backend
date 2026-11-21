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

export {
    toggleVideoLike,
}