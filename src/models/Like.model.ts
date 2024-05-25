import mongoose from "mongoose";


interface ILink extends Document {
    originalUrl: string
    shortUrl: string
    click: number
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
    }

},
{ timestamps: true })


export const Link = mongoose.model<ILink>("Link", LinkSchema)