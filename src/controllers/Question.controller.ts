import { NextFunction, Request, Response } from "express";
import {QuestionSchema} from "../schema";
import { ApiError, ApiResponse, asyncHandler } from "../utils";
import { Question } from "../models/Question.model";


const createQuestion = asyncHandler(async (req:Request, res:Response, next:NextFunction)=>{
    const { title, question, description, answer, tags} = QuestionSchema.parse(req.body)

    const questions = await Question.create({
        title,
        question,
        description,
        answer,
        tags
    })
    if(!questions){
        return next(new ApiError(400, "question not created"))
    }
    return res.status(201).json(new ApiResponse(201, questions, "question created successfully"))
})



export{
    createQuestion
}