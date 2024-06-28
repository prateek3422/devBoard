import Router from "express"
import { jwtVerify} from "../middleware"
import { createAnswer, deleteAnswer, getAllAnswer, updateAnswer } from "../controllers"

const router = Router()

router.route("/:questionId").post(jwtVerify, createAnswer).get(getAllAnswer)
router.route("/:AnswerId").patch(jwtVerify, updateAnswer).delete(jwtVerify, deleteAnswer)
export { router as AnswerRoutes }
