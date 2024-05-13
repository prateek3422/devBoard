import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"


interface Iuser extends Document {
  fullname: string;
  username: string;
  avatar: object;
  email: string;
  password: string;
  role: string
  isEmailVerified: boolean;
  LoginType: string;
  refreshToken: string;
  otp: number | undefined
  createdAt: Date;
  updatedAt: Date;
  checkPassword(password: string): Promise<boolean>;
  CreateAccessToken: () => string
  CreateRefreshToken: () => string
  generatetokens: (otp: number, id: string) => Promise<string>
}



const userSchema = new Schema<Iuser>({
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

  role:{
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },

  LoginType: {
    type: String,
    enum: ["email-password", "google", "github"],
    default: "email-password",
  },

  refreshToken: { type: String },
  otp: { type: Number },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.checkPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};


userSchema.methods.CreateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, username: this.username, email: this.email },
    process.env.ACCESS_TOKEN as string,
    { expiresIn: process.env.ACCESS_EXPAIRY! }
  );
};

userSchema.methods.CreateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN as string, { expiresIn: process.env.REFRESH_EXPAIRY! });
};


userSchema.methods.generatetokens = async function (otp: number, id: string) {
  return await jwt.sign({ otp, id }, process.env.OTPSECRET as string, { expiresIn: process.env.OTP_EXPAIRY })
}

export const User = mongoose.model<Iuser>("User", userSchema);