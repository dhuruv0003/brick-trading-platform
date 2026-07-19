const http = require('http');
const { Server: SocketServer } = require('socket.io');
const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const NotificationService = require('./services/NotificationService');

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

// Connect to MongoDB
connectDB();

// ── Create HTTP server and attach socket.io ────────────────────────────────
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: config.clientUrl || process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Use path /socket.io (default) — no conflict with Express API routes
});

// Give NotificationService a reference to io so it can emit events
NotificationService.init(io);

// ── Socket.io connection handler ───────────────────────────────────────────
io.on('connection', (socket) => {
  // The client sends its customerId immediately after connecting (if logged in)
  socket.on('join', (customerId) => {
    if (customerId) {
      socket.join(customerId.toString());
      logger.info(`Socket joined room: ${customerId}`);
    }
  });

  // Admin/manager/staff clients join a single shared room so a "new order"
  // notification reaches every logged-in admin user at once. Trust model
  // mirrors the customer 'join' event above — the client only emits this
  // once its own admin REST calls (already JWT-protected) have succeeded,
  // there's no separate socket-level auth check here.
  socket.on('joinAdmin', () => {
    socket.join('admin');
    logger.info(`Socket joined admin room: ${socket.id}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// ── Start server ───────────────────────────────────────────────────────────
server.listen(config.port, () => {
  logger.info(`BrickPro API running in ${config.env} mode on port ${config.port}`);
  logger.info(`Health check: http://localhost:${config.port}/health`);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated.');
  });
});

module.exports = server;
