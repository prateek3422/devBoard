import { NextFunction, Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler, deleteFromCloudinary, uploadToCloudinary } from "../utils";
import { createBlogSchema, getAllBlog, updateBlogSchema, } from "../schema";
import { Blog } from "../models/Blog.models";
import mongoose from "mongoose";



const getAllBlogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { limit = 10, page = 1, shortBy, shortType, query, userId } = req.query


    const blog = await Blog.aggregate([
        {
            $match:
                query ?
                    {
                        title: {
                            $regex: query,
                            $options: "i"
                        }
                    } : {}
        },

        {
            $match: userId ? {
                //@ts-ignore
                author: new mongoose.Types.ObjectId(userId)
            } : {}
        },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $sort: {
                [shortBy as string]: shortType === "asc" ? 1 : -1
            }
        },

        {
            $skip: (parseInt(page as string) - 1) * (parseInt(limit as string))

        },
        {
            $limit: (parseInt(limit as string))
        },
    ])

    console.log(blog)
    if (!blog) {
        return next(new ApiError(400, "blog not found"))
    }

    return res.status(200).json(new ApiResponse(200, blog, "get all blogs"))
})
const getBlogById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { BlogId } = req.params

    if (!BlogId) {
        return next(new ApiError(400, "BlogId is required"))
    }

    const blog = await Blog.aggregate([

        {
            $match: { author: new mongoose.Types.ObjectId('6646190cf5aa998f6ea019b3') }
        },
        {
            $lookup: {
                from: "tags",
                localField: "tags",
                foreignField: "_id",
                as: "tags"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1,
                            createdAt: 1,
                            updatedAt: 1
                        }
                    },

                ]
            }
        },

        {
            $addFields: {
                author: {
                    $first: "$author"
                }
            },

        },
        {
            $addFields: {
                tags: {
                    $first: "$tags"
                }
            }
        }



    ])
    if (!blog) {
        return next(new ApiError(400, "Blog not found"))
    }

    return res.status(200).json(new ApiResponse(200, blog, "Blog by id feched successfully"))

})
const createBlog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, title, content, tags } = createBlogSchema.parse(req.body)

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
        tags: tags || [],
        author: req.user?._id,
    })

    if (!blog) {
        return next(new ApiError(400, "blog create failed"))
    }
    return res.status(201).json(new ApiResponse(201, blog, "blog created successfully"))


})
const updateBlog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    console.log("hello")
    const { blogId } = req.params
    // console.log(blogId)
    const { name, title, content, } = updateBlogSchema.parse(req.body)
    if (!blogId) {
        return next(new ApiError(400, "blogId is required"))
    }

    const blog = await Blog.findById(blogId)

    //* add image and remove image
    //@ts-ignore
    deleteFromCloudinary(blog?.image?.public_id)
    const files = req.files as { [key: string]: Express.Multer.File[] }
    const image = files.image[0]?.path

    const uploadImage = await uploadToCloudinary(image)

    if (!uploadImage) {
        return next(new ApiError(400, "image upload failed"))
    }
    const updateBlog = await Blog.findByIdAndUpdate(
        blogId,
        {
            $set: {
                name,
                title,
                content,
                image: {
                    url: uploadImage.url,
                    public_id: uploadImage.public_id
                }
            }
        }, {
        new: true
    }
    )

    if (!updateBlog) {
        return next(new ApiError(400, "blog update failed"))
    }

    return res.status(200).json(new ApiResponse(200, updateBlog, "blog updated successfully"))


})
const DeleteBlogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { blogId } = req.params

    if (!blogId) {
        return next(new ApiError(400, "blogId is required"))
    }

    const blog = await Blog.findById(blogId)
    if (!blog) {
        return next(new ApiError(400, "blog not found"))
    }
    //@ts-ignore
    deleteFromCloudinary(blog.image?.public_id)

    const deleteBlog = await Blog.findByIdAndDelete(blogId)

    if (!deleteBlog) {
        return next(new ApiError(400, "blog delete failed"))
    }

    return res.status(200).json(new ApiResponse(200, {}, "delete blog successfully"))
})
const toggleBlog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { blogId } = req.params

    if (!blogId) {
        return next(new ApiError(400, "blogId is required"))
    }

    const blog = await Blog.findById(blogId)

    if (!blog) {
        return next(new ApiError(400, "blog not found"))
    }

    const toggleBlog = await Blog.findByIdAndUpdate(blogId, {
        $set: {
            isPublic: !blog.isPublic
        }
    })

    if (!toggleBlog) {
        return next(new ApiError(400, "toggle blog failed"))
    }

    return res.status(200).json(new ApiResponse(200, toggleBlog, "toggle blog successfully"))
})


export {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    DeleteBlogs,
    toggleBlog
}