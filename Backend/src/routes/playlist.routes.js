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

router.route("/").post((req, res, next) => {
    /* #swagger.tags = ['Playlists']
       #swagger.security = [{ "bearerAuth": [] }] */
    createPlaylist(req, res, next)
});

router.route("/:playlistId")
    .get((req, res, next) => {
        /* #swagger.tags = ['Playlists']
           #swagger.security = [{ "bearerAuth": [] }] */
        getPlaylistById(req, res, next)
    })
    .patch((req, res, next) => {
        /* #swagger.tags = ['Playlists']
           #swagger.security = [{ "bearerAuth": [] }] */
        updatePlaylist(req, res, next)
    })
    .delete((req, res, next) => {
        /* #swagger.tags = ['Playlists']
           #swagger.security = [{ "bearerAuth": [] }] */
        deletePlaylist(req, res, next)
    });

router.route("/add/:videoId/:playlistId").patch((req, res, next) => {
    /* #swagger.tags = ['Playlists']
       #swagger.security = [{ "bearerAuth": [] }] */
    addVideoToPlaylist(req, res, next)
});

router.route("/remove/:videoId/:playlistId").patch((req, res, next) => {
    /* #swagger.tags = ['Playlists']
       #swagger.security = [{ "bearerAuth": [] }] */
    removeVideoFromPlaylist(req, res, next)
});

router.route("/user/:userId").get((req, res, next) => {
    /* #swagger.tags = ['Playlists']
       #swagger.security = [{ "bearerAuth": [] }] */
    getUserPlaylists(req, res, next)
});

export default router;