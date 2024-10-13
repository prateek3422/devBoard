class ApiError extends Error {
  statusCode: number;
  message: string;
  error: string[];
  success: boolean;
  data: any;
  stack?: string | undefined;

  constructor(
    statusCode: number,
    message: string = "something went wrong",
    errors: string[] = [],
    stack: string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.error = errors;
    this.data = null;
    this.success = false;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
