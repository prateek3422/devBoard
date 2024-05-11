import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

 interface Iuser extends Document {
    fullname : string;
    username : string;
    avatar: object;
    email : string;
    password : string;
    isEmailVerified : boolean;
    LoginType : string;
    token : string;
    createdAt:Date;
    updatedAt:Date;

 }

 interface IuserMethod {
  checkPassword(password: string): Promise<boolean>;
    CreateAccessToken: () => string
    CreateRefreshToken: () => string
    

 }


const userSchema = new Schema({
    fullname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    avatar: {
      required: false,
      type: {
        url: String,
        public_id: String,
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    LoginType: {
      type: String,
    },
    token: { type: String },
  });

  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });
  
  userSchema.methods.checkPassword = async function (password:string) {
    return await bcrypt.compare(password, this.password);
  };
  
  userSchema.methods.CreateAccessToken =  function () {
    return jwt.sign(
      { _id: this._id, username: this.username, email: this.email },
      process.env.ACCESS_TOKEN as string,
      { expiresIn: process.env.ACCESS_TOKEN_EXPAIRES }
    );
  };
  
  userSchema.methods.CreateRefreshToken =  function () {
   return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN as string, { expiresIn:process.env.REFRESH_TOKEN_EXPAIRES});
  };
  
  // userSchema.methods.temproryOtp = async function () {
  
  //   // genrate Random otp
  //   const generateOtp = Math.floor(1000 * Math.random() + 9000);
  
  //   // genrate Expary
  //   const expireToken = Date.now() + tokenExpaireTime
  
  //   return {generateOtp, expireToken}
  // }
  
  
  export const User = mongoose.model<Iuser>("User", userSchema);
  