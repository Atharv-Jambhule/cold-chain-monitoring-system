# 🌡️ Cold Chain Monitoring System - MVC Structure

## 📁 Project Structure

```
cold-chain-monitoring/
├── src/
│   ├── config/
│   │   └── database.js         # Database configuration
│   ├── models/
│   │   ├── Product.js          # Product model
│   │   ├── StorageUnit.js      # Storage unit model
│   │   ├── Shipment.js         # Shipment model
│   │   ├── SensorData.js       # Sensor data model
│   │   └── Alert.js            # Alert model
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── storageController.js
│   │   ├── shipmentController.js
│   │   ├── sensorController.js
│   │   └── alertController.js
│   ├── routes/
│   │   ├── productRoutes.js
│   │   ├── storageRoutes.js
│   │   ├── shipmentRoutes.js
│   │   ├── sensorRoutes.js
│   │   ├── alertRoutes.js
│   │   └── index.js            # Route aggregator
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validator.js
│   └── utils/
│       └── helpers.js
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── dashboard.js
│   │   └── sensor-form.js
│   ├── index.html
│   └── dashboard.html
├── views/                       # Optional: if using template engine
├── .env
├── .gitignore
├── package.json
├── server.js                    # Main entry point
└── README.md
```

---

## 📄 File 1: `package.json`

```json
{
  "name": "cold-chain-monitoring-mvc",
  "version": "2.0.0",
  "description": "Cold Chain Monitoring System with MVC Architecture",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": ["cold-chain", "monitoring", "mysql", "express", "mvc"],
  "author": "Arya Khamaycha (Love)",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

---

## 📄 File 2: `.env`

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=cold_chain_db
DB_CONNECTION_LIMIT=10
```

---

## 📄 File 3: `server.js` (Main Entry Point)

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');
const db = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Test database connection
db.testConnection();

// API Routes
app.use('/api', routes);

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: 'MySQL'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard → http://localhost:${PORT}/dashboard`);
  console.log(`🔗 API Base URL → http://localhost:${PORT}/api`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await db.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});
```

---

## 📄 File 4: `src/config/database.js`

```javascript
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
```

---

## 📄 File 5: `src/models/Product.js`

```javascript
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
```

---

## 📄 File 6: `src/models/StorageUnit.js`

```javascript
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
```

---

## 📄 File 7: `src/models/Shipment.js`

```javascript
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
```

---

## 📄 File 8: `src/models/SensorData.js`

```javascript
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
}

module.exports = SensorData;
```

---

## 📄 File 9: `src/models/Alert.js`

```javascript
const db = require('../config/database');

class Alert {
  // Get all alerts
  static async findAll(limit = 50) {
    const [rows] = await db.pool.query(`
      SELECT a.alert_id, a.sensor_id, a.alert_time, a.message,
             sd.storage_id, su.name as storage_name, su.type as storage_type
      FROM Alerts a
      LEFT JOIN SensorData sd ON a.sensor_id = sd.sensor_id
      LEFT JOIN StorageUnit su ON sd.storage_id = su.storage_id
      ORDER BY a.alert_time DESC
      LIMIT ?
    `, [limit]);
    return rows;
  }

  // Get alert by ID
  static async findById(id) {
    const [rows] = await db.pool.query(
      'SELECT * FROM Alerts WHERE alert_id = ?',
      [id]
    );
    return rows[0];
  }

  // Get recent alerts (last 24 hours)
  static async findRecent() {
    const [rows] = await db.pool.query(`
      SELECT a.*, sd.storage_id, su.name as storage_name
      FROM Alerts a
      LEFT JOIN SensorData sd ON a.sensor_id = sd.sensor_id
      LEFT JOIN StorageUnit su ON sd.storage_id = su.storage_id
      WHERE a.alert_time >= NOW() - INTERVAL 24 HOUR
      ORDER BY a.alert_time DESC
    `);
    return rows;
  }

  // Get alerts by storage ID
  static async findByStorageId(storageId) {
    const [rows] = await db.pool.query(`
      SELECT a.*
      FROM Alerts a
      JOIN SensorData sd ON a.sensor_id = sd.sensor_id
      WHERE sd.storage_id = ?
      ORDER BY a.alert_time DESC
    `, [storageId]);
    return rows;
  }

  // Create manual alert
  static async create(alertData) {
    const { sensor_id, message } = alertData;
    const [result] = await db.pool.query(
      'INSERT INTO Alerts (sensor_id, alert_time, message) VALUES (?, NOW(), ?)',
      [sensor_id, message]
    );
    return result.insertId;
  }

