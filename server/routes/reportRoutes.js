/**
 * routes/reportRoutes.js
 *
 * Routes for Analytics & CSV Reports.
 */

const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const { getAnalytics, exportShipmentsCSV } = require('../controllers/reportController');

router.use(protect);

router.get('/analytics', getAnalytics);
router.get('/export', exportShipmentsCSV);

module.exports = router;
