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

const getUserTweets = asyncHandler(async(req, res)=> {
    // 1. Go to user's channel and tweets section - by fiding user's id
    // 2. under there load all the tweets using $match
    // 3. Lookup as userTweets - from user, localField owner, foreignField id, as userTweets
    // 4. Project the fullName, username and avatar
    // 5. then lookup likes on the tweet where from likes, localfield id, foreignfield tweet as likes
    // 6. Put them in array as addFields as it returns array
    // 7. count likes
    // 8. sort by newest and return the response
    const { userId } = req.params;
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid User Id")
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
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
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                },
                likesCount: {
                    $size: "$likes"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweets,
            "Tweets fetched successfully!"
        )
    )
})

const updateTweet = asyncHandler(async(req, res) => {
    const { tweetId } = req.params;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Tweet not found")
    }

    const { content } = req.body;
    if(!content?.trim()){
        throw new ApiError(400, "Tweet cannot be empty")
    }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }
    
    if(tweet.owner.toString() !== req.user._id?.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    tweet.content = content;

    await tweet.save({
        validateBeforeSave: false
    })
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet updated successfully"
        )
    )
})



export {
    createTweet,
    getUserTweets,
    updateTweet,

}