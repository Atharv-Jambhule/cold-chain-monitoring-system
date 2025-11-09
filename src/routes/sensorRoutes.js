const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const { validateSensorData } = require('../middleware/validator');

// GET routes
router.get('/', sensorController.getAllSensorData);
router.get('/latest', sensorController.getLatestReadings);
router.get('/averages', sensorController.getAverageData);
router.get('/dashboard-stats', sensorController.getDashboardStats);
router.get('/storage/:storageId', sensorController.getSensorDataByStorage);

// POST routes
router.post('/', validateSensorData, sensorController.createSensorReading);

module.exports = router;
