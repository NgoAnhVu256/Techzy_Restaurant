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
const suppliersRoutes = require("./suppliers.routes");
const storageRoutes = require("./storage.routes");
const departmentsRoutes = require("./departments.routes");
const employeesRoutes = require("./employees.routes");
const shiftsRoutes = require("./shifts.routes");
const workscheduleRoutes = require("./workschedule.routes");
const promotionsRoutes = require("./promotions.routes");
const statisticsRoutes = require("./statistics.routes");

// Định nghĩa các routes
router.use("/users", usersRoutes);
router.use("/menu", menuRoutes);
router.use("/orders", ordersRoutes);
router.use("/reservations", reservationsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/customers", customersRoutes);
router.use("/tables", tablesRoutes);
router.use("/suppliers", suppliersRoutes);
router.use("/storage", storageRoutes);
router.use("/departments", departmentsRoutes);
router.use("/employees", employeesRoutes);
router.use("/shifts", shiftsRoutes);
router.use("/workschedule", workscheduleRoutes);
router.use("/promotions", promotionsRoutes);
router.use("/statistics", statisticsRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
