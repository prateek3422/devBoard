import mongoose ,{Schema} from "mongoose";


const  answerSchema = new Schema({
    answer: {
        type: String,
        required: true
    },
    tags: {
        type: [Schema.Types.ObjectId],
        ref: "Tags",
        required: true
    },
    question: {
        type: Schema.Types.ObjectId,
        ref: "Question",
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }   
},{timestamps:true})    

export const Answer = mongoose.model("Answer", answerSchema)