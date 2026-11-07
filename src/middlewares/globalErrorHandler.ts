import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError.js";
export const globalErrorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next,
) => {
  if (res.headersSent) {
    return next(error);
  }
  console.error("Error:", error);

  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message = error instanceof AppError ? error.message : "Internal server error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};
