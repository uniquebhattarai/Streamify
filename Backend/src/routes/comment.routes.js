import { Router } from "express";
import {
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/:videoId").post((req, res, next) => {
    /* #swagger.tags = ['Comments']
       #swagger.security = [{ "bearerAuth": [] }] */
    addComment(req, res, next)
});

router.route("/c/:commentId")
    .patch((req, res, next) => {
        /* #swagger.tags = ['Comments']
           #swagger.security = [{ "bearerAuth": [] }] */
        updateComment(req, res, next)
    })
    .delete((req, res, next) => {
        /* #swagger.tags = ['Comments']
           #swagger.security = [{ "bearerAuth": [] }] */
        deleteComment(req, res, next)
    });

export default router;