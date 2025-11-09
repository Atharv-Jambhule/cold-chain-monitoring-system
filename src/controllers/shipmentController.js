const Shipment = require('../models/Shipment');
const db = require('../config/database');

// Get all shipments
exports.getAllShipments = async (req, res) => {
  try {
    const [rows] = await db.pool.query(`
      SELECT 
  shipment_id,
  product_name,
  shipment_code,
  start_location,
  destination,
  status,
  departure_time,
  arrival_time,
  CASE
    WHEN status = 'Delivered' THEN TIMESTAMPDIFF(HOUR, departure_time, arrival_time)
    ELSE TIMESTAMPDIFF(HOUR, departure_time, NOW())
  END AS travel_hours
FROM Shipment
ORDER BY departure_time DESC;

    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Error fetching shipments" });
  }
};

// Get shipment by ID
exports.getShipmentById = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    next(error);
  }
};

// Get shipments by status
exports.getShipmentsByStatus = async (req, res, next) => {
  try {
    const shipments = await Shipment.findByStatus(req.params.status);
    res.json({
      success: true,
      count: shipments.length,
      data: shipments
    });
  } catch (error) {
    next(error);
  }
};

// Get shipment summary (stored procedure)
exports.getShipmentSummary = async (req, res, next) => {
  try {
    const summary = await Shipment.getSummary();
    res.json({
      success: true,
      message: 'Shipment summary retrieved',
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// Create shipment

exports.createShipment = async (req, res, next) => {
  try {
    const { product_name, shipment_code, start_location, destination, status } = req.body;

    const [result] = await db.pool.query(`
      INSERT INTO Shipment
      (product_name, shipment_code, start_location, destination, status, departure_time)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [product_name, shipment_code, start_location, destination, status]);

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      shipment_id: result.insertId
    });
  } catch (err) {
    next(err);
  }
};

// Update shipment
exports.updateShipment = async (req, res, next) => {
  try {
    const updated = await Shipment.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    const shipment = await Shipment.findById(req.params.id);
    res.json({
      success: true,
      message: 'Shipment updated successfully',
      data: shipment
    });
  } catch (error) {
    next(error);
  }
};

// Delete shipment
exports.deleteShipment = async (req, res, next) => {
  try {
    const deleted = await Shipment.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    res.json({
      success: true,
      message: 'Shipment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
exports.updateShipmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const shipmentId = req.params.id;

    const [result] = await db.pool.query(
      `UPDATE Shipment SET status = ?, 
       arrival_time = CASE WHEN ? = 'Delivered' THEN NOW() ELSE arrival_time END
       WHERE shipment_id = ?`,
      [status, status, shipmentId]
    );

    res.json({ success: true, message: 'Shipment status updated successfully' });
  } catch (error) {
    next(error);
  }
};
