import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.models.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const { content } = req.body;
    if (!content?.trim()) {
        throw new ApiError(400, "Comment content cannot be empty!");
    }

    // Creates the comment on THIS video:
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"));
});




export {
    addComment,
}