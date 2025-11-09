const express = require('express');
const router = express.Router();

// Import route modules
const productRoutes = require('./productRoutes');
const storageRoutes = require('./storageRoutes');
const shipmentRoutes = require('./shipmentRoutes');
const sensorRoutes = require('./sensorRoutes');
const alertRoutes = require('./alertRoutes');
const userRoutes = require('./userRoutes');
// Mount routes
router.use('/products', require('./productRoutes'));
router.use('/storage-units', require('./storageRoutes'));
router.use('/shipments', require('./shipmentRoutes'));
router.use('/sensor-data', require('./sensorRoutes'));
router.use('/alerts', require('./alertRoutes'));
router.use('/users', require('./userRoutes')); 
// API info route
router.get('/', (req, res) => {
  res.json({
    message: 'Cold Chain Monitoring API',
    version: '2.0.0',
    endpoints: {
      products: '/api/products',
      storage_units: '/api/storage-units',
      shipments: '/api/shipments',
      sensor_data: '/api/sensor-data',
      alerts: '/api/alerts'
    }
  });
});

module.exports = router;
