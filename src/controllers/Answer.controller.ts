import { NextFunction, Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../utils";
import { Answer } from "../models/Answer.model";
import { answerSchema } from "../schema/AnwerSchema";
import mongoose from "mongoose";

const createAnswer = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { questionId } = req.params;
    const { answer } = answerSchema.parse(req.body);
    const answers = await Answer.create({
      answer,
      question: questionId,
      // @ts-ignore
      owner: req.user?._id,
    });
    if (!answers) {
      return next(new ApiError(400, "answers not created"));
    }
    return res
      .status(201)
      .json(new ApiResponse(201, answers, "answers created successfully"));
  }
);

const getAllAnswer = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { questionId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const answers = await Answer.aggregate([
      {
        $match: {
          question: new mongoose.Types.ObjectId(questionId),
        },
      },

      {
        $skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      },
      {
        $limit: parseInt(limit as string),
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $lookup: {
          from: "questions",
          localField: "question",
          foreignField: "_id",
          as: "question",
          pipeline: [
            {
              $lookup: {
                from: "tags",
                localField: "tags",
                foreignField: "_id",
                as: "tags",
              },
            },
          ],
        },
      },

      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
          question: {
            $first: "$question",
          },
        },
      },

      {
        $project: {
          answer: 1,
          owner: {
            fullname: 1,
            username: 1,
            avatar: {
              url: 1,
            },
          },
          question: {
            _id: 1,
            tags: {
              name: 1,
            },
          },
        },
      },
    ]);
    if (!answers) {
      return next(new ApiError(400, "answers not found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, answers, "answers found successfully"));
  }
);

const updateAnswer = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { AnswerId } = req.params;
    const { answer } = answerSchema.parse(req.body);

    const answers = await Answer.findByIdAndUpdate(
      AnswerId,
      {
        $set: {
          answer,
        },
      },
      {
        new: true,
      }
    );
    if (!answers) {
      return next(new ApiError(400, "answers not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, answers, "answers updated successfully"));
  }
);

const deleteAnswer = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { AnswerId } = req.params;
    const answers = await Answer.findByIdAndDelete(AnswerId);
    if (!answers) {
      return next(new ApiError(400, "answers not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, answers, "answers deleted successfully"));
  }
);

export { createAnswer, getAllAnswer, updateAnswer, deleteAnswer };
