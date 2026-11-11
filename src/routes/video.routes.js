import { Router } from "express"

import { 
    publishAVideo,
    getVideoById,

} from "../controllers/video.controller.js"

import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

router.route("/").post(
    verifyJWT,
    upload.fields([
        { name: "videoFile", maxCount: 1},
        { name: "thumbnail", maxCount: 1}
    ]),
    publishAVideo
);

router.route("/get-video").get(getVideoById);
