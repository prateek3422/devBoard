import * as z from "zod"


export const registerSchema = z.object({
    fullname : z.string({required_error: "name required true"}).min(3, ""),
    username: z.string({required_error: "user name is required"})
})