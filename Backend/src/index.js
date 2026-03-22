import { app } from "./app.js";
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path:"./.env"
})

const PORT =process.env.PORT||3069;


connectDB().then((result) => {
    app.listen(PORT,()=>{
        console.log(`Server is running on PORT ${PORT}`)
    })
}).catch((err) => {
    console.log("Mongodb connection Error",err)
});