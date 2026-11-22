import { Router } from "express";
import {
    addComment,
    updateComment,
    deleteComment

} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Must be logged in to comment!

router.route("/:videoId")
    .get(getVideoComments) // Public - anyone can read
    .post(addComment) // must be logged in to post comments

router.route("/c/:commentId")
    .patch(updateComment)
    .delete(deleteComment)

export default router;