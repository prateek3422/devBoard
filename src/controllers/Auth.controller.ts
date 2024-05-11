import { Request, Response } from "express";
import asyncHandler from "../utils/Asynchandler.js";
import { registerSchema } from "../schema/AuthSchema.js";

const createUser = asyncHandler( async (req:Request , res:Response) =>{
    const {fullname, username } = registerSchema.parse(req.body)
})
