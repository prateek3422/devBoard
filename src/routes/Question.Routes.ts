import Router from "express"
import { jwtVerify } from "../middleware"
import { createQuestion, deleteQuestion, getAllQuestion, getQuestionById, updateQuestion } from "../controllers"


const router = Router()


router.route("/create-question").post(jwtVerify, createQuestion)
router.route("/getAllQuestions").get(jwtVerify, getAllQuestion)
router.route("/:questionId")
.get(jwtVerify, getQuestionById)
.patch(jwtVerify, updateQuestion)
.delete(jwtVerify, deleteQuestion)


export { router as QuestionRoutes }