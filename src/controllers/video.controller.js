import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js"
import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
    // if the junior engineer does 
    // const video = await Video.find(); -> Node.js will attempt to pull all 1,000,000 documents 
    // into server RAM at once. The server CPU spikes to 100%, RAM runs out, and the backend crashes for every user.
    // That is why Pagination is non - negotiable

    const pipeline = [];
    // If user searched for something, push a search stage!
    // If user filtered by creator, push a creator stage!
    // Push the owner details stage!
    // Push the sort stage!

    if(userId){
        if (!isValidObjectId(userId)) {
            throw new ApiError(404, "User not found");
        }
        pipeline.push(
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            }
        )
    }

    if(query){
        pipeline.push({
            $match : {
                $or: [
                    {
                        title: {
                            $regex: query,
                            $options: "i"
                        }
                    },
                    {
                        description: {
                            $regex: query,
                            $options: "i"
                        }
                    }
                ]
            }
        })
    }

    pipeline.push({
        $match: {
            isPublished: true
        }
    });
    pipeline.push({
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
        },
        // Remember: $lookup gives an array [ { ... } ]. 
        // $first turns it into a clean single { ... } object!
    });

    pipeline.push({
        $addFields: {
            owner: {
                $first: "$owner"
            }
        }
    })

    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        });
    }
    else{
        // Default: Newest Videos first (-1 means descending / newest)
        pipeline.push({
            $sort: {
                createdAt: -1
            }
        });
    }
    const options = {
        page: parseInt(page, 10),
        // this converts the "1" from string to number 1 from req.query
        limit: parseInt(limit, 10)
        // converts string to number
    }

    const videos = await Video.aggregatePaginate(
        Video.aggregate(pipeline),
        // handover to suitcase
        options // tells it which page and how many cards per page
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    )
        // {
        //   "docs": [ video1, video2, video3... ],   // The actual videos for this page
        //   "totalDocs": 1000,                       // Total videos in the database
        //   "totalPages": 100,                       // How many pages exist
        //   "page": 1,                               // Current page
        //   "hasNextPage": true,                     // Is there a next page?
        //   "hasPrevPage": false                     // Is there a previous page?
        // }
})

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
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner",
                },
                isLiked: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$likes.likedBy"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        }
    ]);

    if(!video?.length){
        throw new ApiError(404, "Video doesn't exists");
    }

    await Video.findByIdAndUpdate(videoId, {
        $inc: {
            views: 1
        }
    });

    return res
    .status(200)
    .json(
        new ApiResponse(200, video[0], "Video fetched successfully")
    )

})

const updateVideo = asyncHandler( async(req, res)=> {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video Id");
    }
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body;
    // 1. Extract videoId and title and desc from req.params and req.body
    // 2. Validate videoId and title and description are present
    // 3. upload to cloudinary our new thumbnail 
    // 4. Clean old thumbnail
    // 5. run the update Video.findByIdAndUpdate(videoId, {..})
    // 6. return response status

    if(!title){
        throw new ApiError(400, "No title found");
    }
    if(!description){
        throw new ApiError(400, "o Description found");
    }

    const thumbnailFileLocalPath = req.file?.path;

    if (!thumbnailFileLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailFileLocalPath);
    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail upload fail");
    }

    const updatedVideoDoc = await Video.findByIdAndUpdate( videoId, {
        $set: {
            title,
            description,
            thumbnail: thumbnail.url
        }
    },
    { new: true }
    );

    return res
        .status(201)
        .json(
            new ApiResponse(201, updatedVideoDoc, "Video details updated successfully")
        );
})

const deleteAVideo = asyncHandler( async(req, res)=> {
    // 1. To delete we have to first fetch the video from the database
    // 2. Get the video by findById
    // 3. fetch the details of the videos and it's url in from monogoDb
    // 4. Delete the video from cloudinary and set the url of videoFile to null
    // 5. Delete the title and desceiption and all other details and write it to null
    // 6. 

    const { videoId } = req.params;
    if (!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video Id");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }

    if(video.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You do not have permissino to delete the video");
    }

    const videoPublicId = video.videoFile.split("/").pop().split(".")[0];
    const thumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0];

    await deleteFromCloudinary(videoPublicId, "video")
    await deleteFromCloudinary(thumbnailPublicId, "image")

    await Video.findByIdAndDelete(videoId);

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            {}, 
            "Video deleted successfully"
        )
    );

})

const toggleVideoVisibility = asyncHandler( async(req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id");
    }

    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You do not have permission to toggle the visibility");
    }

    // if(video.isPublished){
    //     video.isPublished = false;
    // }
    // else{
    //     video.isPublished = true;
    // }
    video.isPublished = !video.isPublished

    await video.save(
        { validateBeforeSave : false }
    );

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Video Visibility Toggled")
    )
})

export {
    publishAVideo,
    getVideoById,
    getAllVideos,
    updateVideo,
    deleteAVideo,
    toggleVideoVisibility

}
