/**
 * routes/shipmentRoutes.js
 *
 * Routes for Shipment Operations.
 */

const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');
const { ROLES } = require('../config/constants');
const {
    getShipments,
    getShipment,
    createShipment,
    updateShipment,
    deleteShipment,
    getShipmentTimeline,
    uploadPOD,
    generateLRPDF,
    generateInvoicePDF,
} = require('../controllers/shipmentController');

router.use(protect);

router
    .route('/')
    .get(getShipments)
    .post(createShipment);

router
    .route('/:id')
    .get(getShipment)
    .put(updateShipment)
    .delete(authorize(ROLES.ADMIN, ROLES.OPERATIONS), deleteShipment);

router
    .route('/:id/timeline')
    .get(getShipmentTimeline);

router
    .route('/:id/pod')
    .post(upload.single('pod'), uploadPOD);

router
    .route('/:id/pdf/lr')
    .get(generateLRPDF);

router
    .route('/:id/pdf/invoice')
    .get(generateInvoicePDF);

module.exports = router;

