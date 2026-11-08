import type { ErrorRequestHandler } from "express";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { ZodError } from "zod";

import { AppError } from "../errors/AppError.js";
import type { IErrorResponse } from "../interfaces/error.interface.js";

export const globalErrorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next,
) => {
  // Avoid sending another response if one has already started
  if (res.headersSent) {
    return next(error);
  }

  // Default response for unexpected errors
  const response: IErrorResponse = {
    success: false,
    statusCode: 500,
    message: "Internal server error",
  };

  // 1. Application errors
  if (error instanceof AppError) {
    response.statusCode = error.statusCode;
    response.message = error.message;

  // 2. Zod validation errors
  } else if (error instanceof ZodError) {
    response.statusCode = 400;
    response.message = "Validation error";

    response.errors = error.issues.map((issue) => ({
      field: issue.path.map(String).join("."),
      message: issue.message,
    }));

  // 3. Drizzle / PostgreSQL errors
  } else {
    const originalError =
      error instanceof DrizzleQueryError
        ? error.cause
        : error;

    if (
      originalError &&
      typeof originalError === "object" &&
      "code" in originalError &&
      originalError.code === "23505"
    ) {
      response.statusCode = 409;
      response.message = "Resource already exists";
    }
  }

  // Log unexpected server errors
  if (response.statusCode >= 500) {
    console.error("Unexpected error:", error);
  }

  // Send consistent JSON error response
  res.status(response.statusCode).json(response);
};