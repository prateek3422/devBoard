import mongoose, { Schema } from "mongoose";
import Blogaggregate from "mongoose-aggregate-paginate-v2"


interface Iblog extends Document{
    name:string
    title:string
    content:string
    image:object
    tags:string[]
    writter:object
    isPublic:boolean

    aggregatePaginate: (data: any) => Promise<any>;
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
    isPublic:{
        required:true,
        type:Boolean,
        default:true
    }
},{
    timestamps:true
})

BlogSchema.plugin(Blogaggregate)

export const Blog = mongoose.model<Iblog>("Blog", BlogSchema)