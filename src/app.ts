import express, { Express, urlencoded } from "express"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import errirHandler from "./middleware/ErrorHandler.middleware.js"




const app: Express = express()

// * middleware


app.use(cors({
    origin: process.env.DOMAIN,
    methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 204,
    preflightContinue: true

}))

app.use(helmet())
app.use(express.json({ limit: "1mb" }))
app.use(urlencoded({ extended: true, limit: "1mb" }))
app.use(express.static("public"))
app.use(cookieParser())


// TODO routes



app.use(errirHandler)
export {app}
