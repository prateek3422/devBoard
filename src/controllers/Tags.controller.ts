import { NextFunction, Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../utils";
import { TagsSchema } from "../schema/tagSchema";
import { Tags } from "../models/tags.model";

const createTags = asyncHandler(async (req:Request, res:Response, next:NextFunction) =>{
    const { name } = TagsSchema.parse(req.body)
    const tags = await  Tags.create({
        name,
        //@ts-ignore
        owner: req.user.id
    })

    console.log(tags)
    if(!tags){
        return next(new ApiError(400, "tags not created"))
    }

    return res.status(201).json(new ApiResponse(201, tags, "tags created successfully"))

})


export {
    createTags
}