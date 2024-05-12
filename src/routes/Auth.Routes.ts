import  Router from "express"

import {upload} from "../middleware"
import { createUser, signinUser, verifyEmail } from "../controllers"
// import {JwtVerify} from "../Middlewares"
const router = Router()


router.route("/register").post(upload.fields([
    { name: "avatar", maxCount: 1 },
]) , createUser)

router.route("/signin").post(signinUser)
router.route("/email-verify").post(verifyEmail)
router.route("/resend-email").post()
// router.route("/logout").post(JwtVerify, loginUser)


export { router as AuthRouter}