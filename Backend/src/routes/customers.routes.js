/**
 * Routes cho Customers (KhachHang)
 */

const express = require('express');
const router = express.Router();

const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customers.controller');

const { authenticate, isEmployeeOrAdmin, isAdmin } = require('../middlewares/auth.middleware');

// Public
router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);

// Protected
router.post('/', authenticate, isEmployeeOrAdmin, createCustomer);
router.put('/:id', authenticate, isEmployeeOrAdmin, updateCustomer);
router.delete('/:id', authenticate, isAdmin, deleteCustomer);

module.exports = router;
