import z from "zod";

export const createBlogSchema = z.object({
  title: z
    .string({ required_error: "title required true" })
    .min(3, { message: "title must be 3 charector" })
    .max(50, { message: "title is too log" }),
  content: z
    .string({ required_error: "content required true" })
    .min(200, { message: "content must be 3 charector" }),
  tags: z.array(z.string({ required_error: "tags required true" })),
});

export const getAllBlog = z.object({
  BlogId: z.string({ required_error: "user id is required" }),
});

export const updateBlogSchema = z.object({
  name: z
    .string({ required_error: "name required true" })
    .min(3, { message: "name must be 3 charector" })
    .max(20, { message: "name is too log" }),
  title: z
    .string({ required_error: "title required true" })
    .min(3, { message: "title must be 3 charector" })
    .max(20, { message: "title is too log" }),
  content: z
    .string({ required_error: "content required true" })
    .min(200, { message: "content must be 3 charector" }),
  // tags: z.array(z.string())
});
