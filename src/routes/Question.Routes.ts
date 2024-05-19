import Router from "express"
import { jwtVerify } from "../middleware"
import { createQuestion } from "../controllers/Question.controller"

const router = Router()


router.route("/create-question").post(jwtVerify, createQuestion)











export { router as QuestionRoutes }