  // Delete alert
  static async delete(id) {
    const [result] = await db.pool.query(
      'DELETE FROM Alerts WHERE alert_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get alert count
  static async count() {
    const [rows] = await db.pool.query('SELECT COUNT(*) as count FROM Alerts');
    return rows[0].count;
  }

  // Get recent alert count
  static async countRecent() {
    const [rows] = await db.pool.query(
      'SELECT COUNT(*) as count FROM Alerts WHERE alert_time >= NOW() - INTERVAL 24 HOUR'
    );
    return rows[0].count;
  }

  // Get most alert-prone storage unit
  static async getMostAlertProneStorage() {
    const [rows] = await db.pool.query(`
      SELECT su.storage_id, su.name as storage, COUNT(a.alert_id) as total_alerts
      FROM Alerts a
      JOIN SensorData sd ON a.sensor_id = sd.sensor_id
      JOIN StorageUnit su ON sd.storage_id = su.storage_id
      GROUP BY su.storage_id, su.name
      ORDER BY total_alerts DESC
      LIMIT 5
    `);
    return rows;
  }

  // Call stored procedure to check expiry
  static async checkExpiry() {
    await db.pool.query('CALL sp_expiry_alerts()');
    return true;
  }
}

module.exports = Alert;
```

---

## 📄 File 10: `src/controllers/productController.js`

```javascript
const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.json({
      success: true,
      message: 'Products retrieved successfully',
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Get product by ID
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Get products nearing expiry
exports.getProductsNearingExpiry = async (req, res, next) => {
  try {
    const products = await Product.findNearingExpiry();
    res.json({
      success: true,
      message: 'Products nearing expiry retrieved',
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Create new product
exports.createProduct = async (req, res, next) => {
  try {
    const productId = await Product.create(req.body);
    const product = await Product.findById(productId);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Update product
exports.updateProduct = async (req, res, next) => {
  try {
    const updated = await Product.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    const product = await Product.findById(req.params.id);
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 📄 File 11: `src/controllers/storageController.js`

```javascript
const StorageUnit = require('../models/StorageUnit');

// Get all storage units
exports.getAllStorageUnits = async (req, res, next) => {
  try {
    const storageUnits = await StorageUnit.findAll();
    res.json({
      success: true,
      message: 'Storage units retrieved successfully',
      count: storageUnits.length,
      data: storageUnits
    });
  } catch (error) {
    next(error);
  }
};

// Get storage unit by ID
exports.getStorageUnitById = async (req, res, next) => {
  try {
    const storageUnit = await StorageUnit.findById(req.params.id);
    if (!storageUnit) {
      return res.status(404).json({
        success: false,
        message: 'Storage unit not found'
      });
    }
    res.json({
      success: true,
      data: storageUnit
    });
  } catch (error) {
    next(error);
  }
};

// Get storage units by type
exports.getStorageUnitsByType = async (req, res, next) => {
  try {
    const storageUnits = await StorageUnit.findByType(req.params.type);
    res.json({
      success: true,
      count: storageUnits.length,
      data: storageUnits
    });
  } catch (error) {
    next(error);
  }
};

// Get average temperatures
exports.getAverageTemperatures = async (req, res, next) => {
  try {
    const temps = await StorageUnit.getAverageTemperatures();
    res.json({
      success: true,
      data: temps
    });
  } catch (error) {
    next(error);
  }
};

// Create storage unit
exports.createStorageUnit = async (req, res, next) => {
  try {
    const storageId = await StorageUnit.create(req.body);
    const storageUnit = await StorageUnit.findById(storageId);
    res.status(201).json({
      success: true,
      message: 'Storage unit created successfully',
      data: storageUnit
    });
  } catch (error) {
    next(error);
  }
};

// Update storage unit
exports.updateStorageUnit = async (req, res, next) => {
  try {
    const updated = await StorageUnit.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Storage unit not found'
      });
    }
    const storageUnit = await StorageUnit.findById(req.params.id);
    res.json({
      success: true,
      message: 'Storage unit updated successfully',
      data: storageUnit
    });
  } catch (error) {
    next(error);
  }
};

// Delete storage unit
exports.deleteStorageUnit = async (req, res, next) => {
  try {
    const deleted = await StorageUnit.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Storage unit not found'
      });
    }
    res.json({
      success: true,
      message: 'Storage unit deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 📄 File 12: `src/controllers/shipmentController.js`

```javascript
const Shipment = require('../models/Shipment');

// Get all shipments
exports.getAllShipments = async (req, res, next) => {
  try {
    const shipments = await Shipment.findAll();
    res.json({
      success: true,
      message: 'Shipments retrieved successfully',
      count: shipments.length,
      data: shipments
    });
  } catch (error) {
    next(error);
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
    const shipmentId = await Shipment.create(req.body);
    const shipment = await Shipment.findById(shipmentId);
    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: shipment
    });
  } catch (error) {
    next(error);
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
```

---

## 📄 File 13: `src/controllers/sensorController.js`

```javascript
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');

// Get all sensor data
exports.getAllSensorData = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const sensorData = await SensorData.findAll(limit);
    res.json({
      success: true,
      message: 'Sensor data retrieved successfully',
      count: sensorData.length,
      data: sensorData
    });
  } catch (error) {
    next(error);
  }
};

// Get sensor data by storage ID
exports.getSensorDataByStorage = async (req, res, next) => {
  try {
    const sensorData = await SensorData.findByStorageId(req.params.storageId);
    res.json({
      success: true,
      count: sensorData.length,
      data: sensorData
    });
  } catch (error) {
    next(error);
  }
};

// Get latest readings by storage
exports.getLatestReadings = async (req, res, next) => {
  try {
    const readings = await SensorData.getLatestByStorage();
    res.json({
      success: true,
      data: readings
    });
  } catch (error) {
    next(error);
  }
};

// Get average data by storage and date
exports.getAverageData = async (req, res, next) => {
  try {
    const averages = await SensorData.getAverageByStorageAndDate();
    res.json({
      success: true,
      data: averages
    });
  } catch (error) {
    next(error);
  }
};

// Create sensor reading
exports.createSensorReading = async (req, res, next) => {
  try {
    const { storage_id, temperature, humidity } = req.body;

    // Validate required fields
    if (!storage_id || temperature === undefined || humidity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: storage_id, temperature, humidity'
      });
    }

    // Create sensor reading
    const sensorId = await SensorData.create(req.body);

    // Check for triggered alerts
    const [alerts] = await Alert.findById(sensorId);
    
    const response = {
      success: true,
      message: 'Sensor data logged successfully',
      data: {
        sensor_id: sensorId,
        storage_id,
        temperature,
        humidity
      }
    };

    // Include alert if triggered
    if (alerts && alerts.length > 0) {
      response.alert = alerts[0].message;
    }

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    const StorageUnit = require('../models/StorageUnit');
    const Shipment = require('../models/Shipment');

    const [
      productCount,
      storageCount,
      shipmentCount,
      sensorCount,
      alertCount,
      inTransitCount,
      recentAlertsCount,
      avgTemps
    ] = await Promise.all([
      Product.count(),
      StorageUnit.count(),
      Shipment.count(),
      SensorData.count(),
      Alert.count(),
      Shipment.countInTransit(),
      Alert.countRecent(),
      StorageUnit.getAverageTemperatures()
    ]);

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      stats: {
        products: productCount,
        storage_units: storageCount,
        shipments: shipmentCount,
        sensor_readings: sensorCount,
        total_alerts: alertCount,
        in_transit: inTransitCount,
        recent_alerts: recentAlertsCount
      },
      storage_avg_temps: avgTemps
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 📄 File 14: `src/controllers/alertController.js`

```javascript
const Alert = require('../models/Alert');

// Get all alerts
exports.getAllAlerts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const alerts = await Alert.findAll(limit);
    res.json({
      success: true,
      message: 'Alerts retrieved successfully',
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// Get alert by ID
exports.getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// Get recent alerts (24h)
exports.getRecentAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.findRecent();
    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// Get alerts by storage
exports.getAlertsByStorage = async (req, res, next) => {
  try {
    const alerts = await Alert.findByStorageId(req.params.storageId);
    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// Get most alert-prone storage
exports.getMostAlertProneStorage = async (req, res, next) => {
  try {
    const data = await Alert.getMostAlertProneStorage();
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    next(error);
  }
};

// Create manual alert
exports.createAlert = async (req, res, next) => {
  try {
    const alertId = await Alert.create(req.body);
    const alert = await Alert.findById(alertId);
    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// Check expiry alerts (stored procedure)
exports.checkExpiry = async (req, res, next) => {
  try {
    await Alert.checkExpiry();
    res.json({
      success: true,
      message: 'Expiry alerts checked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete alert
exports.deleteAlert = async (req, res, next) => {
  try {
    const deleted = await Alert.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 📄 File 15: `src/routes/productRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validateProduct } = require('../middleware/validator');

// GET routes
router.get('/', productController.getAllProducts);
router.get('/expiring', productController.getProductsNearingExpiry);
router.get('/:id', productController.getProductById);

// POST routes
router.post('/', validateProduct, productController.createProduct);

// PUT routes
router.put('/:id', validateProduct, productController.updateProduct);

// DELETE routes
router.delete('/:id', productController.deleteProduct);

module.exports = router;
```

---

## 📄 File 16: `src/routes/storageRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storageController');
const { validateStorageUnit } = require('../middleware/validator');

// GET routes
router.get('/', storageController.getAllStorageUnits);
router.get('/temperatures', storageController.getAverageTemperatures);
router.get('/type/:type', storageController.getStorageUnitsByType);
router.get('/:id', storageController.getStorageUnitById);

// POST routes
router.post('/', validateStorageUnit, storageController.createStorageUnit);

// PUT routes
router.put('/:id', validateStorageUnit, storageController.updateStorageUnit);

// DELETE routes
router.delete('/:id', storageController.deleteStorageUnit);

module.exports = router;
```

---

## 📄 File 17: `src/routes/shipmentRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { validateShipment } = require('../middleware/validator');

// GET routes
router.get('/', shipmentController.getAllShipments);
router.get('/summary', shipmentController.getShipmentSummary);
router.get('/status/:status', shipmentController.getShipmentsByStatus);
router.get('/:id', shipmentController.getShipmentById);

// POST routes
router.post('/', validateShipment, shipmentController.createShipment);

// PUT routes
router.put('/:id', shipmentController.updateShipment);

// DELETE routes
router.delete('/:id', shipmentController.deleteShipment);

module.exports = router;
```

---

## 📄 File 18: `src/routes/sensorRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const { validateSensorData } = require('../middleware/validator');

// GET routes
router.get('/', sensorController.getAllSensorData);
router.get('/latest', sensorController.getLatestReadings);
router.get('/averages', sensorController.getAverageData);
router.get('/dashboard-stats', sensorController.getDashboardStats);
router.get('/storage/:storageId', sensorController.getSensorDataByStorage);

// POST routes
router.post('/', validateSensorData, sensorController.createSensorReading);

module.exports = router;
```

---

## 📄 File 19: `src/routes/alertRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

// GET routes
router.get('/', alertController.getAllAlerts);
router.get('/recent', alertController.getRecentAlerts);
router.get('/prone-storage', alertController.getMostAlertProneStorage);
router.get('/storage/:storageId', alertController.getAlertsByStorage);
router.get('/:id', alertController.getAlertById);

// POST routes
router.post('/', alertController.createAlert);
router.post('/check-expiry', alertController.checkExpiry);

// DELETE routes
router.delete('/:id', alertController.deleteAlert);

module.exports = router;
```

---

## 📄 File 20: `src/routes/index.js`

```javascript
const express = require('express');
const router = express.Router();

// Import route modules
const productRoutes = require('./productRoutes');
const storageRoutes = require('./storageRoutes');
const shipmentRoutes = require('./shipmentRoutes');
const sensorRoutes = require('./sensorRoutes');
const alertRoutes = require('./alertRoutes');

// Mount routes
router.use('/products', productRoutes);
router.use('/storage-units', storageRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/sensor-data', sensorRoutes);
router.use('/alerts', alertRoutes);

// API info route
router.get('/', (req, res) => {
  res.json({
    message: 'Cold Chain Monitoring API',
    version: '2.0.0',
    endpoints: {
      products: '/api/products',
      storage_units: '/api/storage-units',
      shipments: '/api/shipments',
      sensor_data: '/api/sensor-data',
      alerts: '/api/alerts'
    }
  });
});

module.exports = router;
```

---

## 📄 File 21: `src/middleware/errorHandler.js`

```javascript
// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // MySQL errors
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        return res.status(409).json({
          success: false,
          message: 'Duplicate entry. Record already exists.',
          error: err.sqlMessage
        });
      
      case 'ER_NO_REFERENCED_ROW_2':
        return res.status(400).json({
          success: false,
          message: 'Invalid reference. Referenced record does not exist.',
          error: err.sqlMessage
        });
      
      case 'ER_BAD_FIELD_ERROR':
        return res.status(400).json({
          success: false,
          message: 'Invalid field in query.',
          error: err.sqlMessage
        });
      
      default:
        return res.status(500).json({
          success: false,
          message: 'Database error occurred',
          error: process.env.NODE_ENV === 'development' ? err.sqlMessage : 'Internal server error'
        });
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
```

---

## 📄 File 22: `src/middleware/validator.js`

```javascript
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
  body('name').notEmpty().withMessage('Storage unit name is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('type').isIn(['Warehouse', 'Truck', 'Cold Room']).withMessage('Invalid storage type'),
  validate
];

// Shipment validation rules
exports.validateShipment = [
  body('product_id').isInt().withMessage('Valid product ID is required'),
  body('storage_id').isInt().withMessage('Valid storage ID is required'),
  body('departure_time').isISO8601().withMessage('Valid departure time is required'),
  body('status').optional().isIn(['In Transit', 'Delivered']).withMessage('Invalid status'),
  validate
];

// Sensor data validation rules
exports.validateSensorData = [
  body('storage_id').isInt().withMessage('Valid storage ID is required'),
  body('temperature').isFloat().withMessage('Temperature must be a number'),
  body('humidity').isFloat({ min: 0, max: 100 }).withMessage('Humidity must be between 0 and 100'),
  validate
];
```

---

## 📄 File 23: `src/utils/helpers.js`

```javascript
// Helper utility functions

// Format date to MySQL datetime
exports.formatDateTime = (date) => {
  return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
};

// Check if temperature is within safe range
exports.isTempInRange = (temp, minTemp, maxTemp) => {
  return temp >= minTemp && temp <= maxTemp;
};

// Calculate temperature status
exports.getTempStatus = (temp, minTemp, maxTemp) => {
  if (temp < minTemp || temp > maxTemp) return 'Critical';
  const buffer = (maxTemp - minTemp) * 0.2;
  if (temp < minTemp + buffer || temp > maxTemp - buffer) return 'Warning';
  return 'Normal';
};

// Format response
exports.formatResponse = (success, message, data = null) => {
  const response = { success, message };
  if (data) response.data = data;
  return response;
};

// Calculate days until expiry
exports.daysUntilExpiry = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Pagination helper
exports.paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset: parseInt(offset) };
};
```

---

## 📄 File 24: `public/css/style.css`

```css
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

/* Form Container */
.form-container {
  background: #fff;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 400px;
  margin: 50px auto;
}

h2 {
  margin-bottom: 10px;
  color: #333;
  text-align: center;
}

.subtitle {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 25px;
  text-align: center;
}

/* Form Elements */
label {
  display: block;
  margin: 10px 0 5px;
  font-weight: 600;
  color: #555;
}

input, select {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
}

input:focus, select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
}

button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  font-size: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102,126,234,0.4);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Links */
.nav-link {
  display: inline-block;
  margin-top: 15px;
  text-decoration: none;
  color: #667eea;
  font-weight: 600;
}

.nav-link:hover {
  text-decoration: underline;
}

/* Messages */
.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Dashboard Styles */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

header {
  background: white;
  padding: 20px 30px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card .value {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin: 10px 0;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #555;
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

td {
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
}

tr:hover {
  background: #f8f9fa;
}

/* Status badges */
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}

.status-delivered {
  background: #d4edda;
  color: #155724;
}

.status-transit {
  background: #cce5ff;
  color: #004085;
}

/* Responsive */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 📄 File 25: `public/js/sensor-form.js`

```javascript
// Load storage units on page load
async function loadStorageUnits() {
  try {
    const res = await fetch('/api/storage-units');
    const data = await res.json();
    
    const select = document.getElementById('storage');
    data.data.forEach(unit => {
      const option = document.createElement('option');
      option.value = unit.storage_id;
      option.textContent = `${unit.name} (${unit.type}) - ${unit.location}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Error loading storage units:', err);
    showMessage('Failed to load storage units', 'error');
  }
}

// Show message
function showMessage(text, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  
  if (type === 'success') {
    setTimeout(() => {
      messageDiv.textContent = '';
      messageDiv.className = '';
    }, 3000);
  }
}

// Handle form submission
document.getElementById("logForm").onsubmit = async (e) => {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  
  const data = {
    storage_id: parseInt(document.getElementById("storage").value),
    temperature: parseFloat(document.getElementById("temp").value),
    humidity: parseFloat(document.getElementById("humidity").value)
  };

  try {
    const res = await fetch("/api/sensor-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (result.success) {
      showMessage('✅ Sensor data logged successfully!', 'success');
      document.getElementById('logForm').reset();
      
      // Show alert if temperature breach detected
      if (result.alert) {
        setTimeout(() => {
          showMessage(`⚠️ ${result.alert}`, 'error');
        }, 3500);
      }
    } else {
      showMessage(`❌ ${result.message || 'Failed to log data'}', 'error');
    }
  } catch (err) {
    console.error("Error:", err);
    showMessage("❌ Error submitting log.", 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Sensor Data';
  }
};

// Initialize
loadStorageUnits();
```

---

## 📄 File 26: `public/js/dashboard.js`

```javascript
// Format date/time
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', { 
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// Load dashboard statistics
async function loadStats() {
  try {
    const res = await fetch('/api/sensor-data/dashboard-stats');
    const data = await res.json();
    
    if (data.success) {
      document.getElementById('stat-products').textContent = data.stats.products;
      document.getElementById('stat-storage').textContent = data.stats.storage_units;
      document.getElementById('stat-shipments').textContent = data.stats.shipments;
      document.getElementById('stat-sensors').textContent = data.stats.sensor_readings;
      document.getElementById('stat-alerts').textContent = data.stats.total_alerts;
      document.getElementById('stat-recent').textContent = data.stats.recent_alerts;
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// Load alerts
async function loadAlerts() {
  const container = document.getElementById('alerts-container');
  try {
    const res = await fetch('/api/alerts?limit=10');
    const data = await res.json();
    
    if (!data.success || data.data.length === 0) {
      container.innerHTML = '<div class="empty-state">No alerts found</div>';
      return;
    }

    const html = `
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Message</th>
            <th>Storage</th>
          </tr>
        </thead>
        <tbody>
          ${data.data.map(alert => `
            <tr>
              <td>${formatDateTime(alert.alert_time)}</td>
              <td class="alert-message">${alert.message}</td>
              <td>${alert.storage_name || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    container.innerHTML = html;
  } catch (err) {
    console.error('Error loading alerts:', err);
    container.innerHTML = '<div class="empty-state">Failed to load alerts</div>';
  }
}

// Load sensor data
async function loadSensorData() {
  const container = document.getElementById('sensors-container');
  try {
    const res = await fetch('/api/sensor-data?limit=15');
    const data = await res.json();
    
    if (!data.success || data.data.length === 0) {
      container.innerHTML = '<div class="empty-state">No sensor data found</div>';
      return;
    }

    const html = `
      <table>
        <thead>
          <tr>
            <th>Storage Unit</th>
            <th>Temperature</th>
            <th>Humidity</th>
            <th>Recorded At</th>
          </tr>
        </thead>
        <tbody>
          ${data.data.map(sensor => `
            <tr>
              <td>
                <strong>${sensor.storage_name}</strong><br>
                <small style="color: #666">${sensor.storage_type}</small>
              </td>
              <td><span class="temp-value">${sensor.temperature}°C</span></td>
              <td>${sensor.humidity}%</td>
              <td>${formatDateTime(sensor.recorded_at)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    container.innerHTML = html;
  } catch (err) {
    console.error('Error loading sensor data:', err);
    container.innerHTML = '<div class="empty-state">Failed to load sensor data</div>';
  }
}

// Load shipments
async function loadShipments() {
  const container = document.getElementById('shipments-container');
  try {
    const res = await fetch('/api/shipments');
    const data = await res.json();
    
    if (!data.success || data.data.length === 0) {
      container.innerHTML = '<div class="empty-state">No shipments found</div>';
      return;
    }

    const html = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Storage Unit</th>
            <th>Status</th>
            <th>Departure</th>
            <th>Arrival</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${data.data.map(shipment => `
            <tr>
              <td>#${shipment.shipment_id}</td>
              <td>
                <strong>${shipment.product_name}</strong><br>
                <small style="color: #666">${shipment.batch_no}</small>
              </td>
              <td>
                ${shipment.storage_name}<br>
                <small style="color: #666">${shipment.storage_type}</small>
              </td>
              <td>
                <span class="status-badge ${shipment.status === 'Delivered' ? 'status-delivered' : 'status-transit'}">
                  ${shipment.status}
                </span>
              </td>
              <td>${formatDateTime(shipment.departure_time)}</td>
              <td>${shipment.arrival_time ? formatDateTime(shipment.arrival_time) : 'In Transit'}</td>
              <td>${shipment.travel_hours || 0}h</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    container.innerHTML = html;
  } catch (err) {
    console.error('Error loading shipments:', err);
    container.innerHTML = '<div class="empty-state">Failed to load shipments</div>';
  }
}

// Refresh all data
async function refreshData() {
  await Promise.all([
    loadStats(),
    loadAlerts(),
    loadSensorData(),
    loadShipments()
  ]);
}

// Auto-refresh every 30 seconds
setInterval(refreshData, 30000);

// Initial load
refreshData();
```

---

## 📄 File 27: `.gitignore`

```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Build files
dist/
build/

# Coverage
coverage/

# Testing
.nyc_output/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache
```

---

## 📄 File 28: `README.md` (MVC Version)

```markdown
# 🌡️ Cold Chain Monitoring System - MVC Architecture

**Author:** Arya Khamaycha (Love)  
**Institute:** VIT Pune | Year: 2025  
**Architecture:** Model-View-Controller (MVC)

---

## 📋 Project Overview

A professional cold chain monitoring system built with **MVC architecture** for better code organization, maintainability, and scalability.

### 🏗️ Architecture Pattern: MVC

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (Browser)                  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP Request
                       ↓
┌─────────────────────────────────────────────────────┐
│                  ROUTES (Router)                    │
│  - Define endpoints & map to controllers           │
└──────────────────────┬──────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│              CONTROLLERS (Business Logic)           │
│  - Handle requests & responses                      │
│  - Call model methods                               │
│  - Send formatted responses                         │
└──────────────────────┬──────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│               MODELS (Data Layer)                   │
│  - Interact with database                           │
│  - Execute queries                                  │
│  - Return data                                      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│                 DATABASE (MySQL)                    │
│  - Store persistent data                            │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Complete Project Structure

```
cold-chain-monitoring/
│
├── src/                          # Source code
│   ├── config/                   # Configuration files
│   │   └── database.js          # Database connection pool
│   │
│   ├── models/                   # Data models (Database layer)
│   │   ├── Product.js           # Product CRUD operations
│   │   ├── StorageUnit.js       # Storage unit operations
│   │   ├── Shipment.js          # Shipment operations
│   │   ├── SensorData.js        # Sensor data operations
│   │   └── Alert.js             # Alert operations
│   │
│   ├── controllers/              # Business logic layer
│   │   ├── productController.js
│   │   ├── storageController.js
│   │   ├── shipmentController.js
│   │   ├── sensorController.js
│   │   └── alertController.js
│   │
│   ├── routes/                   # API routes
│   │   ├── productRoutes.js
│   │   ├── storageRoutes.js
│   │   ├── shipmentRoutes.js
│   │   ├── sensorRoutes.js
│   │   ├── alertRoutes.js
│   │   └── index.js             # Route aggregator
│   │
│   ├── middleware/               # Custom middleware
│   │   ├── errorHandler.js      # Global error handling
│   │   └── validator.js         # Request validation
│   │
│   └── utils/                    # Helper functions
│       └── helpers.js
│
├── public/                       # Static files
│   ├── css/
│   │   └── style.css            # Shared styles
│   ├── js/
│   │   ├── sensor-form.js       # Form logic
│   │   └── dashboard.js         # Dashboard logic
│   ├── index.html               # Sensor entry form
│   └── dashboard.html           # Dashboard view
│
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
├── server.js                     # Entry point
└── README.md                     # Documentation
```

---

## 🚀 Installation Guide

### Step 1: Clone/Create Project

```bash
# Create project directory
mkdir cold-chain-monitoring
cd cold-chain-monitoring

# Initialize package.json
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install express mysql2 cors dotenv express-validator
npm install --save-dev nodemon
```

### Step 3: Create Directory Structure

```bash
# Create folders
mkdir -p src/{config,models,controllers,routes,middleware,utils}
mkdir -p public/{css,js}

# Create files (you'll copy content into these)
touch server.js .env .gitignore
touch src/config/database.js
touch src/models/{Product,StorageUnit,Shipment,SensorData,Alert}.js
touch src/controllers/{productController,storageController,shipmentController,sensorController,alertController}.js
touch src/routes/{productRoutes,storageRoutes,shipmentRoutes,sensorRoutes,alertRoutes,index}.js
touch src/middleware/{errorHandler,validator}.js
touch src/utils/helpers.js
touch public/css/style.css
touch public/js/{sensor-form,dashboard}.js
touch public/{index,dashboard}.html
```

### Step 4: Configure Environment

Create `.env` file:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cold_chain_db
DB_CONNECTION_LIMIT=10
```

### Step 5: Setup Database

```bash
# Run SQL script
mysql -u root -p < cold_chain_final.sql

# Verify
mysql -u root -p
USE cold_chain_db;
SHOW TABLES;
```

### Step 6: Copy All Code Files

Copy the content from all 28 files provided above into their respective locations.

### Step 7: Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

---

## 📡 API Endpoints Reference

### Products
```
GET    /api/products              - Get all products
GET    /api/products/:id          - Get product by ID
GET    /api/products/expiring     - Get expiring products
POST   /api/products              - Create product
PUT    /api/products/:id          - Update product
DELETE /api/products/:id          - Delete product
```

### Storage Units
```
GET    /api/storage-units         - Get all storage units
GET    /api/storage-units/:id     - Get storage unit by ID
GET    /api/storage-units/type/:type - Get by type
GET    /api/storage-units/temperatures - Get avg temperatures
POST   /api/storage-units         - Create storage unit
PUT    /api/storage-units/:id     - Update storage unit
DELETE /api/storage-units/:id     - Delete storage unit
```

### Shipments
```
GET    /api/shipments             - Get all shipments
GET    /api/shipments/:id         - Get shipment by ID
GET    /api/shipments/status/:status - Get by status
GET    /api/shipments/summary     - Get summary (stored proc)
POST   /api/shipments             - Create shipment
PUT    /api/shipments/:id         - Update shipment
DELETE /api/shipments/:id         - Delete shipment
```

### Sensor Data
```
GET    /api/sensor-data           - Get all sensor data
GET    /api/sensor-data/latest    - Get latest readings
GET    /api/sensor-data/averages  - Get averages
GET    /api/sensor-data/dashboard-stats - Get dashboard stats
GET    /api/sensor-data/storage/:id - Get by storage
POST   /api/sensor-data           - Log sensor reading
```

### Alerts
```
GET    /api/alerts                - Get all alerts
GET    /api/alerts/:id            - Get alert by ID
GET    /api/alerts/recent         - Get recent (24h)
GET    /api/alerts/prone-storage  - Most alert-prone storage
GET    /api/alerts/storage/:id    - Get by storage
POST   /api/alerts                - Create manual alert
POST   /api/alerts/check-expiry   - Run expiry check
DELETE /api/alerts/:id            - Delete alert
```

---

## 🎯 Key Features of MVC Architecture

### ✅ Separation of Concerns
- **Models** handle database operations only
- **Controllers** manage business logic
- **Routes** define API endpoints
- **Views** (HTML/JS) handle presentation

### ✅ Code Reusability
- Models can be used across multiple controllers
- Controllers can be easily tested
- Middleware is reusable

### ✅ Maintainability
- Easy to locate and fix bugs
- Clear file organization
- Each component has single responsibility

### ✅ Scalability
- Easy to add new features
- Can split into microservices later
- Team members can work on different layers

### ✅ Security
- Input validation middleware
- Error handling middleware
- Prepared statements in models

---

## 🔄 Request Flow Example

**Example: Creating Sensor Data**

```
1. Client sends POST request → /api/sensor-data
   Body: { storage_id: 1, temperature: 5.5, humidity: 55 }

2. Route receives request → sensorRoutes.js
   Applies validation middleware → validator.js

3. Controller processes → sensorController.createSensorReading()
   - Validates data
   - Calls model method

4. Model executes → SensorData.create()
   - Inserts into database
   - Returns sensor_id

5. Controller formats response → sends JSON
   { success: true, message: "...", data: {...} }

6. Client receives response
```

---

## 🧪 Testing API with cURL

```bash
# Get all products
curl http://localhost:3000/api/products

# Create sensor reading
curl -X POST http://localhost:3000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"storage_id":1,"temperature":5.5,"humidity":55.0}'

# Get dashboard stats
curl http://localhost:3000/api/sensor-data/dashboard-stats

# Get recent alerts
curl http://localhost:3000/api/alerts/recent
```

---

## 📊 Database Schema Integration

This MVC structure integrates with your existing SQL schema:

- **Product** ↔ Product model
- **StorageUnit** ↔ StorageUnit model
- **Shipment** ↔ Shipment model
- **SensorData** ↔ SensorData model
- **Alerts** ↔ Alert model

All triggers and stored procedures work automatically!

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env or kill process
lsof -ti:3000 | xargs kill
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Error
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `.env`
- Ensure database exists: `SHOW DATABASES;`

### Validation Errors
- Check request body matches validation rules
- Use proper data types (numbers for IDs, etc.)

---

## 🎓 Learning Outcomes

### MVC Concepts
✅ Understanding separation of concerns  
✅ Implementing layered architecture  
✅ Using middleware effectively  
✅ RESTful API design patterns  

### Database Skills
✅ MySQL connection pooling  
✅ Prepared statements (SQL injection prevention)  
✅ Transaction handling  
✅ Stored procedures integration  

### Node.js/Express
✅ Express routing  
✅ Async/await patterns  
✅ Error handling  
✅ Request validation  

---

## 📈 Next Steps & Enhancements

- [ ] Add JWT authentication
- [ ] Implement role-based access control
- [ ] Add unit tests (Jest/Mocha)
- [ ] API documentation (Swagger)
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] WebSocket for real-time updates
- [ ] Data visualization charts

---

## 📞 Support

- **Email:** your-email@example.com
- **GitHub:** github.com/your-username
- **Documentation:** Full API docs coming soon

---

## 📄 License

MIT License - Free for educational and commercial use

---

**Built with ❤️ using MVC Architecture**  
**VIT Pune - DBMS Course 2025**
```

---

## 🎯 Quick Start Commands Summary

```bash
# 1. Install dependencies
npm install

# 2. Configure .env with your MySQL credentials

# 3. Create folder structure
mkdir -p src/{config,models,controllers,routes,middleware,utils}
mkdir -p public/{css,js}

# 4. Copy all code files to their locations

# 5. Run SQL script
mysql -u root -p < cold_chain_final.sql

# 6. Start development server
npm run dev

# 7. Access application
# Form: http://localhost:3000
# Dashboard: http://localhost:3000/dashboard
# API: http://localhost:3000/api
```

---

## ✅ Verification Checklist

- [ ] All dependencies installed
- [ ] Folder structure created
- [ ] All 28 files copied
- [ ] `.env` configured
- [ ] Database created and populated
- [ ] Server starts without errors
- [ ] Can access form and dashboard
- [ ] API endpoints responding
- [ ] Sensor data can be logged
- [ ] Dashboard shows statistics

---

**🎉 MVC Structure Complete!**

This professional architecture provides:
- ✅ Clean code organization
- ✅ Easy maintenance
- ✅ Better testability
- ✅ Team collaboration ready
- ✅ Production-ready structure