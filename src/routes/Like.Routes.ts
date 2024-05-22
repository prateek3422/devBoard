import Router from "express"
import { jwtVerify} from "../middleware"
import { toggleAnswerLike, toggleBlogLike, toggleCommentLike, toggleQuestionLike } from "../controllers"


const router = Router()

router.route("/toggle/b/:BlogId").post(jwtVerify, toggleBlogLike)
router.route("/toggle/q/:QuestionId").post(jwtVerify,toggleQuestionLike)
router.route("/toggle/a/:AnswerId").post(jwtVerify,toggleAnswerLike)
router.route("/toggle/c/:CommentId").post(jwtVerify,toggleCommentLike)


export { router as LikeRouter }
