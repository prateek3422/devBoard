import { NextFunction, Request, Response } from "express";
import { QuestionSchema } from "../schema";
import { ApiError, ApiResponse, asyncHandler } from "../utils";
import { Question } from "../models/Question.model";
import mongoose from "mongoose";

const createQuestion = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, question, description, tags } = QuestionSchema.parse(
      req.body
    );

    const questions = await Question.create({
      title,
      question,
      description,
      tags,
      owner: req.user?._id,
    });
    if (!questions) {
      return next(new ApiError(400, "question not created"));
    }
    return res
      .status(201)
      .json(new ApiResponse(201, questions, "question created successfully"));
  }
);

const getAllQuestion = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      page = 1,
      limit = 10,
      shortBy,
      shortType,
      query,
      userId,
    } = req.query;

    const questions = await Question.aggregate([
      {
        $match: query
          ? {
              title: {
                $regex: query,
                $options: "i",
              },
            }
          : {},
      },
      {
        $sort: {
          [shortBy as string]: shortType === "asc" ? 1 : -1,
        },
      },
      {
        $skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      },
      {
        $limit: parseInt(limit as string),
      },
      {
        $match: userId
          ? {
              //@ts-ignore
              author: new mongoose.Types.ObjectId(userId),
            }
          : {},
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
          from: "tags",
          localField: "tags",
          foreignField: "_id",
          as: "tags",
        },
      },
      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
          tags:{
            $first: "$tags",
          }
        },
      },

      {
        $project:{
            _id: 1,
            title: 1,
            question: 1,
            description: 1,
            tags: {
              name: 1,
            },
            owner: {
              fullname: 1,
              username: 1,
              avatar: {
                url: 1,
              },
            },
            createdAt: 1,
            updatedAt: 1,
        }
      }
   


  
    ]);

    if (!questions) {
      return next(new ApiError(400, "question not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, questions, "question found successfully"));
  }
);

const getQuestionById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { questionId } = req.params;

    if (!questionId) {
      return next(new ApiError(400, "question not found"));
    }

    const question = await Question.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(questionId),
        },
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
          from: "tags",
          localField: "tags",
          foreignField: "_id",
          as: "tags",
        },
      },

      {
        $lookup: {
          from: "answers",
          localField: "_id",
          foreignField: "question",
          as: "answer",
        },
      },

      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,
          question: 1,
          description: 1,
          tags: {
            name: 1,
          },
          owner: {
            fullname: 1,
            username: 1,
            avatar: {
              url: 1,
            },
          },
          answer: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    if (!question) {
      return next(new ApiError(400, "question not found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, question, "question found successfully"));
  }
);
const updateQuestion = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { questionId } = req.params;

    const { title, question, description, tags } = QuestionSchema.parse(
      req.body
    );
    const questions = await Question.findByIdAndUpdate(
      questionId,
      {
        title,
        question,
        description,
        tags,
      },
      {
        new: true,
      }
    );
    if (!questions) {
      return next(new ApiError(400, "question not found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, questions, "question updated successfully"));
  }
);

const deleteQuestion = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { questionId } = req.params;
    const question = await Question.findByIdAndDelete(questionId);
    if (!question) {
      return next(new ApiError(400, "question not found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, question, "question deleted successfully"));
  }
);

const topQuestion = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { limit = 3 } = req.query;
    const questions = await Question.aggregate([
      {
        $match:{}
      },

   
    ]);
    console.log("hello")
    if (!questions) {
      return next(new ApiError(400, "question not found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, questions, "question found successfully"));
  }
);

export {
  createQuestion,
  getAllQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  topQuestion
};
