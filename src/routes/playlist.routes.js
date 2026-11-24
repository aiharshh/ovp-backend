import { Router } from "express"
import {
    createPlayList,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/user/:userId")
    .get(getUserPlaylists);

router.route("/:playlistId")
    .get(getPlaylistById);

router.use(verifyJWT);

router.route("/").post(createPlayList);

router.route("/:playlistId")
    .delete(deletePlaylist)
    .patch(updatePlaylist)

router.route("/add/:videoId/:playlistId")
    .patch(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId")
    .patch(removeVideoFromPlaylist)



export default router;