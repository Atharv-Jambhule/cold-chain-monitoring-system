const db = require('../config/database');

class SensorData {

  // Get all sensor data with storage details
  static async findAll(limit = 100) {
    const [rows] = await db.pool.query(`
      SELECT sd.sensor_id, sd.storage_id, su.name as storage_name, 
             su.type as storage_type, su.location,
             sd.recorded_at, sd.temperature, sd.humidity
      FROM SensorData sd
      JOIN StorageUnit su ON sd.storage_id = su.storage_id
      ORDER BY sd.recorded_at DESC
      LIMIT ?
    `, [limit]);
    return rows;
  }

  // Get sensor data by storage ID
  static async findByStorageId(storageId) {
    const [rows] = await db.pool.query(`
      SELECT sd.*, su.name as storage_name
      FROM SensorData sd
      JOIN StorageUnit su ON sd.storage_id = su.storage_id
      WHERE sd.storage_id = ?
      ORDER BY sd.recorded_at DESC
    `, [storageId]);
    return rows;
  }

  // Get sensor data by ID
  static async findById(id) {
    const [rows] = await db.pool.query(
      'SELECT * FROM SensorData WHERE sensor_id = ?',
      [id]
    );
    return rows[0];
  }

  // Create new sensor reading
  static async create(sensorData) {
    const { storage_id, temperature, humidity } = sensorData;
    const [result] = await db.pool.query(
      'INSERT INTO SensorData (storage_id, recorded_at, temperature, humidity) VALUES (?, NOW(), ?, ?)',
      [storage_id, temperature, humidity]
    );
    return result.insertId;
  }

  // Get latest reading for each storage unit
  static async getLatestByStorage() {
    const [rows] = await db.pool.query(`
      SELECT sd.*, su.name as storage_name, su.type
      FROM SensorData sd
      JOIN StorageUnit su ON sd.storage_id = su.storage_id
      WHERE sd.sensor_id IN (
        SELECT MAX(sensor_id)
        FROM SensorData
        GROUP BY storage_id
      )
      ORDER BY sd.recorded_at DESC
    `);
    return rows;
  }

  // Get sensor data count
  static async count() {
    const [rows] = await db.pool.query('SELECT COUNT(*) as count FROM SensorData');
    return rows[0].count;
  }

  // Get average temperature by storage and date
  static async getAverageByStorageAndDate() {
    const [rows] = await db.pool.query(`
      SELECT su.name as storage_unit, DATE(sd.recorded_at) as date,
             ROUND(AVG(sd.temperature), 2) as avg_temp,
             ROUND(AVG(sd.humidity), 2) as avg_humidity
      FROM SensorData sd
      JOIN StorageUnit su ON sd.storage_id = su.storage_id
      GROUP BY su.storage_id, su.name, DATE(sd.recorded_at)
      ORDER BY date DESC, su.name
      LIMIT 50
    `);
    return rows;
  }

  // ✅ NEW: Get storage + product + safe temperature range for alert message
  static async getSensorContext(sensor_id) {
    const [rows] = await db.pool.query(`
      SELECT 
        sd.sensor_id,
        sd.temperature,
        p.name AS product_name,
        p.min_temp,
        p.max_temp,
        su.name AS storage_name
      FROM SensorData sd
      JOIN Shipment s ON sd.storage_id = s.storage_id AND s.status = 'In Transit'
      JOIN Product p ON s.product_id = p.product_id
      JOIN StorageUnit su ON sd.storage_id = su.storage_id
      WHERE sd.sensor_id = ?
      ORDER BY s.departure_time DESC
      LIMIT 1
    `, [sensor_id]);

    return rows[0];
  }

}

module.exports = SensorData;
