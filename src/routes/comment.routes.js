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
    .post(addComment)

router.route("/c/:commentId")
    .patch(updateComment)


export default router;