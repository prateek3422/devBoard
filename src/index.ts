import dotenv from "dotenv"
dotenv.config({})

import { app } from "./app"
import {DBConnection} from "./database/index"
import { logger } from "./logger"



DBConnection().then(() =>{
    logger.info(`connection successfull`)
}).catch( (err:string) =>{
   logger.error("database connection failed")
})

app.listen(process.env.PORT, () =>{
    logger.info(`your server is running on Port no ${process.env.PORT}`)
})
