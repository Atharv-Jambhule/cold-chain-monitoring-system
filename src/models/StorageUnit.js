const db = require('../config/database');

class StorageUnit {
  // Get all storage units
  static async findAll() {
    const [rows] = await db.pool.query(
      'SELECT storage_id, name, location, type FROM StorageUnit ORDER BY name'
    );
    return rows;
  }

  // Get storage unit by ID
  static async findById(id) {
    const [rows] = await db.pool.query(
      'SELECT * FROM StorageUnit WHERE storage_id = ?',
      [id]
    );
    return rows[0];
  }

  // Get storage units by type
  static async findByType(type) {
    const [rows] = await db.pool.query(
      'SELECT * FROM StorageUnit WHERE type = ? ORDER BY name',
      [type]
    );
    return rows;
  }

  // Create new storage unit
  static async create(storageData) {
    const { name, location, type } = storageData;
    const [result] = await db.pool.query(
      'INSERT INTO StorageUnit (name, location, type) VALUES (?, ?, ?)',
      [name, location, type]
    );
    return result.insertId;
  }

  // Update storage unit
  static async update(id, storageData) {
    const { name, location, type } = storageData;
    const [result] = await db.pool.query(
      'UPDATE StorageUnit SET name = ?, location = ?, type = ? WHERE storage_id = ?',
      [name, location, type, id]
    );
    return result.affectedRows > 0;
  }

  // Delete storage unit
  static async delete(id) {
    const [result] = await db.pool.query(
      'DELETE FROM StorageUnit WHERE storage_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get storage count
  static async count() {
    const [rows] = await db.pool.query('SELECT COUNT(*) as count FROM StorageUnit');
    return rows[0].count;
  }

  // Get average temperature per storage unit
  static async getAverageTemperatures() {
    const [rows] = await db.pool.query(`
      SELECT su.storage_id, su.name, ROUND(AVG(sd.temperature), 2) as avg_temp,
             COUNT(sd.sensor_id) as reading_count
      FROM StorageUnit su
      LEFT JOIN SensorData sd ON su.storage_id = sd.storage_id
      GROUP BY su.storage_id, su.name
      ORDER BY su.name
    `);
    return rows;
  }
}

module.exports = StorageUnit;
