import Router from "express"
import { jwtVerify } from "../middleware"
import { getleaderBoardOnday } from "../controllers"


const router = Router()

router.route("/top").get(jwtVerify, getleaderBoardOnday)

export { router as LeaderBoardRouter }
