import { NextFunction, Request, Response } from "express";
import { registerSchema } from "../schema";
import {ApiError,ApiResponse, asyncHandler, uploadToCloudinary} from "../utils";
import { User } from "../models/Auth.models";


const createUser = asyncHandler( async (req:Request , res:Response, next:NextFunction) =>{

    const {fullname, username,email,password} = registerSchema.parse(req.body)

    if(!fullname || !username || !email || !password){
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

    res.status(200).json(
      new ApiResponse(200,user,"user registerd successfully")
    )

    
})


export{
    createUser
}