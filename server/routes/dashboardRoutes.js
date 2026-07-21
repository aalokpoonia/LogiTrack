/**
 * routes/dashboardRoutes.js
 *
 * All dashboard data endpoints — protected (require login).
 * No admin-only routes here; all roles can view the dashboard.
 * (Role-specific data filtering happens in the controller.)
 */

const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const {
    getKPIs,
    getRevenueChart,
    getMonthlyRevenue,
    getStatusBreakdown,
    getRecentShipments,
    getTopClients,
    getActivityFeed,
    getDelayedShipments,
} = require('../controllers/dashboardController');

// All dashboard routes require authentication
router.use(protect);

router.get('/kpis', getKPIs);
router.get('/revenue-chart', getRevenueChart);
router.get('/monthly-revenue', getMonthlyRevenue);
router.get('/status-breakdown', getStatusBreakdown);
router.get('/recent-shipments', getRecentShipments);
router.get('/top-clients', getTopClients);
router.get('/activity-feed', getActivityFeed);
router.get('/delayed-shipments', getDelayedShipments);

module.exports = router;
