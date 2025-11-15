/**
 * Routes cho Departments (PhongBan)
 */

const express = require('express');
const router = express.Router();

const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departments.controller');

const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// Public
router.get('/', getAllDepartments);
router.get('/:id', getDepartmentById);

// Protected (admin)
router.post('/', authenticate, isAdmin, createDepartment);
router.put('/:id', authenticate, isAdmin, updateDepartment);
router.delete('/:id', authenticate, isAdmin, deleteDepartment);

module.exports = router;

