import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils";

const crateTags = asyncHandler(async (req:Request, res:Response, next:NextFunction) =>{
    const { name } = req.body;
})