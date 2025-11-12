/**
 * Routes cho Users API
 */

const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  register,
  login,
  updateUser,
  deleteUser,
} = require("../controllers/users.controller");
const { authenticate, isAdmin } = require("../middlewares/auth.middleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes - cần xác thực
router.get("/", authenticate, isAdmin, getAllUsers);
router.get("/:id", authenticate, getUserById);
router.put("/:id", authenticate, isAdmin, updateUser);
router.delete("/:id", authenticate, isAdmin, deleteUser);

module.exports = router;
