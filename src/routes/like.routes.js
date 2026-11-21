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

router.route("/v/:videoId")
    .post(verifyJWT, toggleVideoLike)


export default router;