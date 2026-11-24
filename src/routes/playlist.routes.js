import { Router } from "express"
import {
    createPlayList,
    getUserPlaylists,

} from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/user/:userId")
    .get(getUserPlaylists)

router.use(verifyJWT)

router.route("/")
    .post(createPlayList)



export default router;