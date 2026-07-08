const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

// Connect to MongoDB
connectDB();

// Start server
const server = app.listen(config.port, () => {
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
