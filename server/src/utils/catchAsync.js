const AppError = require('./AppError');

/**
 * Async wrapper to avoid try/catch in every controller
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
