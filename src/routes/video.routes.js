import { Router } from "express"

import { 
    publishAVideo,
    getVideoById,
    updateVideo,
    getAllVideos

} from "../controllers/video.controller.js"

import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/").post(
    verifyJWT,
    upload.fields([
        { name: "videoFile", maxCount: 1},
        { name: "thumbnail", maxCount: 1}
    ]),
    publishAVideo
);

router
    .route("/:videoId")
    .get(getVideoById)
    .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

export default router;