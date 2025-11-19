/**
 * Routes cho Categories (LoaiMon)
 */

const express = require('express');
const router = express.Router();

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categories.controller');

const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Public
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Protected (admin)
router.post('/', authenticate, isAdmin, upload.single('HinhAnh'), createCategory);
router.put('/:id', authenticate, isAdmin, upload.single('HinhAnh'), updateCategory);
router.delete('/:id', authenticate, isAdmin, deleteCategory);

module.exports = router;
