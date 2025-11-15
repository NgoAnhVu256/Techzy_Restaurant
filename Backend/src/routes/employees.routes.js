/**
 * Routes cho Employees (NhanVien)
 */

const express = require('express');
const router = express.Router();

const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employees.controller');

const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// Public
router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);

// Protected (admin)
router.post('/', authenticate, isAdmin, createEmployee);
router.put('/:id', authenticate, isAdmin, updateEmployee);
router.delete('/:id', authenticate, isAdmin, deleteEmployee);

module.exports = router;

