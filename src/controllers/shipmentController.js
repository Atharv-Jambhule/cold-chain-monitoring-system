const db = require('../config/database');

// ✅ Get all shipments (with duration calculation)
exports.getAllShipments = async (req, res) => {
  try {
    const [rows] = await db.pool.query(`
      SELECT 
        s.*,
        CASE 
          WHEN s.arrival_time IS NULL THEN 
            TIMESTAMPDIFF(HOUR, s.departure_time, NOW())
          ELSE 
            TIMESTAMPDIFF(HOUR, s.departure_time, s.arrival_time)
        END AS travel_hours
      FROM Shipment s
      ORDER BY s.shipment_id DESC
    `);
    

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Get one shipment by ID
exports.getShipmentById = async (req, res, next) => {
  try {
    const shipmentId = req.params.id;
    const [rows] = await db.pool.query(`SELECT * FROM Shipment WHERE shipment_id=?`, [shipmentId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

// ✅ Get shipments by status
exports.getShipmentsByStatus = async (req, res, next) => {
  try {
    const status = req.params.status;
    const [rows] = await db.pool.query(`SELECT * FROM Shipment WHERE status=?`, [status]);

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
};

// ✅ Create shipment
exports.createShipment = async (req, res, next) => {
  try {
    const { product_name, shipment_code, start_location, destination, status } = req.body;

    const [result] = await db.pool.query(`
      INSERT INTO Shipment (product_name, shipment_code, start_location, destination, status, departure_time)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [product_name, shipment_code, start_location, destination, status]);

    res.status(201).json({
      success: true,
      message: "Shipment created successfully",
      shipment_id: result.insertId
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Update shipment details
exports.updateShipment = async (req, res, next) => {
  try {
    const shipmentId = req.params.id;
    const updatedData = req.body;

    const fields = Object.keys(updatedData).map(key => `${key}=?`).join(', ');
    const values = Object.values(updatedData);

    await db.pool.query(`UPDATE Shipment SET ${fields} WHERE shipment_id=?`, [...values, shipmentId]);

    res.json({ success: true, message: "Shipment updated successfully" });
  } catch (error) {
    next(error);
  }
};

// ✅ Delete shipment
exports.deleteShipment = async (req, res, next) => {
  try {
    const shipmentId = req.params.id;
    await db.pool.query(`DELETE FROM Shipment WHERE shipment_id=?`, [shipmentId]);

    res.json({ success: true, message: "Shipment deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ✅ Update Shipment Status (Handles duration automatically)
exports.updateShipmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const shipmentId = req.params.id;

    if (status === "Delivered") {
      await db.pool.query(
        "UPDATE Shipment SET status=?, arrival_time=NOW() WHERE shipment_id=?",
        [status, shipmentId]
      );
    } else {
      await db.pool.query(
        "UPDATE Shipment SET status=?, arrival_time=NULL WHERE shipment_id=?",
        [status, shipmentId]
      );
    }

    res.json({ success: true, message: "Shipment status updated successfully" });
  } catch (error) {
    next(error);
  }
};
