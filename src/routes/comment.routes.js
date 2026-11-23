import { Router } from "express";
import {
    addComment,
    updateComment,
    deleteComment,
    getVideoComments
} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:videoId")
    .get(getVideoComments) // Public - anyone can read

router.use(verifyJWT); // Must be logged in to comment!

router.route("/:videoId")
    .post(addComment) // must be logged in to post comments

router.route("/c/:commentId")
    .patch(updateComment)
    .delete(deleteComment)

export default router;