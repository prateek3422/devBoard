import z from "zod";

export const QuestionSchema = z.object({
  title: z.string({ required_error: "title is required" }),
  question: z
    .string({ required_error: "question is required" })
    .min(5, { message: "question must be 20 charector" })
    .max(20000, { message: "question is too log" }),
  tags: z.array(z.string()),
});
