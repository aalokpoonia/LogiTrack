/**
 * routes/vehicleRoutes.js
 *
 * Routes for Vehicle Management.
 */

const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');
const {
    getVehicles,
    getVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
} = require('../controllers/vehicleController');

router.use(protect);

router
    .route('/')
    .get(getVehicles)
    .post(createVehicle);

router
    .route('/:id')
    .get(getVehicle)
    .put(updateVehicle)
    .delete(authorize(ROLES.ADMIN, ROLES.OPERATIONS), deleteVehicle); // Admin or operations can remove vehicles

module.exports = router;
