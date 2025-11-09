const db = require('../config/database');

class Shipment {
  // Get all shipments with details
  static async findAll() {
    const [rows] = await db.pool.query(`
      SELECT s.shipment_id, s.product_id, p.name as product_name, p.batch_no,
             s.storage_id, su.name as storage_name, su.type as storage_type,
             s.departure_time, s.arrival_time, s.status,
             TIMESTAMPDIFF(HOUR, s.departure_time, COALESCE(s.arrival_time, NOW())) as travel_hours
      FROM Shipment s
      JOIN Product p ON s.product_id = p.product_id
      JOIN StorageUnit su ON s.storage_id = su.storage_id
      ORDER BY s.departure_time DESC
    `);
    return rows;
  }

  // Get shipment by ID
  static async findById(id) {
    const [rows] = await db.pool.query(`
      SELECT s.*, p.name as product_name, p.batch_no,
             su.name as storage_name, su.type as storage_type
      FROM Shipment s
      JOIN Product p ON s.product_id = p.product_id
      JOIN StorageUnit su ON s.storage_id = su.storage_id
      WHERE s.shipment_id = ?
    `, [id]);
    return rows[0];
  }

  // Get shipments by status
  static async findByStatus(status) {
    const [rows] = await db.pool.query(`
      SELECT s.*, p.name as product_name, su.name as storage_name
      FROM Shipment s
      JOIN Product p ON s.product_id = p.product_id
      JOIN StorageUnit su ON s.storage_id = su.storage_id
      WHERE s.status = ?
      ORDER BY s.departure_time DESC
    `, [status]);
    return rows;
  }

  // Create new shipment
  static async create(shipmentData) {
    const { product_id, storage_id, departure_time, arrival_time, status } = shipmentData;
    const [result] = await db.pool.query(
      'INSERT INTO Shipment (product_id, storage_id, departure_time, arrival_time, status) VALUES (?, ?, ?, ?, ?)',
      [product_id, storage_id, departure_time, arrival_time, status || 'In Transit']
    );
    return result.insertId;
  }

  // Update shipment
  static async update(id, shipmentData) {
    const { arrival_time, status } = shipmentData;
    const [result] = await db.pool.query(
      'UPDATE Shipment SET arrival_time = ?, status = ? WHERE shipment_id = ?',
      [arrival_time, status, id]
    );
    return result.affectedRows > 0;
  }

  // Delete shipment
  static async delete(id) {
    const [result] = await db.pool.query(
      'DELETE FROM Shipment WHERE shipment_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get shipment count
  static async count() {
    const [rows] = await db.pool.query('SELECT COUNT(*) as count FROM Shipment');
    return rows[0].count;
  }

  // Get in-transit count
  static async countInTransit() {
    const [rows] = await db.pool.query(
      "SELECT COUNT(*) as count FROM Shipment WHERE status = 'In Transit'"
    );
    return rows[0].count;
  }

  // Call stored procedure for shipment summary
  static async getSummary() {
    const [rows] = await db.pool.query('CALL sp_shipment_summary()');
    return rows[0];
  }
}

module.exports = Shipment;