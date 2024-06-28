import Router from "express"
import { jwtVerify } from "../middleware"
import { createTags, getAllTag, getTagsById, updateTags, } from "../controllers"

const router = Router()

router.route("/getAllTag").get( getAllTag)
router.route("/:tagId").get(jwtVerify, getTagsById)
router.route("/Create-tag").post(jwtVerify, createTags)
router.route("/:tagId").patch(jwtVerify, updateTags).delete(jwtVerify, getTagsById)


export { router as TagRouter }