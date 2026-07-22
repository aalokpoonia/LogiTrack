/**
 * routes/trackingRoutes.js
 *
 * Routes for Real-Time GPS Tracking.
 */

const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const {
    getActiveTrackedShipments,
    updateLocationREST,
} = require('../controllers/trackingController');

router.use(protect);

router.get('/active', getActiveTrackedShipments);
router.post('/:id/location', updateLocationREST);

module.exports = router;
