import mongoose from "mongoose";


interface ILink extends Document {
    originalUrl: string
    shortUrl: string
    click: number,
    blog: object
}

const LinkSchema = new mongoose.Schema<ILink>({
    originalUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true
    },
    click: {
        type: Number,
        default: 0
    },
    blog:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
    }

},
{ timestamps: true })


export const Link = mongoose.model<ILink>("Link", LinkSchema)