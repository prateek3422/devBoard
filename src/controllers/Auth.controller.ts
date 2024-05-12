import { NextFunction, Request, Response } from "express";
import { registerSchema, signinrSchema, verifyOtp } from "../schema";
import { ApiError, ApiResponse, asyncHandler, uploadToCloudinary } from "../utils";
import { User } from "../models/Auth.models";
import { expairyToken, generateOtp } from "../constant";

import { sendEmail, SendEmailVerification, } from "../mails/SenMails";




const genrateAccessAndRefreshToken = async (userId: string) => {

  try {
    const user = await User.findById(userId);

    //@ts-ignore
    const accessToken = await user.CreateAccessToken()
    //@ts-ignore
    const refreshToken = await user.CreateRefreshToken()
    console.log(refreshToken)

    //@ts-ignore
    user.refreshToken = refreshToken

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error)
    throw new ApiError(500, "Something error while genrating token");
  }
};
const createUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

  const { fullname, username, email, password } = registerSchema.parse(req.body)

  if (!fullname || !username || !email || !password) {
    return next(new ApiError(400, "All fields are required"))
  }

  const isEmail = await User.findOne({ $or: [{ email }, { username }] });

  if (isEmail) {
    throw new ApiError(400, "Email already exists");
  }

  const files = req.files as {
    [key: string]: Express.Multer.File[];
  };


  const localFilePath = files?.avatar[0].path;

  const uploadAvatar = await uploadToCloudinary(localFilePath);
  if (!uploadAvatar) {
    return next(new ApiError(400, "avatar upload failed"));
  }

  const user = await User.create({
    fullname,
    username,
    email,
    password,
    avatar: {
      url: uploadAvatar.url,
      public_id: uploadAvatar.public_id,
    },
  });



  user.otp = generateOtp;
  user.emailVerifyOtpExpairy = Date.now() + expairyToken;


  user.save({ validateBeforeSave: false });


  sendEmail({
    email: user.email,
    subject: "Email verification",
    MailgenContent: SendEmailVerification(user.username, generateOtp),
  });

  const createdUser = await User.findById(user._id).select("-password, -refreshTokens, -otp,  -emailVerifyOtpExpairy")

  if (!createdUser) {
    return next(new ApiError(400, "Something went wrong while creating user"));
  }


  res.status(200).json(
    new ApiResponse(200, user, "user registerd successfully")
  )
})

const verifyEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { otp } = verifyOtp.parse(req.body)

  const user = await User.findOne({
    otp: otp,
    emailVerifyOtpExpairy: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError(400, "invalid otp"));
  }

  user.isEmailVerified = true;
  user.otp = undefined;
  user.emailVerifyOtpExpairy = undefined;

  user.save({ validateBeforeSave: false });

   return res
    .status(201)
    .json(new ApiResponse(201, user, "Email verified successfully"));
});

const resendEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) =>{
  
})

const signinUser = asyncHandler(async (req: Request, res: Response, next: NextFunction)  =>{
  const { username, email, password } = signinrSchema.parse(req.body)

  const user = await User.findOne({ $or: [{ email }, { username }] });

  if (!user) {
    return next(new ApiError(400, "invalid credentials"));
  }
  const isMatchPassword = await user.checkPassword(password)

  if (!isMatchPassword) {
    return next(new ApiError(400, "invalid credentials"));
  }

  const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(user.id);

  const logedInUser = await User.findById(user._id).select(
    "-password -refreshTokens -otp  -emailVerifyOtpExpairy"
  );


  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(new ApiResponse(200, logedInUser, "user signin successfully"))
})



export {
  createUser,
  verifyEmail,
  signinUser
}