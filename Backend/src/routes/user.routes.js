import { Router } from "express";
import {
    registerUser,
    logoutUser,
    loginUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controllers.js";
import { upload } from '../middlewares/multer.middlewares.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

// Public routes
router.route("/register").post(
    upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]),
    (req, res, next) => {
        /* #swagger.tags = ['User']
           #swagger.consumes = ['multipart/form-data']
           #swagger.parameters['fullname'] = {
               in: 'formData',
               type: 'string',
               required: true,
               description: 'Full name of the user'
           }
           #swagger.parameters['email'] = {
               in: 'formData',
               type: 'string',
               required: true,
               description: 'Email address'
           }
           #swagger.parameters['username'] = {
               in: 'formData',
               type: 'string',
               required: true,
               description: 'Unique username'
           }
           #swagger.parameters['password'] = {
               in: 'formData',
               type: 'string',
               required: true,
               description: 'Password'
           }
           #swagger.parameters['avatar'] = {
               in: 'formData',
               type: 'file',
               required: true,
               description: 'Profile avatar image'
           }
           #swagger.parameters['coverImage'] = {
               in: 'formData',
               type: 'file',
               required: false,
               description: 'Cover/banner image (optional)'
           } */
        registerUser(req, res, next)
    }
)

router.route("/login").post((req, res, next) => {
    // #swagger.tags = ['User']
    loginUser(req, res, next)
})

router.route("/refreshToken").post((req, res, next) => {
    // #swagger.tags = ['User']
    refreshAccessToken(req, res, next)
})


// Secured routes (require valid JWT)
router.use(verifyJWT);

router.route("/logout").post((req, res, next) => {
    /* #swagger.tags = ['User']
       #swagger.security = [{ "bearerAuth": [] }] */
    logoutUser(req, res, next)
})

router.route("/changePassword").post((req, res, next) => {
    /* #swagger.tags = ['User']
       #swagger.security = [{ "bearerAuth": [] }] */
    changeCurrentPassword(req, res, next)
})

router.route("/currentUser").get((req, res, next) => {
    /* #swagger.tags = ['User']
       #swagger.security = [{ "bearerAuth": [] }] */
    getCurrentUser(req, res, next)
})

router.route("/updateDetails").patch((req, res, next) => {
    /* #swagger.tags = ['User']
       #swagger.security = [{ "bearerAuth": [] }] */
    updateAccountDetails(req, res, next)
})

router.route("/updateAvatar").patch(upload.single("avatar"), (req, res, next) => {
    /* #swagger.tags = ['User']
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.consumes = ['multipart/form-data']
       #swagger.parameters['avatar'] = {
           in: 'formData',
           type: 'file',
           required: true,
           description: 'Avatar image file'
       } */
    updateUserAvatar(req, res, next)
})

router.route("/updateCoverImage").patch(upload.single("coverImage"), (req, res, next) => {
    /* #swagger.tags = ['User']
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.consumes = ['multipart/form-data']
       #swagger.parameters['coverImage'] = {
           in: 'formData',
           type: 'file',
           required: true,
           description: 'Cover image file'
       } */
    updateUserCoverImage(req, res, next)
})

router.route("/channel/:username").get((req, res, next) => {
    /* #swagger.tags = ['User']
       #swagger.security = [{ "bearerAuth": [] }] */
    getUserChannelProfile(req, res, next)
})

router.route("/history").get((req, res, next) => {
    /* #swagger.tags = ['User']
       #swagger.security = [{ "bearerAuth": [] }] */
    getWatchHistory(req, res, next)
})


export default router
