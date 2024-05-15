import mongoose, { Schema } from "mongoose";
import { string } from "zod";



interface Iblog extends Document{
    name:string
    title:string
    content:string
    image:object
    tags:object
    author:object
    isPublic:boolean
}


const BlogSchema = new Schema <Iblog>({

    name:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true

    },
    content:{
        type:String,
        required:true
    },
    image:{
        type:{
            url:String,
            public_id:String
        },
        required:true
    },
    tags:{
        type:Schema.Types.ObjectId,
        ref:"Tags",
    },
    isPublic:{
        required:true,
        type:Boolean,
        default:true
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{
    timestamps:true
})



export const Blog = mongoose.model<Iblog>("Blog", BlogSchema)