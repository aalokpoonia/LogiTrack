/**
 * routes/brokerRoutes.js
 *
 * Routes for Broker Management.
 */

const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');
const {
    getBrokers,
    getBroker,
    createBroker,
    updateBroker,
    deleteBroker,
} = require('../controllers/brokerController');

router.use(protect);

router
    .route('/')
    .get(getBrokers)
    .post(createBroker);

router
    .route('/:id')
    .get(getBroker)
    .put(updateBroker)
    .delete(authorize(ROLES.ADMIN), deleteBroker); // Only admin can delete brokers

module.exports = router;
