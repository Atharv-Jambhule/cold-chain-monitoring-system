const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

router.get('/', alertController.getAllAlerts);       // ✅ /api/alerts
router.get('/recent', alertController.getRecentAlerts); // ✅ /api/alerts/recent

module.exports = router;
