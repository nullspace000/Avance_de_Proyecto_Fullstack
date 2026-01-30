/**
 * Error Handler Middleware
 * Centralized error handling for the API
 */

/**
 * Not Found handler
 */
function notFound(req, res, next) {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`
    });
}

/**
 * Global error handler
 */
function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Default to 500 if no status code
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

module.exports = {
    notFound,
    errorHandler
};
