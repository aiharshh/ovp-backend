import { Router } from "express";
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike
} from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
// Apply verifyJWT to all routes in this file!
router.use(verifyJWT);

router.route("/toggle/v/:videoId")
// .post(verifyJWT, toggleVideoLike) -> upgrade as it's added up there already
    .post(toggleVideoLike)

router.route("/toggle/c/:commentId")
    .post(toggleCommentLike)

router.route("/toggle/t/:tweetId")
    .post(toggleTweetLike)


export default router;