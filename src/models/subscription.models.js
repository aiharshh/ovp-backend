import mongoose, { Schema } from "mongoose"

const subscriptionSchema = new Schema({
    subscriber : {
        type: Schema.Types.ObjectId, // the one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // the one to whom subscribed
        ref: "User"
    },
    
}, { timestamps : true })
//Indexing things so that we get results fetched in O(logN) and not O(n)
subscriptionSchema.index(
    { subscriber: 1, channel: 1 },
    { unique: true }
)
export const Subscription = mongoose.model("Subscription", subscriptionSchema)