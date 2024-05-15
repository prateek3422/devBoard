import mongoose, {  Schema } from "mongoose";

interface Itags extends Document{
    name:string,
    owner:object,
}

const TagsSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})



export const Tags = mongoose.model<Itags>("Tags", TagsSchema)