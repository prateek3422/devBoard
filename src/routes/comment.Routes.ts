import Router from "express"
import { jwtVerify } from "../middleware"
import { AddAnswerComment, AddBlogComment, AddQuestionComment, deleteComment, getAllAnswerComment, getAllBlogComment, getAllQuestionComment, updateComment, } from "../controllers"



const router = Router()
router.route("/:BlogId").post(jwtVerify, AddBlogComment)
router.route("/question/:QuestionId").post(jwtVerify, AddQuestionComment)
router.route("/answer/:AnswerId").post(jwtVerify, AddAnswerComment)
router.route("/getBlogComment/:BlogId").get(jwtVerify, getAllBlogComment)
router.route("/getQuestionComment/:QuestionId").get(jwtVerify, getAllQuestionComment)
router.route("/getAnswerComment/:AnswerId").get(jwtVerify, getAllAnswerComment)
router.route("/:commentId").patch(jwtVerify, updateComment).delete(jwtVerify, deleteComment)



export { router as CommentRoutes }                                                     
