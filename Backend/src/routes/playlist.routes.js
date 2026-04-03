import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post((req, res) => {
    /* #swagger.tags = ['Playlists']
       #swagger.security = [{ "bearerAuth": [] }] */
    createPlaylist(req, res)
});

router.route("/:playlistId")
    .get((req, res) => {
        /* #swagger.tags = ['Playlists']
           #swagger.security = [{ "bearerAuth": [] }] */
        getPlaylistById(req, res)
    })
    .patch((req, res) => {
        /* #swagger.tags = ['Playlists']
           #swagger.security = [{ "bearerAuth": [] }] */
        updatePlaylist(req, res)
    })
    .delete((req, res) => {
        /* #swagger.tags = ['Playlists']
           #swagger.security = [{ "bearerAuth": [] }] */
        deletePlaylist(req, res)
    });

router.route("/add/:videoId/:playlistId").patch((req, res) => {
    /* #swagger.tags = ['Playlists']
       #swagger.security = [{ "bearerAuth": [] }] */
    addVideoToPlaylist(req, res)
});

router.route("/remove/:videoId/:playlistId").patch((req, res) => {
    /* #swagger.tags = ['Playlists']
       #swagger.security = [{ "bearerAuth": [] }] */
    removeVideoFromPlaylist(req, res)
});

router.route("/user/:userId").get((req, res) => {
    /* #swagger.tags = ['Playlists']
       #swagger.security = [{ "bearerAuth": [] }] */
    getUserPlaylists(req, res)
});

export default router;