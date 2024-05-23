import mongoose, { Schema } from "mongoose";


interface IComment extends Document {
    content: string
    owner: object
    blog: object
    answer: object
    question: object
}

const commentSchema = new Schema<IComment>({

    content:{
        type:String,
        required:true

    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    blog:
        {
            type: Schema.Types.ObjectId,
            ref: "Blog",
        }
    ,

    answer: {
            type: Schema.Types.ObjectId,
            ref: "Answer",
        }
    ,

    question: {
        type: Schema.Types.ObjectId,
        ref: "Question",
    }
}, { timestamps: true })



export const Comment = mongoose.model<IComment>("Comment", commentSchema)