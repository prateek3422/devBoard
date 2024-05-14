import z from "zod";


export const createBlogSchema = z.object({
    name: z.string({ required_error: "name required true" })
    .min(3, { message: "name must be 3 charector" })
    .max(20, { message: "name is too log" }),
    title: z.string({ required_error: "title required true" })
    .min(3, { message: "title must be 3 charector" })
    .max(20, { message: "title is too log" }),
    content: z.string({ required_error: "content required true" })
    .min(200, { message: "content must be 3 charector" }),
  
})