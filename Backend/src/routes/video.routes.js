import { Router } from "express";
import { 
    getAllVideos, uploadVideo, getVideoById, 
    updateVideo, deleteVideo, togglePublishStatus 
} from "../controllers/video.controllers.js";
import { upload } from '../middlewares/multer.middlewares.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/").get((req, res, next) => {
    // #swagger.tags = ['Videos']
    getAllVideos(req, res, next)
});

router.use(verifyJWT);

router.route("/").post(
    upload.fields([{ name: "videoFile", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), 
    (req, res, next) => {
        /* #swagger.tags = ['Videos']
           #swagger.security = [{ "bearerAuth": [] }]
           #swagger.consumes = ['multipart/form-data']
           #swagger.parameters['title'] = {
               in: 'formData',
               type: 'string',
               required: true,
               description: 'Video title'
           }
           #swagger.parameters['description'] = {
               in: 'formData',
               type: 'string',
               required: true,
               description: 'Video description'
           }
           #swagger.parameters['videoFile'] = {
               in: 'formData',
               type: 'file',
               required: true,
               description: 'Video file to upload'
           }
           #swagger.parameters['thumbnail'] = {
               in: 'formData',
               type: 'file',
               required: true,
               description: 'Thumbnail image for the video'
           } */
        uploadVideo(req, res, next)
    }
);

router.route("/:videoId")
    .get((req, res, next) => {
        /* #swagger.tags = ['Videos']
           #swagger.security = [{ "bearerAuth": [] }] */
        getVideoById(req, res, next)
    })
    .patch(upload.single("thumbnail"), (req, res, next) => {
        /* #swagger.tags = ['Videos']
           #swagger.security = [{ "bearerAuth": [] }]
           #swagger.consumes = ['multipart/form-data']
           #swagger.parameters['title'] = {
               in: 'formData',
               type: 'string',
               required: true,
               description: 'Updated video title'
           }
           #swagger.parameters['description'] = {
               in: 'formData',
               type: 'string',
               required: true,
               description: 'Updated video description'
           }
           #swagger.parameters['thumbnail'] = {
               in: 'formData',
               type: 'file',
               required: false,
               description: 'New thumbnail image (optional)'
           } */
        updateVideo(req, res, next)
    })
    .delete((req, res, next) => {
        /* #swagger.tags = ['Videos']
           #swagger.security = [{ "bearerAuth": [] }] */
        deleteVideo(req, res, next)
    });

router.route("/toggle/publish/:videoId").patch((req, res, next) => {
    /* #swagger.tags = ['Videos']
       #swagger.security = [{ "bearerAuth": [] }] */
    togglePublishStatus(req, res, next)
});

export default router;