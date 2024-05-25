import { ApiError, ApiResponse, asyncHandler } from "../utils";
import { NextFunction, Request, Response } from "express"
import { v4 as uuidv4 } from 'uuid';
import { Link } from "../models/Like.model";



const createLink = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { originalUrl } = req.body

    if (!originalUrl) {
        return next(new ApiError(400, "originalUrl is required"))
    }

    const shortUrl = uuidv4().replace(/-/g, "")

    const link = await Link.create({
        originalUrl,
        shortUrl
    })

    return res.status(200).json(new ApiResponse(200, link, "link created successfully"))
})

const getLinkById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { LinkId } = req.params

    if (!LinkId) {
        return next(new ApiError(400, "linkId is required"))
    }

    const link = await Link.findById(LinkId)
    if (!link) {
        return next(new ApiError(400, "link not found"))
    }

    link.click++
    await link.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, link, "link found successfully"))
})

const LikeStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
 const { shortUrl } = req.params

 if (!shortUrl) {
    return next(new ApiError(400, "shortUrl is required"))
 }

 const link = await Link.findOne({ shortUrl })

 if (!link) {
    return next(new ApiError(400, "link not found"))
 }

 return res.status(200).json(new ApiResponse(200, {originalUrl: link.originalUrl, click: link.click}, "link found successfully"))
})


const deleteLink = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { LinkId } = req.params 
    
    if(!LinkId){
        return next(new ApiError(400, "LinkId is required"))
    }

    const link = await Link.findByIdAndDelete(LinkId)

    if(!link){
        return next(new ApiError(400, "link not found"))
    }

    return res.status(200).json(new ApiResponse(200, link, "link deleted successfully"))
})




export { createLink,getLinkById, LikeStats,deleteLink }