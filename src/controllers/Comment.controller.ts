import { NextFunction, Request, Response } from "express"
import { Comment } from "../models/comment.model"
import { commentSchema } from "../schema"
import { ApiError, ApiResponse, asyncHandler } from "../utils"
import mongoose from "mongoose"
import { Answer } from "../models/Answer.model"
import { Question } from "../models/Question.model"
import { Blog } from "../models/Blog.models"




const AddBlogComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { content } = commentSchema.parse(req.body)
    const { BlogId } = req.params

    if (!BlogId) {
        return next(new ApiError(400, "blogId is required"))
    }

    const blog = await Blog.findById({_id:BlogId})
    if (!blog) {
        return next(new ApiError(400, "blog not found"))
    }
    const comment = await Comment.create({
        content,
        blog: BlogId,
        owner: req.user.id
    })
    if (!comment) {
        return next(new ApiError(400, "comment create failed"))
    }

    return res.status(200).json(
        new ApiResponse(200, comment, "Add blog comment successfully")
    )
})

const AddQuestionComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { content } = commentSchema.parse(req.body)
    const { QuestionId } = req.params

    if (!QuestionId) {
        return next(new ApiError(400, "questionId is required"))
    }

    const question = await Question.findById({_id:QuestionId})
    if (!question) {
        return next(new ApiError(400, "question not found"))
    }

    const comment = await Comment.create({
        content,
        question: QuestionId,
        owner: req.user.id
    })

    if (!comment) {
        return next(new ApiError(400, "comment create failed"))
    }

    return res.status(200).json(new ApiResponse(200, comment, "Add Question comment  successfully"))
})

const AddAnswerComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { content } = commentSchema.parse(req.body)
    const { AnswerId } = req.params

    if (!AnswerId) {
        return next(new ApiError(400, "answerId is required"))
    }

    const answer = await Answer.findById({_id:AnswerId})
    if (!answer) {
        return next(new ApiError(400, "answer not found"))
    }

    const comment = await Comment.create({
        content,
        answer: AnswerId,
        owner: req.user.id
    })

    if (!comment) {
        return next(new ApiError(400, "comment create failed"))
    }

    return res.status(200).json(new ApiResponse(200, comment, "Add Answer comment successfully"))

})

const getAllBlogComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10 } = req.query
    const { BlogId } = req.params
    console.log(BlogId)

    if (!BlogId) {
        return next(new ApiError(400, "blogId is required"))
    }

    const comment = await Comment.aggregate([
        {
            $match: {
                blog: new mongoose.Types.ObjectId(BlogId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                content: 1,
                owner: {
                    fullname: 1,
                    username: 1,
                    avatar: {
                        url: 1
                    },

                }
            }
        },


        {
            $skip: (parseInt(page as string) - 1) * (parseInt(limit as string))

        },
        {
            $limit: (parseInt(limit as string))
        },

    ])

    return res.status(200).json(new ApiResponse(200, comment, "Add Answer comment successfully"))
})

const getAllQuestionComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10 } = req.query
    const { QuestionId } = req.params

    if (!QuestionId) {
        return next(new ApiError(400, "QuestionId is required"))
    }

    const comment = await Comment.aggregate([
        {
            $match: {
                question: new mongoose.Types.ObjectId(QuestionId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }

        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                content: 1,
                owner: {
                    fullname: 1,
                    username: 1,
                    avatar: {
                        url: 1
                    },

                }
            }
        },
        {
            $skip: (parseInt(page as string) - 1) * (parseInt(limit as string))
        },
        {
            $limit: (parseInt(limit as string))
        }
    ])


    return res.status(200).json(new ApiResponse(200, comment, "get all question comment successfully"))
})

const getAllAnswerComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10 } = req.query
    const { AnswerId } = req.params

    if (!AnswerId) {
        return next(new ApiError(400, "AnswerId is required"))
    }

    const comment = await Comment.aggregate([
        {
            $match: {
                answer: new mongoose.Types.ObjectId(AnswerId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                content: 1,
                owner: {
                    fullname: 1,
                    username: 1,
                    avatar: {
                        url: 1
                    },
                }
            }
        },
        {
            $skip: (parseInt(page as string) - 1) * (parseInt(limit as string))
        },
        {
            $limit: (parseInt(limit as string))
        }
    ])
    return res.status(200).json(new ApiResponse(200, comment, "get all answer comment successfully"))
})

const updateComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params
    const { content } = commentSchema.parse(req.body)
    if (!commentId) {
        return next(new ApiError(400, "commentId is required"))
    }
    const comment = await Comment.findByIdAndUpdate(
        commentId,
        { content },
        { new: true }
    )

    if (!comment) {
        return next(new ApiError(400, "comment not found"))
    }

    return res.status(200).json(new ApiResponse(200, comment, "comment updated successfully"))
})

const deleteComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params
    if (!commentId) {
        return next(new ApiError(400, "commentId is required"))
    }
    const comment = await Comment.findByIdAndDelete(commentId)
    if (!comment) {
        return next(new ApiError(400, "comment not found"))
    }
    return res.status(200).json(new ApiResponse(200, comment, "comment deleted successfully"))
})

export {
    AddBlogComment,
    AddQuestionComment,
    AddAnswerComment,
    getAllBlogComment,
    getAllQuestionComment,
    getAllAnswerComment,
    updateComment,
    deleteComment
}
