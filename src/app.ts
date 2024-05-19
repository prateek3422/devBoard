import express, { Express, urlencoded } from "express"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import {errorHandler} from "./middleware"
import { AuthRouter, BlogRouter, QuestionRoutes, TagRouter } from "./routes"
import { logger } from "./logger"

const app: Express = express()

// * middleware
app.use(express.static("public"))
app.use(express.json({ limit: "1mb" }))
app.use(urlencoded({ extended: true, limit: "1mb" }))
app.use(logger.httpExpress)
app.use(cors({
    origin: process.env.DOMAIN,
    methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 204,
    preflightContinue: true

}))
app.use(helmet())
app.use(cookieParser())


// TODO routes
app.use("/api/v1/users", AuthRouter)
app.use("/api/v1/Blogs", BlogRouter)
app.use("/api/v1/Tags", TagRouter)
app.use("/api/v1/Questions", QuestionRoutes)


app.use(errorHandler)
export {app}
