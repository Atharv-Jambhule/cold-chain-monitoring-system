const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

// All alerts (used internally)
router.get('/', alertController.getAllAlerts);

// Recent alerts for dashboard
router.get('/recent', alertController.getRecentAlerts);

module.exports = router;
