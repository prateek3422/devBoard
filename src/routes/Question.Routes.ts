import Router from "express"
import { jwtVerify } from "../middleware"
import { createQuestion, getAllQuestion } from "../controllers"


const router = Router()


router.route("/create-question").post(jwtVerify, createQuestion)
router.route("/getAllQuestions").get(jwtVerify, getAllQuestion )










export { router as QuestionRoutes }