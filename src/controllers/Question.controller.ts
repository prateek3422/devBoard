import { NextFunction, Request, Response } from "express";
import { QuestionSchema } from "../schema";
import { ApiError, ApiResponse, asyncHandler } from "../utils";
import { Question } from "../models/Question.model";


const createQuestion = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { title, question, description, tags } = QuestionSchema.parse(req.body)

    const questions = await Question.create({
        title,
        question,
        description,
        tags,
        //@ts-ignore
        owner: req.user?._id
    })
    if (!questions) {
        return next(new ApiError(400, "question not created"))
    }
    return res.status(201).json(new ApiResponse(201, questions, "question created successfully"))
})

const getAllQuestion = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, shortBy, shortType, query, userId } = req.query

    const questions = await Question.aggregate([
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
                as: "author"
            }
        },
    ])

    if(!questions){ 
        return next(new ApiError(400, "question not found"

        ))}


    return res.status(200).json(new ApiResponse(200, questions, "question found successfully"))

})

const getQuestionById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { questionId } = req.params
    const question = await Question.findById(questionId)
    if (!question) {
        return next(new ApiError(400, "question not found"))
    }
    return res.status(200).json(new ApiResponse(200, question, "question found successfully"))
})


const updateQuestion = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { questionId } = req.params
    const question = await Question.findByIdAndUpdate(questionId, req.body, {
        new: true
    })
    if (!question) {
        return next(new ApiError(400, "question not found"))
    }
    return res.status(200).json(new ApiResponse(200, question, "question updated successfully"))
})

const deleteQuestion = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { questionId } = req.params
    const question = await Question.findByIdAndDelete(questionId)
    if (!question) {
        return next(new ApiError(400, "question not found"))
    }
    return res.status(200).json(new ApiResponse(200, question, "question deleted successfully"))
})



export {
    createQuestion,
    getAllQuestion,
    getQuestionById,
    updateQuestion,
    deleteQuestion

}