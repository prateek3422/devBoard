import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils";
import { ZodError } from "zod";

const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: err.errors.map((error) => error.message)

    });
  }
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

export { errorHandler };
