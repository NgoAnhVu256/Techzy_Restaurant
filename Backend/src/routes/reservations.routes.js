/**
 * Routes cho Reservations API
 */

const express = require('express');
const router = express.Router();
const {
  getAllReservations,
  getReservationById,
  createReservation,
  getMenuByReservation,
  cancelReservation,
  updateReservation
} = require('../controllers/reservations.controller');
const { authenticate, isEmployeeOrAdmin } = require('../middlewares/auth.middleware');

// Public route - cho phép khách hàng đặt bàn
router.post('/', createReservation);

// Protected routes - cần xác thực
router.get('/', authenticate, isEmployeeOrAdmin, getAllReservations);
router.get('/:id', authenticate, isEmployeeOrAdmin, getReservationById);
router.get('/:maDatBan/monan', authenticate, isEmployeeOrAdmin, getMenuByReservation);
router.put('/:id', authenticate, isEmployeeOrAdmin, updateReservation);
router.delete('/:id', authenticate, isEmployeeOrAdmin, cancelReservation);

module.exports = router;

