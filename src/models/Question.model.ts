import mongoose, { Schema } from "mongoose";


interface Iquestion extends Document {
  title: string;
  question: string;
  description: string;
  tags: object;
  owner: object
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<Iquestion>({
  title: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  tags: [{
    type: Schema.Types.ObjectId,
    ref: "Tags",
  }],

  owner:{
    type: Schema.Types.ObjectId,
    ref: "User"
  }
},
  {
    timestamps: true
  });




export const Question = mongoose.model<Iquestion>("Question", QuestionSchema)
