import Router from "express"

import { jwtVerify, upload } from "../middleware"
import {
    changePassword,
    createUser, deleteUser,
    forgotPassword,
    getCurrentUser,
    resendEmail,
    signinUser, signOutUser,
    updateUser,
    verifyEmail,
    verifyForgotPassword
} from "../controllers"
const router = Router()


router.route("/register").post(upload.fields([
    { name: "avatar", maxCount: 1 },
]), createUser)

router.route("/signin").post(signinUser)
router.route("/signout").post(jwtVerify, signOutUser)
router.route("/email-verify").post(verifyEmail)
router.route("/current-user").get(jwtVerify, getCurrentUser)
router.route("/resend-email").post(jwtVerify, resendEmail)
router.route("/forgot-password").post(forgotPassword)
router.route("/verify-forgot-password").post(verifyForgotPassword)
router.route("/change-password").post(jwtVerify, changePassword)
router.route("/update-user").patch(upload.fields([
    { name: "avatar", maxCount: 1 } ]),jwtVerify, updateUser)
router.route("/delete-user").delete(jwtVerify, deleteUser)


export { router as AuthRouter }