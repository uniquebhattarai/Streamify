import { Router } from "express";
import {
    toggleVideoLike,
    toggleCommentLike,
    getMostLikedVideos,
    getMyLikedVideos
} from "../controllers/like.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/videos").get((req, res) => {
    // #swagger.tags = ['Likes']
    getMostLikedVideos(req, res)
});

router.use(verifyJWT);

router.route("/videos/liked").get((req, res) => {
    /* #swagger.tags = ['Likes']
       #swagger.security = [{ "bearerAuth": [] }] */
    getMyLikedVideos(req, res)
});

router.route("/toggle/v/:videoId").post((req, res) => {
    /* #swagger.tags = ['Likes']
       #swagger.security = [{ "bearerAuth": [] }] */
    toggleVideoLike(req, res)
});

router.route("/toggle/c/:commentId").post((req, res) => {
    /* #swagger.tags = ['Likes']
       #swagger.security = [{ "bearerAuth": [] }] */
    toggleCommentLike(req, res)
});

export default router;