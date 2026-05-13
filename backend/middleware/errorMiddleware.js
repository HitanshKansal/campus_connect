// backend/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
  console.log('🔴 Error caught:', err.message);
  
  let statusCode = res.statusCode;
  if (statusCode === 200) statusCode = 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    stack: null,
  });
};

module.exports = errorHandler;