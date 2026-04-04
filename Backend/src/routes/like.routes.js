import { Router } from "express";
import {
    toggleVideoLike,
    toggleCommentLike,
    getMostLikedVideos,
    getMyLikedVideos
} from "../controllers/like.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/videos").get((req, res, next) => {
    // #swagger.tags = ['Likes']
    getMostLikedVideos(req, res, next)
});

router.use(verifyJWT);

router.route("/videos/liked").get((req, res, next) => {
    /* #swagger.tags = ['Likes']
       #swagger.security = [{ "bearerAuth": [] }] */
    getMyLikedVideos(req, res, next)
});

router.route("/toggle/v/:videoId").post((req, res, next) => {
    /* #swagger.tags = ['Likes']
       #swagger.security = [{ "bearerAuth": [] }] */
    toggleVideoLike(req, res, next)
});

router.route("/toggle/c/:commentId").post((req, res, next) => {
    /* #swagger.tags = ['Likes']
       #swagger.security = [{ "bearerAuth": [] }] */
    toggleCommentLike(req, res, next)
});

export default router;