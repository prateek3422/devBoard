import mongoose, { Schema } from "mongoose";


 interface Iuser extends Document {
    fullname : string;
    username : string;
    avatar: object;
    email : string;
    password : string;
    isEmailVerified : boolean;
    LoginType : string;
    token : string;

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
  
  export const User = mongoose.model<Iuser>("User", userSchema);
  