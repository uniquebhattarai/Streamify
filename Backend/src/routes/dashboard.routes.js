import { Router } from "express";
import {
    getChannelStats,
    getChannelVideos
} from "../controllers/dashboard.controllers.js"; 
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/stats").get((req, res) => {
    /* #swagger.tags = ['Dashboard']
       #swagger.security = [{ "bearerAuth": [] }] */
    getChannelStats(req, res)
});

router.route("/videos").get((req, res) => {
    /* #swagger.tags = ['Dashboard']
       #swagger.security = [{ "bearerAuth": [] }] */
    getChannelVideos(req, res)
});

export default router;