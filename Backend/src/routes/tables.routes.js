/**
 * Routes cho Tables (Ban)
 */

const express = require('express');
const router = express.Router();

const {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable
} = require('../controllers/tables.controller');

const { authenticate, isEmployeeOrAdmin, isAdmin } = require('../middlewares/auth.middleware');

// Public
router.get('/', getAllTables);
router.get('/:id', getTableById);

// Protected
router.post('/', authenticate, isAdmin, createTable);
router.put('/:id', authenticate, isEmployeeOrAdmin, updateTable);
router.delete('/:id', authenticate, isAdmin, deleteTable);

module.exports = router;
