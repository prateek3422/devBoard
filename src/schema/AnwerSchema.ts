import z from "zod";


export const answerSchema = z.object({
    answer: z.string({ required_error: "answer is required" }).min(5, { message: "answer must be 3 charector" }),
})