import z from "zod";

export const commentSchema = z.object({
    content: z.string({ required_error: "comment is required" }).min(3, { message: "comment must be 3 charector" }),
})