import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import multer from 'multer';
const app = express();
app.use(
    cors({
        origin:process.env.CORS_ORIGIN,
        Credentials:true
    })
)

// common middleware
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes
import healthcheckRouter from "./routes/healthCheck.routes.js"
import userRouter from "./routes/user.routes.js"
import { errorHandler } from './middlewares/error.middleware.js';
//all-routes
app.use("/api/v1/healthcheck",healthcheckRouter)
app.use("/api/v1/users",userRouter)


app.use(errorHandler)

export {app}