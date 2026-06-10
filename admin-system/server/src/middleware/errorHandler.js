/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */

/**
 * Custom application error class
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Distinguish from programming errors
        
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Not found error (404)
 */
class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
    }
}

/**
 * Validation error (400)
 */
class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400);
    }
}

/**
 * Database error (500)
 */
class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500);
    }
}

/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
    // Log error for debugging (server-side only)
    console.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    
    // Determine status code
    const statusCode = err.statusCode || 500;
    
    // Determine error response
    // Don't expose internal errors to clients
    const errorResponse = {
        error: statusCode === 500 && !err.isOperational
            ? 'Internal server error'
            : err.message
    };
    
    // Send error response
    res.status(statusCode).json(errorResponse);
}

/**
 * Catch-all for 404 errors
 */
function notFoundHandler(req, res, next) {
    const error = new NotFoundError('Endpoint');
    next(error);
}

module.exports = {
    AppError,
    NotFoundError,
    ValidationError,
    DatabaseError,
    errorHandler,
    notFoundHandler
};
