import { NextFunction, Request, Response } from "express";
import { QuestionSchema } from "../schema";
import { ApiError, ApiResponse, asyncHandler } from "../utils";
import { Question } from "../models/Question.model";
import mongoose from "mongoose";
import slugify from "slugify";
import crypto from "crypto";

const createQuestion = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, question, tags } = QuestionSchema.parse(req.body);
    const slug =
      slugify(title, { lower: true }) +
      "-" +
      crypto.randomBytes(6).toString("hex");

    const questions = await Question.create({
      title,
      slug,
      question,
      tags,
      // @ts-ignore
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
              author: new mongoose.Types.ObjectId(userId as string),
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
          from: "likes",
          localField: "_id",
          foreignField: "question",
          as: "like",
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
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          question: 1,
          description: 1,
          tags: 1,
          owner: {
            Fullname: 1,
            Username: 1,
            avatar: {
              url: 1,
            },
          },
          answer: 1,
          like: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
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
    const { slug } = req.params;

    if (!slug) {
      return next(new ApiError(400, "question not found"));
    }

    const isSlugExist = await Question.findOne({ slug });

    if (!isSlugExist) {
      return next(new ApiError(400, "question not found"));
    }

    const question = await Question.aggregate([
      {
        $match: {
          slug: slug,
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
          from: "likes",
          localField: "_id",
          foreignField: "question",
          as: "like",
        },
      },
      {
        $lookup: {
          from: "answers",
          localField: "_id",
          foreignField: "question",
          as: "answer",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
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
                answer: 1,
                owner: {
                  _id: 1,
                  Fullname: 1,
                  Username: 1,
                  avatar: {
                    url: 1,
                  },
                },
                createdAt: 1,
                updatedAt: 1,
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
          like: 1,
          owner: {
            Fullname: 1,
            Username: 1,
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
      .json(new ApiResponse(200, question[0], "question found successfully"));
  }
);
const updateQuestion = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { questionId } = req.params;

    const { title, question, tags } = QuestionSchema.parse(req.body);
    const questions = await Question.findByIdAndUpdate(
      questionId,
      {
        title,
        question,
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

export {
  createQuestion,
  getAllQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
