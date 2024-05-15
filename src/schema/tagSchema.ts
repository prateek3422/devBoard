import z from "zod";

export const TagsSchema = z.object({
    name: z.string({required_error:"tag name is required"})
})