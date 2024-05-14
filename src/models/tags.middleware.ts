import mongoose, {  Schema } from "mongoose";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

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


TagsSchema.plugin(aggregatePaginate)

export const Tags = mongoose.model<Itags>("Tags", TagsSchema)