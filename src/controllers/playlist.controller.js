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
                owner : {
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

// getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist,
// deletePlaylist, updatePlaylist

const getPlaylistById = asyncHandler( async(req, res) => {

    const { playlistId } = req.params;
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Playlist not found")
    }

    // will do this to learn populate() in mongoDB
    // in one line populate does it whereas in aggregation pipelines it takes multipe lookups
    // use populate wher we want to getch a document and fil in it's related objects
    // use aggregation when we need math, we need filtering, counts or grouping like likeCount, sorting, pagination

    const playlist = await Playlist.findById(playlistId) // returns _id, name, owner, videos array
        .populate({
            path: "videos",
            select: "title description duration views thumbnail isPublished",
            populate: {
                path: "owner",
                select: "fullName username avatar"
            }
        })
        .populate( "owner", "fullName username avatar");

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            playlist,
            "Playlist fetched successfully"
        )
    )
})



export {
    createPlayList,
    getUserPlaylists,
    addVideoToPlaylist,
    getPlaylistById

}