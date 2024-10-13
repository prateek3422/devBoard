import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils";
import { ZodError } from "zod";

const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode ||= 500;
  err.message ||= "Internal Server Error";

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.errors.map((error) => error.message),
    });
  }
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export { errorHandler };
