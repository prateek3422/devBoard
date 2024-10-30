import { NextFunction, Request, Response } from "express";
import { User } from "../models/Auth.models";

import { ApiResponse } from "../utils";

const getleaderBoardOnday = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { limit = 10, page = 1 } = req.params;

  const leader = await User.find()
    .limit(limit as number)
    .sort({ credit: -1 })
    .skip(((page as number) - 1) * (limit as number))
    .select(
      "-password -role -createdAt -updatedAt -isVerified -otp -token -phone -LoginType -creadit -isEmailVerified"
    );

  res.status(200).json(new ApiResponse(200, leader, "success"));
};

export { getleaderBoardOnday };
