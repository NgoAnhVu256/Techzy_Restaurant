/**
 * Routes cho Promotions (KhuyenMai)
 */

const express = require('express');
const router = express.Router();

const {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion
} = require('../controllers/promotions.controller');

const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// Public
router.get('/', getAllPromotions);
router.get('/:id', getPromotionById);

// Protected (admin)
router.post('/', authenticate, isAdmin, createPromotion);
router.put('/:id', authenticate, isAdmin, updatePromotion);
router.delete('/:id', authenticate, isAdmin, deletePromotion);

module.exports = router;

