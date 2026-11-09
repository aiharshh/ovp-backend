import mongoose from "mongoose"

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        req: true
    },
    description: {
        type: String,
        req: true
    },

    videos: [{
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    
}, { timestamps: true })

export const Playlist = new mongoose.model("Playlist", playlistSchema);