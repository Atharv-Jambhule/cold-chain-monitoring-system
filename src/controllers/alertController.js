const Alert = require('../models/Alert');
const db = require('../config/database');

// ✅ Get ALL alerts
exports.getAllAlerts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const alerts = await Alert.findAll(limit);
    return res.json({ success: true, data: alerts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Get RECENT alerts
exports.getRecentAlerts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  try {
    const [rows] = await db.pool.query(`
      SELECT a.alert_id, a.sensor_id, a.alert_time, a.message,
             su.name AS storage_name
      FROM Alerts a
      LEFT JOIN SensorData sd ON a.sensor_id = sd.sensor_id
      LEFT JOIN StorageUnit su ON sd.storage_id = su.storage_id
      ORDER BY a.alert_time DESC
      LIMIT ?
    `, [limit]);

    res.json({ success: true, data: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to load alerts" });
  }
};
