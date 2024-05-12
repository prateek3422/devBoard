import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils";
import jwt from "jsonwebtoken"
import { User } from "../models/Auth.models";

const jwtVerify = async (req:Request, res:Response, next:NextFunction) =>{

    try {
        const token = req?.cookies?.accessToken 

        if(!token){
            return next(new ApiError(401,"invalid token"))

        }

        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET as string)

        if(!decodedToken){
            return next(new ApiError(401,"unauthorized token"))
        }

        // const user = await User.findById({decodedToken._id})
    } catch (error) {
        console.log(error)
    }
}