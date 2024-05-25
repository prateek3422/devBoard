import z from "zod";

export const linkSchema = z.object({
    originalUrl: z.string({required_error:"original url is required"}).min(5, {message:"original url must be 5 charector"}),
})