import mongoose from "mongoose"

const tweetSchema = new Schema({
    content: {
        type: String, 
        req: true
    },
    owner: {
        type: Schema.Type.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

export const Tweet = new mongoose.model("Tweet", tweetSchema)