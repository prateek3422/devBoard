import { NextFunction, Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler, uploadToCloudinary } from "../utils";
import { createBlogSchema } from "../schema";
import { Blog } from "../models/Blog.models";
import mongoose from "mongoose";


const getAllBlogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { limit = 1, page = 1, shortBy, shortType, query, userId } = req.params


})
const getBlogById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    //TODO: aggeregate tags


})
const createBlog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, title, content } = createBlogSchema.parse(req.body)

    const files = req.files as { [key: string]: Express.Multer.File[] }

    const image = files.image[0]?.path

    if (!image) {
        return next(new ApiError(400, "image is required"))
    }

    const uploadImage = await uploadToCloudinary(image)

    if (!uploadImage) {
        return next(new ApiError(400, "image upload failed"))
    }

    const blog = await Blog.create({
        name,
        title,
        content,
        image: {
            url: uploadImage.url,
            public_id: uploadImage.public_id
        },
        //@ts-ignore
        tags: req.user?._id, 
        //@ts-ignore
        author: req.user?._id,
    })

    if (!blog) {
        return next(new ApiError(400, "blog create failed"))
    }
    return res.status(201).json(new ApiResponse(201, blog, "blog created successfully"))


})
const updateBlog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

})
const DeleteBlogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
})
const toggleBlog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
})


export {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    DeleteBlogs,
    toggleBlog
}