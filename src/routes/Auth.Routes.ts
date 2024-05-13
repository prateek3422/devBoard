import Router from "express"

import { jwtVerify, upload } from "../middleware"
import {
    changePassword,
    createUser, deleteUser,
    forgotPassword,
    resendEmail,
    signinUser, signOutUser,
    updateUser,
    verifyEmail
} from "../controllers"
const router = Router()


router.route("/register").post(upload.fields([
    { name: "avatar", maxCount: 1 },
]), createUser)

router.route("/signin").post(signinUser)
router.route("/signout").post(jwtVerify, signOutUser)
router.route("/email-verify").post(verifyEmail)
router.route("/resend-email").post(jwtVerify, resendEmail)
router.route("/forgot-password").post(forgotPassword)
router.route("/change-password").post(jwtVerify, changePassword)
router.route("/update-user").patch(jwtVerify, updateUser)
router.route("/delete-user").delete(jwtVerify, deleteUser)


export { router as AuthRouter }