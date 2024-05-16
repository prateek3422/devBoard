import Router  from "express"
import { jwtVerify, upload } from "../middleware"
import { createBlog, getAllBlogs, getBlogById, updateBlog } from "../controllers"

const router = Router()

router.route("/Create-Blog").post(
    upload.fields([
        { name: "image", maxCount: 1 },
    ]),    
    jwtVerify, createBlog)

router.route("/getAllBlog").get(
    jwtVerify, getAllBlogs
)
router.route("/getBlogById/:BlogId").get(
    jwtVerify, getBlogById
)


router.route("/:blogId").patch(
    // upload.fields([
    //     { name: "image", maxCount: 1 },
    // ]),    
    jwtVerify, updateBlog)


export {router as BlogRouter}
