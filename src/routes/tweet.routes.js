import { Router } from "express";
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet
} from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"


const router = Router();

router.route("/user/:userId")
    .get(getUserTweets) // anyone can see

router.use(verifyJWT);

router.route("/").post(createTweet);

router.route("/:tweetId")
    .delete(deleteTweet)
    .patch(updateTweet)


export default router;