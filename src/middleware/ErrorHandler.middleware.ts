import {Request, Response, NextFunction, } from "express"
import ApiError from "../utils/ApiError.js"

const errirHandler = ( err: ApiError,
    req: Request,
    res: Response,
    next: NextFunction) =>{

    err.statusCode ||= 500
    err.message  ||= "Internal Server Error"


    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })

}



export default errirHandler