import mongoose, { isValidObjectId} from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Playlist } from "../models/playlist.models.js"

const createPlayList = asyncHandler( async(req, res) => {
    
    if (!req.user?._id){
        throw new ApiError(400, "User not found");
    }
    
    const { name, description } = req.body;

    if(!name?.trim() || !description?.trim()){
        throw new ApiError(400, "Fields cannot be empty!")
    }

    const playlist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        owner: req.user?._id,

    })

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            playlist,
            "Playlist created successfully"
        )
    )

})

const getUserPlaylists = asyncHandler( async(req, res) => {
    const { userId } = req.params;
    if (!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid User Id");
    }
    const playlists = await Playlist.aggregate([
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
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $addFields: {
                $owner : {
                    $first: "$owner"
                },
                totalVideos: {
                    $size: "$videos"
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
            playlists,
            "Playlists fetched from users!"
        )
    )
})

export {
    createPlayList,
    getUserPlaylists,
    
}