/**
 * routes/clientRoutes.js
 *
 * Routes for Client (Party) Management.
 * Accessible to all authenticated operators. Role checks apply for deletions.
 */

const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');
const {
    getClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
} = require('../controllers/clientController');

// Protect all routes
router.use(protect);

router
    .route('/')
    .get(getClients)
    .post(createClient);

router
    .route('/:id')
    .get(getClient)
    .put(updateClient)
    .delete(authorize(ROLES.ADMIN, ROLES.ACCOUNTS), deleteClient); // Only admin or accounts can delete clients

module.exports = router;
