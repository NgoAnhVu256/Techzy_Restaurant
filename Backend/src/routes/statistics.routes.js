/**
 * Routes cho Statistics (Thống kê)
 */

const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getRevenueOverTime,
  getTopSellingProducts
} = require('../controllers/statistics.controller');

const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// Protected (admin)
router.get('/dashboard', authenticate, isAdmin, getDashboardStats);
router.get('/revenue', authenticate, isAdmin, getRevenueOverTime);
router.get('/top-products', authenticate, isAdmin, getTopSellingProducts);

module.exports = router;

