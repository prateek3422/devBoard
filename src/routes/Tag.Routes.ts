import Router  from "express"
import { jwtVerify} from "../middleware"
import { createTags, } from "../controllers"

const router = Router()

router.route("/Create-tag").post(jwtVerify, createTags)


export {router as TagRouter}
