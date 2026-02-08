/**
 * Global Error Handler Middleware
 */
export function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Handle specific error types
  if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    message = "Resource already exists";
  }

  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    statusCode = 400;
    message = "Referenced resource not found";
  }

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}
