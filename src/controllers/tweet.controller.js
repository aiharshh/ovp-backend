import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.models.js"

const createTweet = asyncHandler(async(req, res)=>{
    // 1. So we need to first check if the user is logged in
    // 2. We will then check if the user can post tweets - he can if he is logged in
    // 3. We will take the contents of login from the user : req.body
    // 4. We will create a tweet using mongoose Tweet.create 
    // 5. Once tweet is created we will then save it

    if(!req.user?._id){
        throw new ApiError(403, "Please login to tweet")
    }

    const { content } = req.body;
    if(!content?.trim()){
        throw new ApiError(400, "Tweet Content cannot be empty");
    }

    const tweet = await Tweet.create({
        content: content?.trim(),
        owner: req.user?._id,
    })

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            tweet,
            "Tweet Created Successfully"
        )
    )

})


export {
    createTweet,
}