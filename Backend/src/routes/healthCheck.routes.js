import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.contollers.js";


const router = Router()

router.route("/").get((req, res) => {
    // #swagger.tags = ['System']
    // #swagger.summary = 'Health Check'
    healthCheck(req, res);
})

export default router