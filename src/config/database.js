const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cold_chain_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL successfully');
    console.log('Database:', process.env.DB_NAME || 'cold_chain_db');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection error:', error.message);
    process.exit(1);
  }
}

// Close all connections
async function close() {
  try {
    await pool.end();
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}

module.exports = {
  pool,
  testConnection,
  close
};
