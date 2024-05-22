import mongoose, { Schema } from "mongoose";


interface ILike extends Document {
    owner: object
    blog: object
    answer: object
    question: object
    comment: object
}

const likeSchema = new Schema<ILike>({

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    blog: {
        type: Schema.Types.ObjectId,
        ref: "Blog",
    },

    answer: {
        type: Schema.Types.ObjectId,
        ref: "Answer",
    },

    question: {
        type: Schema.Types.ObjectId,
        ref: "Question",
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
    }

}, { timestamps: true })



export const Like = mongoose.model<ILike>("Like", likeSchema)