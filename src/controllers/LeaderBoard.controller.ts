import { NextFunction, Request, Response } from "express";
import { User } from "../models/Auth.models";

import { ApiResponse } from "../utils";


const getleaderBoardOnday = async (req: Request, res: Response, next: NextFunction) => {

    const leader = await User.aggregate([
        {
            $match: {}
        },


        {
            $sort: {
                creadit: -1
            }
        },
        {
            $limit: 10
        },
    ])

    res.status(200).json(new ApiResponse(200, leader, "success"));
};

export { getleaderBoardOnday };