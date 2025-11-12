/**
 * Routes cho Orders API
 */

const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getTodayOrderCount,
  getTodayRevenue,
  deleteOrder
} = require('../controllers/orders.controller');
const { authenticate, isEmployeeOrAdmin } = require('../middlewares/auth.middleware');

// Public route - cho phép khách hàng tạo đơn hàng
router.post('/', createOrder);

// Protected routes - cần xác thực
router.get('/', authenticate, isEmployeeOrAdmin, getAllOrders);
router.get('/today/count', authenticate, isEmployeeOrAdmin, getTodayOrderCount);
router.get('/today/revenue', authenticate, isEmployeeOrAdmin, getTodayRevenue);
router.get('/:id', authenticate, isEmployeeOrAdmin, getOrderById);
router.put('/:id/trangthai', authenticate, isEmployeeOrAdmin, updateOrderStatus);
router.delete('/:id', authenticate, isEmployeeOrAdmin, deleteOrder);

module.exports = router;

