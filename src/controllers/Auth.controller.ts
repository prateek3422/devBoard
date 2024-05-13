import { NextFunction, Request, Response } from "express";
import { changePasswordSchema, forgotPasswordSchema, registerSchema, signinrSchema,updateUserSchema, verifyOtp } from "../schema";
import { ApiError, ApiResponse, asyncHandler, deleteFromCloudinary, uploadToCloudinary } from "../utils";
import { User } from "../models/Auth.models";
import { generateOtp } from "../constant";
import jwt from "jsonwebtoken"
import { sendEmail, SendEmailVerification, } from "../mails/SenMails";




const genrateAccessAndRefreshToken = async (userId: string) => {

  try {
    const user = await User.findById(userId);

    //@ts-ignore
    const accessToken = await user.CreateAccessToken()
    //@ts-ignore
    const refreshToken = await user.CreateRefreshToken()

    //@ts-ignore
    user.refreshToken = refreshToken

    //@ts-ignore
    await user.save({ validateBeforeSave: false })

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
  const token = await user.generatetokens(generateOtp,user.id)

  await user.save({ validateBeforeSave: false });


  sendEmail({
    email: user.email,
    subject: "Email verification",
    MailgenContent: SendEmailVerification(user.username, generateOtp),
  });

  const createdUser = await User.findById(user._id).select("-password -refreshTokens -otp")

  if (!createdUser) {
    return next(new ApiError(400, "Something went wrong while creating user"));
  }

  const options ={
    httpOnly: true,
    secure: true,
    maxAge: 1000*60*60
  }

  res.status(200).cookie("verifyUser", token, options ).json(
    new ApiResponse(200, user, "user registerd successfully")
  )
})

const verifyEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { otp } = verifyOtp.parse(req.body)
 const token = req.cookies?.verifyUser

 if(!token){
  return next(new ApiError(401, "invalid token"))
 }

 const decodedToken  = await jwt.verify(token, process.env.OTPSECRET as string )
//@ts-ignore
 if(decodedToken?.otp !== otp){
  return next(new ApiError(401, "invalid otp"))
 }

//@ts-ignore
  const user = await User.findById(decodedToken.id)

  if (!user) {
    return next(new ApiError(400, "invalid otp"));
  }

  user.isEmailVerified = true;
  user.otp = undefined;

  await user.save({ validateBeforeSave: false });

  const options={
    httpOnly: true,
    secure: true,
    maxAge: 1000*60*60
  }
  return res
    .status(201).clearCookie("verifyUser", options)
    .json(new ApiResponse(201, user, "Email verified successfully"));
});

const resendEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  //@ts-ignore
  const user = await User.findById(req?.user?._id)
  if (!user) {
    return next(new ApiError(400, "user not found"));
  }

  user.otp = generateOtp;
  
  const token = await user.generatetokens(generateOtp, user.id)

  await user.save({ validateBeforeSave: false });


  sendEmail({
    email: user.email,
    subject: "Email verification",
    MailgenContent: SendEmailVerification(user.username, generateOtp),
  });

const options = {
  httpOnly: true,
  secure: true,
  maxAge: 1000*60*60
}
  return res
    .status(204).cookie("verifyUser",token, options)
    .json(new ApiResponse(200, {}, "email resend successfully"));
});

const signinUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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

const signOutUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

  await User.findByIdAndUpdate(
    //@ts-ignore
    req.user?._id,
    {
      $unset: {
        refreshToken: 1
      }
    }, {
    new: true
  }
  )

  const options = {
    httpOnly: true,
    secure: true,
  }


  return res.status(204)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(204, {}, "signout successfully"))
})

const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = forgotPasswordSchema.parse(req.body)

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError(400, "user not found"));
  }

  user.otp = generateOtp;
   const token = user.generatetokens(generateOtp, user.id)
  await user.save({ validateBeforeSave: false });

  sendEmail({
    email: user.email,
    subject: "Email verification",
    MailgenContent: SendEmailVerification(user.username, generateOtp),
  });

  const option ={
    httpOnly: true,
    secure: true,
    maxAge: 1000*60*60
  }

  return res.status(204).cookie("verifyUser", token, option).json(new ApiResponse(204, {}, "forgot password successfully"))

})

const changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

  const { oldPassword, newPassword } = changePasswordSchema.parse(req.body)

  //@ts-ignore
  const user = await User.findById(req.user?._id).select("-password")

 const  checkOldPassword = await user?.checkPassword(oldPassword)

 if(!checkOldPassword){
  return next(new ApiError(404, "password not match"))
 }
 //@ts-ignore
 user.password = newPassword
 //@ts-ignore
 await user.save({ validateBeforeSave: false })
 return res.status(204).json(new ApiResponse(204, {}, "password change successfully"))
})

const updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) =>{
    const {fullname} = updateUserSchema.parse(req.body)

    //@ts-ignore
    const user = await User.findById(req.user?._id)

    if(!user){
      return next(new ApiError(404, "user not found"))
    }

    //@ts-ignore
    await deleteFromCloudinary(avatar.public_id)

    const files = req.files as {
      [key: string]: Express.Multer.File[];
    };
  
  
    const localFilePath = files?.avatar[0].path;
  
    const uploadAvatar = await uploadToCloudinary(localFilePath);
    if (!uploadAvatar) {
      return next(new ApiError(400, "avatar upload failed"));
    }

    const updated = await User.findByIdAndUpdate(
      //@ts-ignore
      req.user?._id,
      {
        fullname,
        avatar: {
          url: uploadAvatar.url,
          public_id: uploadAvatar.public_id,
        }
      },
      {
        new:true
      }
    )

    return res.status(200).json(
      new ApiResponse(200, updated, "user updated successfully")
    )
})

const deleteUser = asyncHandler ( async (req: Request, res: Response, next: NextFunction) => {
  //@ts-ignore
await User.findByIdAndDelete(req.user?._id)
return res.status(200).json(new ApiResponse(200, {}, "user delete successfully"))
})



export {
  createUser,
  verifyEmail,
  signinUser,
  signOutUser,
  resendEmail,
  forgotPassword,
  changePassword,
  updateUser,
  deleteUser
}