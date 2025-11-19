/**
 * Routes cho Menu API
 */

const express = require('express');
const router = express.Router();
const {
  getAllMenu,
  getMenuById,
  getLoaiMon,
  getMenuCount,
  createMenu,
  updateMenu,
  deleteMenu
} = require('../controllers/menu.controller');
const { authenticate, isAdmin, isEmployeeOrAdmin } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Public routes
router.get('/', getAllMenu);
router.get('/loaimon', getLoaiMon);
router.get('/count', getMenuCount);
router.get('/:id', getMenuById);

// Protected routes - cần xác thực và quyền admin
router.post('/', authenticate, isAdmin, upload.single('HinhAnh'), createMenu);
router.put('/:id', authenticate, isAdmin, upload.single('HinhAnh'), updateMenu);
router.delete('/:id', authenticate, isAdmin, deleteMenu);

module.exports = router;

