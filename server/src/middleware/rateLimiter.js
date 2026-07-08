const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const createLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || config.rateLimit.windowMs,
    max: options.max || config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: options.message || 'Too many requests. Please try again later.',
    },
    skip: (req) => {
      // Skip rate limiting for internal health checks
      return req.path === '/health';
    },
  });
};

// General API limiter
const apiLimiter = createLimiter();

// Strict limiter for auth endpoints
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many login attempts. Please try again after 15 minutes.',
});

// Lenient limiter for public pages
const publicLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

// Form submission limiter
const formLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Too many form submissions. Please try again later.',
});

// AI endpoint limiter
const aiLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'AI rate limit exceeded. Please wait a moment.',
});

module.exports = { apiLimiter, authLimiter, publicLimiter, formLimiter, aiLimiter };
