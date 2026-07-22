/**
 * routes/aiRoutes.js
 *
 * Routes for Gemini AI Logistics Assistant.
 */

const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const { queryAssistant } = require('../controllers/aiController');

router.use(protect);

router.post('/query', queryAssistant);

module.exports = router;
