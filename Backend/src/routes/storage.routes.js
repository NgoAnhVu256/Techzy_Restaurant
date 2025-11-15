/**
 * Routes cho Storage (NguyenVatLieu)
 */

const express = require('express');
const router = express.Router();

const {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial
} = require('../controllers/storage.controller');

const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// Public
router.get('/', getAllMaterials);
router.get('/:id', getMaterialById);

// Protected (admin)
router.post('/', authenticate, isAdmin, createMaterial);
router.put('/:id', authenticate, isAdmin, updateMaterial);
router.delete('/:id', authenticate, isAdmin, deleteMaterial);

module.exports = router;

