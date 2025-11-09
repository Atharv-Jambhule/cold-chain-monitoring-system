const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

// GET routes
router.get('/', alertController.getAllAlerts);
router.get('/recent', alertController.getRecentAlerts);
router.get('/prone-storage', alertController.getMostAlertProneStorage);
router.get('/storage/:storageId', alertController.getAlertsByStorage);
router.get('/:id', alertController.getAlertById);

// POST routes
router.post('/', alertController.createAlert);
router.post('/check-expiry', alertController.checkExpiry);

// DELETE routes
router.delete('/:id', alertController.deleteAlert);

module.exports = router;
