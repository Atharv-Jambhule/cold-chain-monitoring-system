const Alert = require('../models/Alert');

// Get all alerts
exports.getAllAlerts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const alerts = await Alert.findAll(limit);
    res.json({
      success: true,
      message: 'Alerts retrieved successfully',
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// Get alert by ID
exports.getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// Get recent alerts (24h)
exports.getRecentAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.findRecent();
    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// Get alerts by storage
exports.getAlertsByStorage = async (req, res, next) => {
  try {
    const alerts = await Alert.findByStorageId(req.params.storageId);
    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// Get most alert-prone storage
exports.getMostAlertProneStorage = async (req, res, next) => {
  try {
    const data = await Alert.getMostAlertProneStorage();
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    next(error);
  }
};

// Create manual alert
exports.createAlert = async (req, res, next) => {
  try {
    const alertId = await Alert.create(req.body);
    const alert = await Alert.findById(alertId);
    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// Check expiry alerts (stored procedure)
exports.checkExpiry = async (req, res, next) => {
  try {
    await Alert.checkExpiry();
    res.json({
      success: true,
      message: 'Expiry alerts checked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete alert
exports.deleteAlert = async (req, res, next) => {
  try {
    const deleted = await Alert.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
