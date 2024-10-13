import mongoose, { Schema } from "mongoose";

interface Iblog extends Document {
  slug: string;
  title: string;
  content: string;
  image: object;
  tags: object;
  author: object;
  isPublic: boolean;
}

const BlogSchema = new Schema<Iblog>(
  {
    slug: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: {
        url: String,
        public_id: String,
      },
      required: true,
    },
    tags: {
      type: [Schema.Types.ObjectId],
      ref: "Tags",
      required: true,
    },
    isPublic: {
      required: true,
      type: Boolean,
      default: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Blog = mongoose.model<Iblog>("Blog", BlogSchema);
