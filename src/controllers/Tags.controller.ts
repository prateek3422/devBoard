import { NextFunction, Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../utils";
import { TagsSchema } from "../schema/tagSchema";
import { Tags } from "../models/tags.model";

const createTags = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = TagsSchema.parse(req.body);
    const tags = await Tags.create({
      name,
      // @ts-ignore
      owner: req.user.id,
    });
    if (!tags) {
      return next(new ApiError(400, "tags not created"));
    }

    return res
      .status(201)
      .json(new ApiResponse(201, tags, "tags created successfully"));
  }
);

const getTagsById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tagId } = req.params;

    if (!tagId) {
      return next(new ApiError(400, "tagId is required"));
    }

    const tags = await Tags.findById(tagId);

    if (!tags) {
      return next(new ApiError(400, "tags not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, tags, "tags by id feched successfully"));
  }
);

const getAllTag = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { limit = 10, page = 1, shortBy, shortType, query } = req.query;

    const tags = await Tags.aggregate([
      {
        $match: query
          ? {
              name: {
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
    ]);

    if (!tags) {
      return next(new ApiError(400, "tags not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, tags, "tags feched successfully"));
  }
);

const updateTags = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = TagsSchema.parse(req.body);
    const { tagId } = req.params;

    if (!tagId) {
      return next(new ApiError(400, "tagId is required"));
    }

    const tags = await Tags.findByIdAndUpdate(
      tagId,
      {
        $set: {
          name,
        },
      },
      {
        new: true,
      }
    );

    if (!tags) {
      return next(new ApiError(400, "tags not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, tags, "tags updated successfully"));
  }
);

const deleteTags = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tagId } = req.params;

    const tag = await Tags.findByIdAndDelete(tagId);

    if (!tag) {
      return next(new ApiError(400, "tag not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, tag, "tag deleted successfully"));
  }
);

export { createTags, getTagsById, getAllTag, updateTags, deleteTags };
