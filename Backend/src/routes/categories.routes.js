/**
 * Routes cho Categories (LoaiMon)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categories.controller');

const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// Cấu hình multer để upload file
const uploadsDir = path.join(__dirname, '../../wwwroot/images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, GIF)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Public
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Protected (admin)
router.post('/', authenticate, isAdmin, upload.single('HinhAnh'), createCategory);
router.put('/:id', authenticate, isAdmin, upload.single('HinhAnh'), updateCategory);
router.delete('/:id', authenticate, isAdmin, deleteCategory);

module.exports = router;
