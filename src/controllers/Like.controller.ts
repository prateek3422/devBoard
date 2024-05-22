import { NextFunction, Request, Response } from "express"
import { ApiError, ApiResponse, asyncHandler } from "../utils"
import { Like } from "../models/Like.models"



const toggleBlogLike = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { BlogId } = req.params

    if (!BlogId) {
        return next(new ApiError(400, "BlogId is required"))
    }

    const like = await Like.findOne({
        owner: req.user?._id,
        blog: BlogId
    })

    if (like) {
        await Like.findByIdAndDelete(like._id)
        return res.status(200).json(new ApiResponse(200, {}, "unlike blog successfully"))
    }

    const newLike = await Like.create({
        owner: req.user?._id,
        blog: BlogId
    })

    return res.status(200).json(new ApiResponse(200, newLike, "like blog successfully"))
})


const toggleQuestionLike = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { QuestionId } = req.params

    if (!QuestionId) {
        return next(new ApiError(400, "questionId is required"))
    }

    const like = await Like.findOne({
        owner: req.user?._id,
        question: QuestionId
    })

    if (like) {
        await Like.findByIdAndDelete(like._id)
        return res.status(200).json(new ApiResponse(200, {}, "unlike question successfully"))
    }

    const newLike = await Like.create({
        owner: req.user?._id,   
        question: QuestionId
    })


    return res.status(201).json(new ApiResponse(200, newLike, "Like question successfully"))


})

const toggleAnswerLike = asyncHandler(async (req: Request, res: Response, next: NextFunction) =>{
    const {AnswerId} = req.params

    if(!AnswerId){
        return next(new ApiError(400, "AnswerId is required"))
    }

    const like  = await Like.findOne({
        owner:req.user?._id,
        answer:AnswerId
    })

    if(like){
        await Like.findByIdAndDelete(like?._id)
        return res.status(200).json(new ApiResponse(200, {}, "Answer unlike successfully"))
    }

    const newLike = await Like.create({
        owner:req.user?._id,
        answer:AnswerId
    })

    return res.status(200).json(new ApiResponse(200, newLike, "Answer Like successfully"))

})

const toggleCommentLike = asyncHandler(async (req: Request, res: Response, next: NextFunction) =>{
    const {CommentId} = req.params

    if(!CommentId){
        return next(new ApiError(400, "commentId is required"))
    }

    const like  =  await Like.findOne({
        owner:req.user._id,
        comment:CommentId
    })

    if(like){
        await Like.findByIdAndDelete(like._id)

        return res.status(200).json(new ApiResponse(200, {}, "Comment unlike Successfully"))
    }

    const newLike =  await Like.create({
        owner:req.user._id,
        comment:CommentId
    })

    return res.status(200).json(new ApiResponse(200, newLike, "Comment Like Successfully"))


})
export {
    toggleBlogLike,
    toggleQuestionLike,
    toggleAnswerLike,
    toggleCommentLike
}