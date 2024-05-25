import Router from "express"
import { jwtVerify} from "../middleware"
import { createLink, deleteLink, getLinkById, LikeStats } from "../controllers"


const router = Router()

router.route("/").post(jwtVerify, createLink)
router.route("/:LinkId").get(jwtVerify, getLinkById)
router.route("/stats/:shortUrl").get(jwtVerify, LikeStats)
router.route("/:LinkId").delete(jwtVerify, deleteLink)


export { router as LinkRouter }
