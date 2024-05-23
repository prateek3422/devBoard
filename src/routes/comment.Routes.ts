import Router from "express"
import { jwtVerify} from "../middleware"
import { AddBlogComment,  } from "../controllers"



const router = Router()
router.route("/:BlogId").post(jwtVerify, AddBlogComment)




export { router as CommentRoutes }                                                     
