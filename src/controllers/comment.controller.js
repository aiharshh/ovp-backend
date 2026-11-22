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

const addTweetComment = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    const { content } = req.body;
    if (!content?.trim()) {
        throw new ApiError(400, "Comment content cannot be empty!");
    }
    
    const comment = await Comment.create({
        content,
        tweet: tweetId,
        owner: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"));
});

const updateComment = asyncHandler( async(req, res) => {
    const { commentId } = req.params;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Comment Id invalid");
    }
    // 1. Get the videoId and check if it's valid object id
    // 2. Check if the comment on the video id is of that user
    // 3. Check if comment already exists in mongoDB (take id)
    // 4. Edit that comment if commment id exists

    const { content } = req.body;

    if(!content?.trim()){
        throw new ApiError(400, "Comment cannot be empty")
    }

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(403, "Comment not found");
    }

    if(comment.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to update this comment");
    }
    
    comment.content = content;
    await comment.save({
        validateBeforeSave: false
    })
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "Comment updated successfully"
        )
    )
})

const deleteComment = asyncHandler(async(req, res) => {
    const { commentId } = req.params;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Comment Id Invalid");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(403, "Comment not found");
    }

    if(comment.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "Unauthorised to delete this comment")
    }

    await Comment.findByIdAndDelete(commentId);
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "Comment deleted successfully!")
    )

})

export {
    addComment,
    updateComment,
    deleteComment
}