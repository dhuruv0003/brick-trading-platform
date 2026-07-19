const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');

const config = require('./config/env');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const { apiLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth');
const v1Routes = require('./routes/v1');

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving static images
}));

// CLIENT_URL may contain one or more comma-separated origins (e.g. your
// production domain plus a custom domain). Trailing slashes are stripped
// because a mismatched trailing slash is a common cause of "CORS works
// locally but fails once deployed" — the browser's Origin header never has
// a trailing slash, but a pasted URL in an env var often does.
const normalizeOrigin = (url) => url.trim().replace(/\/+$/, '');

const allowedOrigins = (config.clientUrl || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

if (config.env !== 'production') {
  allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
}

app.use(cors({
  origin(origin, callback) {
    // No Origin header (curl, server-to-server, health checks) — allow.
    if (!origin) return callback(null, true);

    const normalized = normalizeOrigin(origin);

    // Exact match against configured origins.
    if (allowedOrigins.includes(normalized)) return callback(null, true);

    // Always allow this project's own Vercel preview/production deployments
    // (e.g. https://brick-trade-<hash>.vercel.app) — Vercel assigns a new
    // preview subdomain on every deploy, so a single hardcoded CLIENT_URL
    // will otherwise start rejecting requests the moment a new preview or
    // redeploy gets a different auto-generated hostname.
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalized)) return callback(null, true);

    logger.warn(`CORS blocked request from unrecognized origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
app.use('/api', apiLimiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization
app.use(mongoSanitize()); // NoSQL injection
app.use(xss()); // XSS
app.use(hpp({
  whitelist: ['price', 'rating', 'category', 'tags', 'sort', 'fields'],
}));

// Compression
app.use(compression());

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BrickPro API is running',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customer/auth', require('./routes/customerAuth'));
app.use('/api/v1/customer', require('./routes/customer'));
app.use('/api/v1', v1Routes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
