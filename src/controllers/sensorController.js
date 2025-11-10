const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');

// Get all sensor data
exports.getAllSensorData = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const sensorData = await SensorData.findAll(limit);
    res.json({
      success: true,
      message: 'Sensor data retrieved successfully',
      count: sensorData.length,
      data: sensorData
    });
  } catch (error) {
    next(error);
  }
};

// Get sensor data by storage ID
exports.getSensorDataByStorage = async (req, res, next) => {
  try {
    const sensorData = await SensorData.findByStorageId(req.params.storageId);
    res.json({
      success: true,
      count: sensorData.length,
      data: sensorData
    });
  } catch (error) {
    next(error);
  }
};

// Get latest readings by storage
exports.getLatestReadings = async (req, res, next) => {
  try {
    const readings = await SensorData.getLatestByStorage();
    res.json({
      success: true,
      data: readings
    });
  } catch (error) {
    next(error);
  }
};

// Get average data by storage and date
exports.getAverageData = async (req, res, next) => {
  try {
    const averages = await SensorData.getAverageByStorageAndDate();
    res.json({
      success: true,
      data: averages
    });
  } catch (error) {
    next(error);
  }
};

// Create sensor reading
exports.createSensorReading = async (req, res, next) => {
  try {
    const { storage_id, temperature, humidity } = req.body;

    if (!storage_id || temperature === undefined || humidity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: storage_id, temperature, humidity'
      });
    }

    const sensorId = await SensorData.create(req.body);

    // Get context (product + safe range + storage name)
    const ctx = await SensorData.getSensorContext(sensorId);

    let alertMessage = null;

    if (ctx) {
      const { product_name, min_temp, max_temp, storage_name } = ctx;

      if (temperature < min_temp || temperature > max_temp) {
        alertMessage = `⚠️ Temperature Breach in ${storage_name} (Reading: ${temperature}°C, Safe Range: ${min_temp}°C – ${max_temp}°C) for product ${product_name}`;

        await Alert.create({
          sensor_id: sensorId,
          message: alertMessage
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Sensor data logged successfully',
      data: { sensor_id: sensorId, storage_id, temperature, humidity },
      alert: alertMessage
    });

  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    const StorageUnit = require('../models/StorageUnit');
    const Shipment = require('../models/Shipment');

    const [
      productCount,
      storageCount,
      shipmentCount,
      sensorCount,
      alertCount,
      inTransitCount,
      recentAlertsCount,
      avgTemps
    ] = await Promise.all([
      Product.count(),
      StorageUnit.count(),
      Shipment.count(),
      SensorData.count(),
      Alert.count(),
      Shipment.countInTransit(),
      Alert.countRecent(),
      StorageUnit.getAverageTemperatures()
    ]);

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      stats: {
        products: productCount,
        storage_units: storageCount,
        shipments: shipmentCount,
        sensor_readings: sensorCount,
        total_alerts: alertCount,
        in_transit: inTransitCount,
        recent_alerts: recentAlertsCount
      },
      storage_avg_temps: avgTemps
    });
  } catch (error) {
    next(error);
  }
};
