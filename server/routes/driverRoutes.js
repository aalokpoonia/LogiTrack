/**
 * routes/driverRoutes.js
 *
 * Routes for Driver Management.
 */

const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');
const {
    getDrivers,
    getDriver,
    createDriver,
    updateDriver,
    deleteDriver,
} = require('../controllers/driverController');

router.use(protect);

router
    .route('/')
    .get(getDrivers)
    .post(createDriver);

router
    .route('/:id')
    .get(getDriver)
    .put(updateDriver)
    .delete(authorize(ROLES.ADMIN, ROLES.OPERATIONS), deleteDriver); // Admin or operations can remove drivers

module.exports = router;
