import { NextFunction, Request, Response } from "express";

const asyncHandler = (reqHandler: (req: Request, res: Response, next: NextFunction) => Promise<any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await reqHandler(req, res, next)
    } catch (error) {
        next(error)
    }
}


export { asyncHandler}