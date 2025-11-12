/**
 * Cấu hình Express app
 * Load middleware, routes, và các cấu hình khác
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

const app = express();

// Middleware CORS
app.use(cors(config.cors));

// Middleware parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - phục vụ hình ảnh
app.use('/images', express.static(path.join(__dirname, '../wwwroot/images')));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// API Routes
app.use('/api', routes);

// Error handling middleware - phải đặt sau tất cả routes
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

