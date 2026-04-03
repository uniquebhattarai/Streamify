import { Router } from "express";
import {
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/:videoId").post((req, res) => {
    /* #swagger.tags = ['Comments']
       #swagger.security = [{ "bearerAuth": [] }] */
    addComment(req, res)
});

router.route("/c/:commentId")
    .patch((req, res) => {
        /* #swagger.tags = ['Comments']
           #swagger.security = [{ "bearerAuth": [] }] */
        updateComment(req, res)
    })
    .delete((req, res) => {
        /* #swagger.tags = ['Comments']
           #swagger.security = [{ "bearerAuth": [] }] */
        deleteComment(req, res)
    });

export default router;