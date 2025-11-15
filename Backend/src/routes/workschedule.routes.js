/**
 * Routes cho Work Schedule (LichLamViec)
 */

const express = require('express');
const router = express.Router();

const {
  getAllWorkSchedules,
  getWorkScheduleById,
  createWorkSchedule,
  updateWorkSchedule,
  deleteWorkSchedule
} = require('../controllers/workschedule.controller');

const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// Public
router.get('/', getAllWorkSchedules);
router.get('/:id', getWorkScheduleById);

// Protected (admin)
router.post('/', authenticate, isAdmin, createWorkSchedule);
router.put('/:id', authenticate, isAdmin, updateWorkSchedule);
router.delete('/:id', authenticate, isAdmin, deleteWorkSchedule);

module.exports = router;

