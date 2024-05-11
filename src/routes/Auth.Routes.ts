import  Router from "express"

import {upload} from "../middleware"
import { createUser } from "../controllers"
// import {JwtVerify} from "../Middlewares"
const router = Router()


router.route("/register").post(upload.fields([
    { name: "avatar", maxCount: 1 },
]) , createUser)

// router.route("/login").post(loginUser)
// router.route("/email-verify").post(verifyEmail)
// router.route("/logout").post(JwtVerify, loginUser)


export { router as AuthRouter}