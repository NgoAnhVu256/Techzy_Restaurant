/**
 * Routes cho Shifts (CaLamViec)
 */

const express = require('express');
const router = express.Router();

const {
  getAllShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift
} = require('../controllers/shifts.controller');

const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// Public
router.get('/', getAllShifts);
router.get('/:id', getShiftById);

// Protected (admin)
router.post('/', authenticate, isAdmin, createShift);
router.put('/:id', authenticate, isAdmin, updateShift);
router.delete('/:id', authenticate, isAdmin, deleteShift);

module.exports = router;

