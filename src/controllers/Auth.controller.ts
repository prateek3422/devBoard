import { NextFunction, Request, Response } from "express";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  registerSchema,
  resendEmailSchema,
  signinrSchema,
  updateUserSchema,
  verifyForgotPasswordSchema,
  verifyOtp,
} from "../schema";
import {
  ApiError,
  ApiResponse,
  asyncHandler,
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils";
import { User } from "../models/Auth.models";
import { generateOtp } from "../constant";
import jwt from "jsonwebtoken";
import { sendEmail, SendEmailVerification } from "../mails/SenMails";
import mongoose from "mongoose";

const genrateAccessAndRefreshToken = async (userId: string) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "user not found");
    }

    const accessToken = await user.CreateAccessToken();
    const refreshToken = await user.CreateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Something error while genrating token");
  }
};

const createUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { Fullname, Username, email, password } = registerSchema.parse(
      req.body
    );

    const isEmail = await User.findOne({ $or: [{ email }, { Username }] });

    if (isEmail) {
      return next(new ApiError(400, "email or username already exist"));
    }

    let uploadAvatar = {
      url: "",
      public_id: "",
    };

    // @ts-ignore
    if (req?.files?.avatar?.length > 0) {
      const files = req.files as {
        [key: string]: Express.Multer.File[];
      };

      const localFilePath = files?.avatar[0].path;

      const data = await uploadToCloudinary(localFilePath);

      uploadAvatar.public_id = data?.public_id!;
      uploadAvatar.url = data?.url!;

      if (!uploadAvatar) {
        return next(new ApiError(400, "avatar upload failed"));
      }
    }

    const user = new User({
      Fullname,
      Username,
      email,
      password,
      avatar: {
        url: uploadAvatar.url,
        public_id: uploadAvatar.public_id,
      },
    });

    user.otp = generateOtp();
    const token = await user.generatetokens(user.otp, user.id);
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      email: user.email,
      subject: "Email verification",
      MailgenContent: SendEmailVerification(user.Username, user.otp),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshTokens -otp"
    );

    if (!createdUser) {
      return next(
        new ApiError(400, "Something went wrong while creating user")
      );
    }

    const options = {
      httpOnly: true,
        sameSite: "none" as const,
      secure: true,
      maxAge: 1000 * 60 * 60,
    };

    res
      .status(200)
  
      .cookie("verifyUser", token, options)
      .json(new ApiResponse(200, {}, "user registerd successfully"));
  }
);

const verifyEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { otp } = verifyOtp.parse(req.body);
    const token = req.cookies?.verifyUser;

    if (!token) {
      return next(new ApiError(401, "invalid token"));
    }

    const decodedToken = await jwt.verify(
      token,
      process.env.OTPSECRET as string
    );

    //@ts-ignore
    if (decodedToken?.otp !== otp) {
      return next(new ApiError(401, "invalid otp"));
    }

    //@ts-ignore
    const user = await User.findById(decodedToken.id);

    if (!user) {
      return next(new ApiError(400, "invalid otp"));
    }

    user.isEmailVerified = true;
    user.otp = undefined;

    await user.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true,
       
      secure: true,
      maxAge: 1000 * 60 * 60,
    };
    return res
      .status(201)
      .clearCookie("verifyUser", options)
      .json(new ApiResponse(201, user, "Email verified successfully"));
  }
);

const resendEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = resendEmailSchema.parse(req.body);

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ApiError(400, "user not found"));
    }

    if (user.isEmailVerified) {
      return next(new ApiError(400, "email is already verified"));
    }

    user.otp = generateOtp();

    const token = await user.generatetokens(user.otp, user.id);

    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user.email,
        subject: "Email verification",
        MailgenContent: SendEmailVerification(user.Username, user.otp),
    });

    const options = {
      httpOnly: true,
        sameSite: "none",
      secure: true,
        maxAge: 1000 * 60 * 60,
    };
   
      return res
      .status(204)
          //@ts-ignore
      .cookie("verifyUser", token, options)
      .json(new ApiResponse(200, {}, "email resend successfully"));
  }
);

const signinUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { Username, email, password } = signinrSchema.parse(req.body);

    const user = await User.findOne({ $or: [{ email }, { Username }] });

    if (!user) {
      return next(new ApiError(400, "invalid credentials"));
    }

    if (!user.isEmailVerified) {
      return next(new ApiError(400, "email is not verified"));
    }

    const isMatchPassword = await user.checkPassword(password);

    if (!isMatchPassword) {
      return next(new ApiError(400, "invalid credentials"));
    }

    const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(
      user.id
    );

    const logedInUser = await User.findById(user._id).select(
      "-password -refreshToken -otp "
    );

    const options = {
      httpOnly: true,
      sameSite: "none" as const,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, logedInUser, "user signin successfully"));
  }
);

const handleSocilaLogin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const user = await User.findById(req.user?._id);
    if (!user) {
      return next(new ApiError(404, "user not found"));
    }

    const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(
      user.id
    );

    const options = {
      httpOnly: true,
        sameSite:"none" as const,
      secure: true,
    };

    return res
      .status(301)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .redirect(`${process.env.CLIENT_REDIRECT_URL}`);
  }
);

const getCurrentUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const user = await User.aggregate([
      {
        //@ts-ignore
        $match: {_id: new mongoose.Types.ObjectId(req.user?._id)},
      },
      {
        $lookup:{
          from:"blogs",
          localField:"_id",
          foreignField:"author",
          as:"blogs",
        }

      },
      {
        $lookup:{
          from:"likes",
          localField:"_id",
          foreignField:"author",
          as:"likes",
        }
      },
      {
        $lookup:{
          from:"questions",
          localField:"_id",
          foreignField:"owner",
          as:"questions",
          pipeline:[
            {
              
              $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"question",
                as:"likes",
              }
            }
          ]
        }
      },
      {
        $lookup:{
          from:"answers",
          localField:"_id",
          foreignField:"owner",
          as:"answers",
        }
      },
      {
        $addFields:{
          totalBlogs:{
            $size:"$blogs"
          },
      
          totalLikes:{
            $size:"$likes"
          },
          totalQuestions:{
            $size:"$questions"
          }
    
        }
      },
      {
        $project:{
          _id:1,
          Fullname:1,
          Username:1,
          creadit:1,
          email:1,
          avatar:1,
          totalBlogs:1,
          totalLikes:1,
          totalQuestions:1
        }
      }
    ])

    console.log(user);
    return res
      .status(200)
      .json(new ApiResponse(200, user, "signout successfully"));
  }
);

const signOutUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(
      //@ts-ignore
      req.user?._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
        sameSite:"none" as const,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "signout successfully"));
  }
);

const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ApiError(400, "check your email"));
    }

    user.otp = generateOtp();
    const token = await user.generatetokens(user.otp, user.id);
    await user.save({ validateBeforeSave: false });

    sendEmail({
      email: user.email,
      subject: "Email verification",
      MailgenContent: SendEmailVerification(user.Username, generateOtp()),
    });

    const option = {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60,
    };

    return res
      .status(200)
      .cookie("verifyUser", token, option)
      .json(new ApiResponse(200, {}, "forgot password successfully"));
  }
);

const verifyForgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { otp, password } = verifyForgotPasswordSchema.parse(req.body);

    const token = req.cookies?.verifyUser;
    if (!token) {
      return next(new ApiError(401, "invalid token"));
    }

    const decodedToken = await jwt.verify(
      token,
      process.env.OTPSECRET as string
    );
    //@ts-ignore
    if (decodedToken?.otp !== otp) {
      return next(new ApiError(401, "invalid otp"));
    }

    //@ts-ignore
    const user = await User.findById(decodedToken.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return next(new ApiError(400, "invalid otp"));
    }

    user.password = password;
    user.otp = undefined;

    await user.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true,
        sameSite: "none" as const,
      secure: true,
      maxAge: 1000 * 60 * 60,
    };
    return res
      .status(201)
      .clearCookie("verifyUser", options)
      .json(new ApiResponse(201, user, "Email verified successfully"));
  }
);

const countCredit = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const creadit = await User.aggregate([
      {
        $match: {
          //@ts-ignore
          _id: new mongoose.Types.ObjectId(req.user?._id),
        },
      },

      {
        $lookup: {
          from: "blogs",
          localField: "_id",
          foreignField: "author",
          as: "creadit",
          pipeline: [
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
              $project: {
                totalCreadit: {
                  $sum: {
                    $add: ["$Comment", "$likes", "$links"],
                  },
                },
              },
            },
          ],
        },
      },

      {
        $addFields: {
          creadit: {
            $first: "$creadit",
          },
        },
      },

      {
        $project: {
          _id: 1,
          fullname: 1,
          Username: 1,
          avatar: 1,
          creadit: {
            totalCreadit: 1,
          },
        },
      },
    ]);

    //@ts-ignore
    const user = await User.findById(req.user?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return next(new ApiError(404, "user not found"));
    }

    user.creadit = creadit[0].creadit?.totalCreadit;

    user?.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, creadit[0], "count credit successfully"));
  }
);

const changePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);
    //@ts-ignore
    const user = await User.findById(req.user?._id);

    const isMatchPassword = await user?.checkPassword(oldPassword);

    if (!isMatchPassword) {
      return next(new ApiError(404, "password not match"));
    }

    if (!user) {
      return next(new ApiError(404, "user not found"));
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "password change successfully"));
  }
);

const updateAvatar = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const user = await User.findById(req.user?._id);

    if (!user) {
      return next(new ApiError(404, "user not found"));
    }

    //@ts-ignore
    if (user.avatar.public_id !== "") {
      // @ts-ignore
      await deleteFromCloudinary(user?.avatar.public_id);
    } else {
      await User.findByIdAndUpdate(
        //@ts-ignore
        req.user?._id,
        {
          avatar: {
            url: "",
            public_id: "",
          },
        },
        {
          new: true,
        }
      );
    }

    const files = req.files as {
      [key: string]: Express.Multer.File[];
    };

    const localFilePath = files?.avatar[0].path;

    const uploadAvatar = await uploadToCloudinary(localFilePath);
    if (!uploadAvatar) {
      return next(new ApiError(400, "avatar upload failed"));
    }

    const avatar = await User.findByIdAndUpdate(
      //@ts-ignore
      req.user?._id,
      {
        avatar: {
          url: uploadAvatar?.url,
          public_id: uploadAvatar?.public_id,
        },
      },
      {
        new: true,
      }
    );

    if (!avatar) {
      return next(new ApiError(400, "avatar upload failed"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, avatar, "avatar update successfully"));
  }
);

const updateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { Fullname } = updateUserSchema.parse(req.body);

    const updated = await User.findByIdAndUpdate(
      //@ts-ignore
      req.user?._id,
      {
        Fullname: Fullname,
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, updated, "user updated successfully"));
  }
);

const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const user = await User.findById(req.user?._id);

    //@ts-ignore
    deleteFromCloudinary(user?.avatar?.public_id);
    //@ts-ignore
    await User.findByIdAndDelete(req.user?._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "user delete successfully"));
  }
);

export {
  createUser,
  verifyEmail,
  signinUser,
  getCurrentUser,
  signOutUser,
  resendEmail,
  verifyForgotPassword,
  forgotPassword,
  changePassword,
  updateUser,
  updateAvatar,
  deleteUser,
  countCredit,
  handleSocilaLogin,
};
