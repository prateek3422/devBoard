import Router  from "express"
import { jwtVerify, upload } from "../middleware"
import { createBlog } from "../controllers"

const router = Router()

router.route("/Create-Blog").post(
    upload.fields([
        { name: "image", maxCount: 1 },
    ]),    
    jwtVerify, createBlog)


export {router as BlogRouter}
