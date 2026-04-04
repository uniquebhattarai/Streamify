import { Router } from "express";
import {
    createChannel,
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controllers.js"; 
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/:userId").post((req, res, next) => {
    /* #swagger.tags = ['Subscriptions']
       #swagger.security = [{ "bearerAuth": [] }] */
    createChannel(req, res, next)
});

router.route("/toggle/:channelId").post((req, res, next) => {
    /* #swagger.tags = ['Subscriptions']
       #swagger.security = [{ "bearerAuth": [] }] */
    toggleSubscription(req, res, next)
});

router.route("/subscriber/:channelId").get((req, res, next) => {
    /* #swagger.tags = ['Subscriptions']
       #swagger.security = [{ "bearerAuth": [] }] */
    getUserChannelSubscribers(req, res, next)
});

router.route("/subscribedto/:subscriberId").get((req, res, next) => {
    /* #swagger.tags = ['Subscriptions']
       #swagger.security = [{ "bearerAuth": [] }] */
    getSubscribedChannels(req, res, next)
});

export default router;