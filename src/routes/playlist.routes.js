import { Router } from "express"
import {
    createPlayList,
    getUserPlaylists,
    addVideoToPlaylist,
    getPlaylistById,
    removeVideoFromPlaylist,
    deletePlaylist,

} from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/user/:userId")
    .get(getUserPlaylists);

router.route("/:playlistId")
    .get(getUserPlaylists);

router.use(verifyJWT);

router.route("/").post(createPlayList);

router.route("user/:playlistId")
    .delete(deletePlaylist)

router.route("/add/:videoId/:playlistId")
    .patch(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId")
    .patch(removeVideoFromPlaylist)



export default router;