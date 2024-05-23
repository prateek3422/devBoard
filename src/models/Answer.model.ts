import mongoose, { Schema } from "mongoose";


const answerSchema = new Schema({
    answer: {
        type: String,
        required: true
    },
    question:[ {
        type: Schema.Types.ObjectId,
        ref: "Question",

    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })

export const Answer = mongoose.model("Answer", answerSchema)