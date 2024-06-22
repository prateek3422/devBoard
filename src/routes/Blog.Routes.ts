import Router from "express";
import { jwtVerify, upload } from "../middleware";
import {
  createBlog,
  DeleteBlogs,
  getAllBlogs,
  getBlogById,
  toggleBlog,
  updateBlog,
} from "../controllers";

const router = Router();

router
  .route("/Create-Blog")
  .post(upload.fields([{ name: "image", maxCount: 1 }]), jwtVerify, createBlog);

router.route("/getAllBlog").get(getAllBlogs);

router.route("/getBlogById/:BlogId").get(getBlogById);

router
  .route("/:blogId")
  .patch(upload.single("image"), jwtVerify, updateBlog)
  .delete(jwtVerify, DeleteBlogs);

router.route("/toggle-blog/:blogId").patch(jwtVerify, toggleBlog);

export { router as BlogRouter };
