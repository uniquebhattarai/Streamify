import { Router } from "express";
import { 
    getAllVideos, uploadVideo, getVideoById, 
    updateVideo, deleteVideo, togglePublishStatus 
} from "../controllers/video.controllers.js";
import { upload } from '../middlewares/multer.middlewares.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/").get((req, res) => {
    // #swagger.tags = ['Videos']
    getAllVideos(req, res)
});

router.use(verifyJWT);

router.route("/").post(
    upload.fields([{ name: "videoFile", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), 
    (req, res) => {
        /* #swagger.tags = ['Videos']
           #swagger.security = [{ "bearerAuth": [] }] */
        uploadVideo(req, res)
    }
);

router.route("/:videoId")
    .get((req, res) => {
        /* #swagger.tags = ['Videos']
           #swagger.security = [{ "bearerAuth": [] }] */
        getVideoById(req, res)
    })
    .patch(upload.single("thumbnail"), (req, res) => {
        /* #swagger.tags = ['Videos']
           #swagger.security = [{ "bearerAuth": [] }] */
        updateVideo(req, res)
    })
    .delete((req, res) => {
        /* #swagger.tags = ['Videos']
           #swagger.security = [{ "bearerAuth": [] }] */
        deleteVideo(req, res)
    });

router.route("/toggle/publish/:videoId").patch((req, res) => {
    /* #swagger.tags = ['Videos']
       #swagger.security = [{ "bearerAuth": [] }] */
    togglePublishStatus(req, res)
});

export default router;