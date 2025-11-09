const { body, validationResult } = require('express-validator');

// Validation middleware wrapper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Product validation rules
exports.validateProduct = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('batch_no').notEmpty().withMessage('Batch number is required'),
  body('expiry_date').isISO8601().withMessage('Valid expiry date is required'),
  body('min_temp').isFloat().withMessage('Minimum temperature must be a number'),
  body('max_temp').isFloat().withMessage('Maximum temperature must be a number'),
  validate
];

// Storage unit validation rules
exports.validateStorageUnit = [
  body('name')
    .notEmpty().withMessage('Storage name is required'),

  body('location')
    .notEmpty().withMessage('Location is required'),

  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['Warehouse', 'Cold Room', 'Truck']).withMessage('Type must be Warehouse, Cold Room, or Truck'),

  validate
];


// ✅ NEW Shipment validation rules (Use these)
exports.validateShipment = [
  body('product_name')
    .notEmpty().withMessage('Product Name is required'),

  body('shipment_code')
    .notEmpty().withMessage('Shipment Code is required'),

  body('start_location')
    .notEmpty().withMessage('Start Location is required'),

  body('destination')
    .notEmpty().withMessage('Destination is required'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['In Transit', 'Delivered']).withMessage('Status must be In Transit or Delivered'),

  validate
];

// Sensor data validation rules
exports.validateSensorData = [
  body('storage_id').isInt().withMessage('Valid storage ID is required'),
  body('temperature').isFloat().withMessage('Temperature must be a number'),
  body('humidity').isFloat({ min: 0, max: 100 }).withMessage('Humidity must be between 0 and 100'),
  validate
];
