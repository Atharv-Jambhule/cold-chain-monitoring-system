const db = require('../config/database');

class Alert {
  // 🔹 Get all alerts
  static async findAll(limit = 50) {
    const [rows] = await db.pool.query(`
      SELECT a.alert_id, a.sensor_id, a.alert_time, a.message,
             sd.storage_id, su.name AS storage_name, su.type AS storage_type
      FROM Alerts a
      LEFT JOIN SensorData sd ON a.sensor_id = sd.sensor_id
      LEFT JOIN StorageUnit su ON sd.storage_id = su.storage_id
      ORDER BY a.alert_time DESC
      LIMIT ?
    `, [limit]);
    return rows;
  }

  // 🔹 Get alert by ID
  static async findById(id) {
    const [rows] = await db.pool.query(
      'SELECT * FROM Alerts WHERE alert_id = ?',
      [id]
    );
    return rows[0];
  }

  // 🔹 Get recent alerts (last 24 hours)
  static async findRecent(limit = 10) {
    const [rows] = await db.pool.query(`
      SELECT a.alert_id, a.sensor_id, a.alert_time, a.message,
             sd.storage_id, su.name AS storage_name, su.type AS storage_type
      FROM Alerts a
      LEFT JOIN SensorData sd ON a.sensor_id = sd.sensor_id
      LEFT JOIN StorageUnit su ON sd.storage_id = su.storage_id
      WHERE a.alert_time >= NOW() - INTERVAL 24 HOUR
      ORDER BY a.alert_time DESC
      LIMIT ?
    `, [limit]);
    return rows;
  }

  // 🔹 Get alerts by storage ID
  static async findByStorageId(storageId) {
    const [rows] = await db.pool.query(`
      SELECT a.*, su.name AS storage_name
      FROM Alerts a
      JOIN SensorData sd ON a.sensor_id = sd.sensor_id
      JOIN StorageUnit su ON sd.storage_id = su.storage_id
      WHERE sd.storage_id = ?
      ORDER BY a.alert_time DESC
    `, [storageId]);
    return rows;
  }

  // 🔹 Create new alert
  static async create(alertData) {
    const { sensor_id, message } = alertData;
    const [result] = await db.pool.query(
      'INSERT INTO Alerts (sensor_id, alert_time, message) VALUES (?, NOW(), ?)',
      [sensor_id, message]
    );
    return result.insertId;
  }

  // 🔹 Delete alert
  static async delete(id) {
    const [result] = await db.pool.query(
      'DELETE FROM Alerts WHERE alert_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // 🔹 Count total alerts (used in dashboard)
  static async count() {
    const [rows] = await db.pool.query('SELECT COUNT(*) AS count FROM Alerts');
    return rows[0].count;
  }

  // 🔹 Count recent (24h) alerts (used in dashboard)
  static async countRecent() {
    const [rows] = await db.pool.query(`
      SELECT COUNT(*) AS count 
      FROM Alerts 
      WHERE alert_time >= NOW() - INTERVAL 24 HOUR
    `);
    return rows[0].count;
  }

  // 🔹 Most alert-prone storages
  static async getMostAlertProneStorage() {
    const [rows] = await db.pool.query(`
      SELECT su.storage_id, su.name AS storage, COUNT(a.alert_id) AS total_alerts
      FROM Alerts a
      JOIN SensorData sd ON a.sensor_id = sd.sensor_id
      JOIN StorageUnit su ON sd.storage_id = su.storage_id
      GROUP BY su.storage_id, su.name
      ORDER BY total_alerts DESC
      LIMIT 5
    `);
    return rows;
  }

  // 🔹 Run stored procedure to check expiry
  static async checkExpiry() {
    await db.pool.query('CALL sp_expiry_alerts()');
    return true;
  }
}

module.exports = Alert;
