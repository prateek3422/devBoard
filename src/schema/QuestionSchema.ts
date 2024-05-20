import z from "zod";

export const QuestionSchema = z.object({
    title: z.string({ required_error: "title is required" }),
    question: z.string({ required_error: "question is required" })
    .min(5, { message: "question must be 20 charector" })
    .max(1000, { message: "question is too log" }),
    description: z.string({ required_error: "description is required" })
    .max(200, { message: "description is too log" })
    .min(20, { message: "description must be 20 charector" }),
    tags: z.array(z.string())

})