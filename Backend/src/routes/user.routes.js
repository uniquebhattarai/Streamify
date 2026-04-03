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


router.route("/register").post(
    upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]),
     (req, res) => {
        // #swagger.tags = ['User']
        registerUser(req, res)
    })
router.route("/login").post((req, res) => {
    // #swagger.tags = ['User']
    loginUser(req, res)
})
router.route("/refreshToken").post((req, res) => {
    // #swagger.tags = ['User']
    refreshAccessToken(req, res)
})



//secured routes
router.use(verifyJWT);
router.route("/logout").post((req, res) => {
    /* #swagger.tags = ['User']
       #swagger.security = [{ "bearerAuth": [] }] */
    logoutUser(req, res)
})
router.route("/changePassword").post((req, res) => {
    /* #swagger.tags = ['User']
       #swagger.security = [{ "bearerAuth": [] }] */
    changeCurrentPassword(req, res)
})
router.route("/currentUser").get((req, res) => {
    /* #swagger.tags = ['User']
       #swagger.security = [{ "bearerAuth": [] }] */
    getCurrentUser(req, res)
})
router.route("/updateDetails").patch((req, res) => {
    /* #swagger.tags = ['User']
       #swagger.security = [{ "bearerAuth": [] }] */
    updateAccountDetails(req, res)
})
router.route("/updateAvatar").patch(upload.single("avatar"),(req, res) => {
    /* #swagger.tags = ['User']
       #swagger.security = [{ "bearerAuth": [] }] */
    updateUserAvatar(req, res)
})
router.route("/updateCoverImage").patch(upload.single("coverImage"),(req, res) => {
    /* #swagger.tags = ['User']
       #swagger.security = [{ "bearerAuth": [] }] */
    updateUserCoverImage(req, res)
})
router.route("/channel/:username").get((req, res) => {
    /* #swagger.tags = ['User']
       #swagger.security = [{ "bearerAuth": [] }] */
    getUserChannelProfile(req, res)
})
router.route("/history").get((req, res) => {
    /* #swagger.tags = ['User']
       #swagger.security = [{ "bearerAuth": [] }] */
    getWatchHistory(req, res)
})


export default router
