import { NextFunction, Request, Response } from "express";
import {
  ApiError,
  ApiResponse,
  asyncHandler,
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils";
import { createBlogSchema, getAllBlog, updateBlogSchema } from "../schema";
import { Blog } from "../models/Blog.models";
import mongoose from "mongoose";


const getAllBlogs = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      limit = 10,
      page = 1,
      shortBy,
      shortType,
      query,
      userId,
    } = req.query;

    const blog = await Blog.aggregate([
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
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [
            {
              $project: {
                fullname: 1,
                username: 1,
                avatar: 1,
                creadit: 1,
              },
            },
          ],
        },
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
        $lookup: {
          from: "tags",
          localField: "tags",
          foreignField: "_id",
          as: "tags",
        },
      },

      {
        $addFields: {
          author: {
            $first: "$author",
          },
        },
      },

      {
        $project: {
          name: 1,
          title: 1,
          content: 1,
          image: {
            url: 1,
          },
          tags: {
            name: 1,
          },
          isPublic: 1,
          author: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (!blog) {
      return next(new ApiError(400, "blog not found"));
    }

    return res.status(200).json(new ApiResponse(200, blog, "get all blogs"));
  }
);
const getBlogById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { BlogId } = req.params;

    if (!BlogId) {
      return next(new ApiError(400, "BlogId is required"));
    }

    const blog = await Blog.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(BlogId) },
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
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "blog",
          as: "comments",
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
                content: 1,
                owner: {
                  fullname: 1,
                  username: 1,
                  avatar: {
                    url: 1
                  },
                },
              },
            },
          ]
        },
      },

      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "blog",
          as: "like",
        },
      },
      {
        $addFields: {
          author: {
            $first: "$author",
          },
        },
      },

      {
        $project: {
          name: 1,
          title: 1,
          content: 1,
          image: 1,
          isPublic: 1,
          author: {
            fullname: 1,
            username: 1,
            avatar: {
              url: 1,
            },
          },
          tags: {
            name: 1,
          },
          like: 1,
          comments: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    if (!blog) {
      return next(new ApiError(400, "Blog not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, blog[0], "Blog by id feched successfully"));
  }
);
const createBlog = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, title, content, tags } = createBlogSchema.parse(req.body);

    const files = req.files as { [key: string]: Express.Multer.File[] };

    const image = files.image[0]?.path;

    if (!image) {
      return next(new ApiError(400, "image is required"));
    }

    const uploadImage = await uploadToCloudinary(image);

    if (!uploadImage) {
      return next(new ApiError(400, "image upload failed"));
    }

    const blog = await Blog.create({
      name,
      title,
      content,
      image: {
        url: uploadImage.url,
        public_id: uploadImage.public_id,
      },
      tags: tags || [],
      author: req.user?._id,
    });

    if (!blog) {
      return next(new ApiError(400, "blog create failed"));
    }
    return res
      .status(201)
      .json(new ApiResponse(201, blog, "blog created successfully"));
  }
);
const updateBlog = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("hello");
    const { blogId } = req.params;
    // console.log(blogId)
    const { name, title, content } = updateBlogSchema.parse(req.body);
    if (!blogId) {
      return next(new ApiError(400, "blogId is required"));
    }

    const blog = await Blog.findById(blogId);

    //* add image and remove image
    //@ts-ignore
    deleteFromCloudinary(blog?.image?.public_id);
    const files = req.files as { [key: string]: Express.Multer.File[] };
    const image = files.image[0]?.path;

    const uploadImage = await uploadToCloudinary(image);

    if (!uploadImage) {
      return next(new ApiError(400, "image upload failed"));
    }
    const updateBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $set: {
          name,
          title,
          content,
          image: {
            url: uploadImage.url,
            public_id: uploadImage.public_id,
          },
        },
      },
      {
        new: true,
      }
    );

    if (!updateBlog) {
      return next(new ApiError(400, "blog update failed"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updateBlog, "blog updated successfully"));
  }
);
const DeleteBlogs = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { blogId } = req.params;

    if (!blogId) {
      return next(new ApiError(400, "blogId is required"));
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return next(new ApiError(400, "blog not found"));
    }
    //@ts-ignore
    deleteFromCloudinary(blog.image?.public_id);

    const deleteBlog = await Blog.findByIdAndDelete(blogId);

    if (!deleteBlog) {
      return next(new ApiError(400, "blog delete failed"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "delete blog successfully"));
  }
);
const toggleBlog = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { blogId } = req.params;

    if (!blogId) {
      return next(new ApiError(400, "blogId is required"));
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return next(new ApiError(400, "blog not found"));
    }

    const toggleBlog = await Blog.findByIdAndUpdate(blogId, {
      $set: {
        isPublic: !blog.isPublic,
      },
    });

    if (!toggleBlog) {
      return next(new ApiError(400, "toggle blog failed"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, toggleBlog, "toggle blog successfully"));
  }
);

const topBlog = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { limit = 6, page = 1 } = req.query;
    const blogs = await Blog.aggregate([
      {
        $match: {},
      },

      {
        $limit: parseInt(limit as string),
      },
      {
        $skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      },

      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "blog",
          as: "Comment",
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "blog",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "links",
          localField: "_id",
          foreignField: "blog",
          as: "links",
          pipeline: [
            {
              $project: {
                click: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          Comment: {
            $multiply: [{ $size: "$Comment" }, 3],
          },
          likes: {
            $size: "$likes",
          },
          links: {
            $multiply: [{ $size: "$links" }, 2],
          },
        },
      },

      {
        $addFields: {
          totalCreadit: {
            $sum: {
              $add: ["$Comment", "$likes", "$links"],
            },
          },
        },
      },

      {
        $sort: {
          totalCreadit: -1,
        },
      },

      {
        $project: {
          name: 1,
          title: 1,
          content: 1,
          image: {
            url: 1,
          },
          isPublic: 1,
          author: {
            fullname: 1,
            username: 1,
            avatar: {
              url: 1,
            },
          },
          totalCreadit: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (!blogs) {
      return next(new ApiError(400, "blogs not found"));
    }

    return res.status(200).json(new ApiResponse(200, blogs, "get all blogs"));
  }
);

export {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  DeleteBlogs,
  toggleBlog,
  topBlog,
};
