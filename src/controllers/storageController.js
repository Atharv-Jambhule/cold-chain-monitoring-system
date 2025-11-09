const StorageUnit = require('../models/StorageUnit');

// Get all storage units
exports.getAllStorageUnits = async (req, res, next) => {
  try {
    const storageUnits = await StorageUnit.findAll();
    res.json({
      success: true,
      message: 'Storage units retrieved successfully',
      count: storageUnits.length,
      data: storageUnits
    });
  } catch (error) {
    next(error);
  }
};

// Get storage unit by ID
exports.getStorageUnitById = async (req, res, next) => {
  try {
    const storageUnit = await StorageUnit.findById(req.params.id);
    if (!storageUnit) {
      return res.status(404).json({
        success: false,
        message: 'Storage unit not found'
      });
    }
    res.json({
      success: true,
      data: storageUnit
    });
  } catch (error) {
    next(error);
  }
};

// Get storage units by type
exports.getStorageUnitsByType = async (req, res, next) => {
  try {
    const storageUnits = await StorageUnit.findByType(req.params.type);
    res.json({
      success: true,
      count: storageUnits.length,
      data: storageUnits
    });
  } catch (error) {
    next(error);
  }
};

// Get average temperatures
exports.getAverageTemperatures = async (req, res, next) => {
  try {
    const temps = await StorageUnit.getAverageTemperatures();
    res.json({
      success: true,
      data: temps
    });
  } catch (error) {
    next(error);
  }
};

// Create storage unit
exports.createStorageUnit = async (req, res, next) => {
  try {
    const storageId = await StorageUnit.create(req.body);
    const storageUnit = await StorageUnit.findById(storageId);
    res.status(201).json({
      success: true,
      message: 'Storage unit created successfully',
      data: storageUnit
    });
  } catch (error) {
    next(error);
  }
};

// Update storage unit
exports.updateStorageUnit = async (req, res, next) => {
  try {
    const updated = await StorageUnit.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Storage unit not found'
      });
    }
    const storageUnit = await StorageUnit.findById(req.params.id);
    res.json({
      success: true,
      message: 'Storage unit updated successfully',
      data: storageUnit
    });
  } catch (error) {
    next(error);
  }
};

// Delete storage unit
exports.deleteStorageUnit = async (req, res, next) => {
  try {
    const deleted = await StorageUnit.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Storage unit not found'
      });
    }
    res.json({
      success: true,
      message: 'Storage unit deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
