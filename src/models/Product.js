const db = require('../config/database');

class Product {
  // Get all products
  static async findAll() {
    const [rows] = await db.pool.query(
      'SELECT product_id, name, batch_no, expiry_date, min_temp, max_temp FROM Product ORDER BY name'
    );
    return rows;
  }

  // Get product by ID
  static async findById(id) {
    const [rows] = await db.pool.query(
      'SELECT * FROM Product WHERE product_id = ?',
      [id]
    );
    return rows[0];
  }

  // Get products nearing expiry (within 30 days)
  static async findNearingExpiry() {
    const [rows] = await db.pool.query(
      'SELECT * FROM Product WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) ORDER BY expiry_date'
    );
    return rows;
  }

  // Create new product
  static async create(productData) {
    const { name, batch_no, expiry_date, min_temp, max_temp } = productData;
    const [result] = await db.pool.query(
      'INSERT INTO Product (name, batch_no, expiry_date, min_temp, max_temp) VALUES (?, ?, ?, ?, ?)',
      [name, batch_no, expiry_date, min_temp, max_temp]
    );
    return result.insertId;
  }

  // Update product
  static async update(id, productData) {
    const { name, batch_no, expiry_date, min_temp, max_temp } = productData;
    const [result] = await db.pool.query(
      'UPDATE Product SET name = ?, batch_no = ?, expiry_date = ?, min_temp = ?, max_temp = ? WHERE product_id = ?',
      [name, batch_no, expiry_date, min_temp, max_temp, id]
    );
    return result.affectedRows > 0;
  }

  // Delete product
  static async delete(id) {
    const [result] = await db.pool.query(
      'DELETE FROM Product WHERE product_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get product count
  static async count() {
    const [rows] = await db.pool.query('SELECT COUNT(*) as count FROM Product');
    return rows[0].count;
  }
}

module.exports = Product;