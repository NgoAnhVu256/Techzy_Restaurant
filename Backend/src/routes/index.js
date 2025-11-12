/**
 * File index để tổng hợp tất cả routes
 */

const express = require("express");
const router = express.Router();

const usersRoutes = require("./users.routes");
const menuRoutes = require("./menu.routes");
const ordersRoutes = require("./orders.routes");
const reservationsRoutes = require("./reservations.routes");
const categoriesRoutes = require("./categories.routes");
const customersRoutes = require("./customers.routes");
const tablesRoutes = require("./tables.routes");

// Định nghĩa các routes
router.use("/users", usersRoutes);
router.use("/menu", menuRoutes);
router.use("/orders", ordersRoutes);
router.use("/reservations", reservationsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/customers", customersRoutes);
router.use("/tables", tablesRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
