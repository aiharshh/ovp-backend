import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.models.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addComment = asyncHandler(async(req, res) => {
    const { videoId } = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "VideoId not found");
    }
    const { content } = req.body;

    if(!content?.trim()){
        throw new ApiError(400, "Comment content cannot be empty!");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    return res
    .status(201)
    .json(
        new ApiResponse(200, comment, "Comment added successfully")
    )
})


export {
    addComment,
}