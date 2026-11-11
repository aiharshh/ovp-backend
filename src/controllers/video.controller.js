import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js"
import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";

const publishAVideo = asyncHandler( async(req, res)=> {
    // 1. Get title and description
    // 2. The title and description should not be empty
    // 3. Get the video and the thumbnail from req.files from Multer.
    // 4. Validate the fiel exists Locally
    // 5. Upload the video and thumbnail to Cloudinary
    // 6. Get duration from Cloudinary video response
    // 7. Create video document in MongoDB (with owner = req.user._id)
    // 8. Return response
    const { title, description } = req.body;

    if(!title?.trim() || !description?.trim()){
        throw new ApiError(400, "Title and Description are required");
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailFileLocalPath = req.files?.thumbnail?.[0]?.path;

    if(!videoFileLocalPath){
        throw new ApiError(400, "Video file is required");
    }

    if(!thumbnailFileLocalPath){
        throw new ApiError(400, "Thumbnail is required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailFileLocalPath);

    if(!videoFile){
        throw new ApiError(400, "Video upload failed");
    }
    if(!thumbnail){
        throw new ApiError(400, "Thumbnail upload fail");
    }
    
    console.log(videoFile.duration);

     const video = await Video.create({
        title,
        description,
        duration: videoFile.duration,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        owner: req.user._id,
        isPublished: true
    });

    return res
    .status(201)
    .json(
        new ApiResponse(201, video, "Video published successfully")
    );

})

const getVideoById = asyncHandler( async(req, res)=> {
    // 1. Grab videoId from req.params
    // 2. if videoObjectId is not present then 400
    // 3. now to fetch details of the video we will use aggregation pipelines
    //    $lookup for likes - count documents, $lookup owner for lookup
    // 4. turn it into array and use $addFields, 
    // 5. isLiked by user?

    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
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
        }
    ]);


})

export {
    publishAVideo,
    getVideoById,
}
