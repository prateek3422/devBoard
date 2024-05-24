import { NextFunction, Request, Response } from "express"
import { Comment } from "../models/comment.model"
import { commentSchema } from "../schema"
import { ApiError, ApiResponse, asyncHandler } from "../utils"



const AddBlogComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { content } = commentSchema.parse(req.body)
    const { blogId } = req.params

    if(!blogId){
        return next(new ApiError(400, "blogId is required"))
    }
    const comment = await Comment.create({
        content,
        blog: blogId,
        owner: req.user.id
    })
    if (!comment) {
        return next(new ApiError(400, "comment create failed"))
    }

    return res.status(200).json(
        new ApiResponse(200, comment, " blog comment created successfully")
    )
})

const addQuestionComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { content } = commentSchema.parse(req.body)
    const { questionId } = req.params
    
    if(!questionId){
        return next(new ApiError(400, "questionId is required"))
    }

    const comment = await Comment.create({
        content,
        question: questionId,
        owner: req.user.id
    })

    if (!comment) {
        return next(new ApiError(400, "comment create failed"))
    }

    return res.status(200).json(new ApiResponse(200, comment, "question comment created successfully") )
})

const addAnswerComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { content } = commentSchema.parse(req.body)
    const { answerId } = req.params
    
    if(!answerId){
        return next(new ApiError(400, "answerId is required"))
    }

    const comment = await Comment.create({
        content,
        answer: answerId,
        owner: req.user.id
    })

    if (!comment) { 
        return next(new ApiError(400, "comment create failed"))
    }

    return res.status(200).json(new ApiResponse(200, comment, "answer comment created successfully") )

})

const getAllComment  = asyncHandler(async (req:Request,res:Response,next:NextFunction) =>{
    const {limit=10,page=1} = req.query

    const commnet =  await Comment.aggregate([
        
    ])
})


export { AddBlogComment, addQuestionComment, addAnswerComment,}
