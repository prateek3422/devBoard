import * as z from "zod"


export const registerSchema = z.object({
    fullname : z.string({required_error: "name required true"}).min(3, {message: "fullname must be 3 charector"}).max(20, {message:"full name is too log"}),
    username: z.string({required_error: "user name is required"}).min(3, {message :"usename must be 3 charector"}).max(10, "username is too long"),
    // .regex(/^[a-zA-Z0-9]+$/, {message: "username must be alphanumeric"}),
    email: z.string({required_error: "email is required"}).email({message: "email is invalid"}),
    password: z.string({required_error: "password is required"}).min(8, {message: "password must be 8 charector"}),

}) 