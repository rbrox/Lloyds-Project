/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // To distinguish from programming errors

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 * Handles all errors in a consistent format
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging (in production, use proper logging service)
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = new AppError(message, 400, ['The provided ID is not valid']);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `Duplicate value for ${field}`;
    error = new AppError(message, 409, [`${field} already exists`]);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    error = new AppError('Validation failed', 400, errors);
  }

  // JWT errors (if you add JWT later)
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401, ['Please authenticate']);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401, ['Please login again']);
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    errors: error.errors || []
  });
};

/**
 * 404 handler for unmatched routes
 */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    errors: [`Cannot ${req.method} ${req.path}`]
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 * Eliminates need for try-catch in every controller
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};