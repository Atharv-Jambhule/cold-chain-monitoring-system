const db = require('../config/database');

class User {
  static async create(name, phone) {
    const [result] = await db.pool.query(
      "INSERT INTO Users (name, phone) VALUES (?, ?)",
      [name, phone]
    );
    return result.insertId;
  }

  static async findByPhone(phone) {
    const [rows] = await db.pool.query(
      "SELECT * FROM Users WHERE phone = ?",
      [phone]
    );
    return rows[0];
  }
}

module.exports = User;
