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

router.route("/:userId").post((req, res) => {
    /* #swagger.tags = ['Subscriptions']
       #swagger.security = [{ "bearerAuth": [] }] */
    createChannel(req, res)
});

router.route("/toggle/:channelId").post((req, res) => {
    /* #swagger.tags = ['Subscriptions']
       #swagger.security = [{ "bearerAuth": [] }] */
    toggleSubscription(req, res)
});

router.route("/subscriber/:channelId").get((req, res) => {
    /* #swagger.tags = ['Subscriptions']
       #swagger.security = [{ "bearerAuth": [] }] */
    getUserChannelSubscribers(req, res)
});

router.route("/subscribedto/:subscriberId").get((req, res) => {
    /* #swagger.tags = ['Subscriptions']
       #swagger.security = [{ "bearerAuth": [] }] */
    getSubscribedChannels(req, res)
});

export default router;