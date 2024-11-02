import Router from "express";

import { jwtVerify, upload } from "../middleware";
import {
  changePassword,
  countCredit,
  createUser,
  deleteUser,
  forgotPassword,
  getCurrentUser,
  handleSocilaLogin,
  resendEmail,
  signinUser,
  signOutUser,
  updateUser,
  verifyEmail,
  verifyForgotPassword,
} from "../controllers";
import passport from "passport";
import "../utils/passport";

const router = Router();

router
  .route("/register")
  .post(upload.fields([{ name: "avatar", maxCount: 1 }]), createUser);

router.route("/signin").post(signinUser);
router.route("/signout").post(jwtVerify, signOutUser);
router.route("/email-verify").post(verifyEmail);
router.route("/current-user").get(jwtVerify, getCurrentUser);
router.route("/resend-email").post(resendEmail);
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-forgot-password").post(verifyForgotPassword);
router.route("/change-password").post(jwtVerify, changePassword);
router
  .route("/update-user")
  .patch(
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    jwtVerify,
    updateUser
  );
router.route("/delete-user").delete(jwtVerify, deleteUser);

router.route("/creadit").get(jwtVerify, countCredit);

// sso Routes
router
  .route("/google")
  .get(
    passport.authenticate("google", { scope: ["profile", "email"] }),
    (req, res) => {
      res.send("redirecting to google...");
    }
  );

router
  .route("/google/callback")
  .get(passport.authenticate("google"), handleSocilaLogin);

export { router as AuthRouter };
