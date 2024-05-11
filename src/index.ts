import dotenv from "dotenv"
dotenv.config({})

import { app } from "./app";
import DBConnection from "./database/index"



DBConnection().then(() =>{
    console.log(`connection successfull`)
}).catch( (err) =>{
    console.log(`connection failed`)
})

app.listen(process.env.PORT, () =>{
    console.log(`your server is running on Port no ${process.env.PORT}`)
})
