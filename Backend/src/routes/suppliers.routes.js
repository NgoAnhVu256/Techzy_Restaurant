/**
 * Routes cho Suppliers (NhaCungCap)
 */

const express = require('express');
const router = express.Router();

const {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/suppliers.controller');

const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// Public
router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);

// Protected (admin)
router.post('/', authenticate, isAdmin, createSupplier);
router.put('/:id', authenticate, isAdmin, updateSupplier);
router.delete('/:id', authenticate, isAdmin, deleteSupplier);

module.exports = router;

