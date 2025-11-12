const Alert = require('../models/Alert');
const db = require('../config/database');

// ✅ Get ALL alerts
exports.getAllAlerts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const alerts = await Alert.findAll(limit);
    return res.json({ success: true, data: alerts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Get RECENT alerts (last 24h)
// ✅ Get RECENT alerts (last 7 days fallback)
exports.getRecentAlerts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  try {
    const [rows] = await db.pool.query(`
      SELECT 
        a.alert_id, 
        a.sensor_id, 
        a.alert_time, 
        a.message,
        su.name AS storage_name,
        su.type AS storage_type
      FROM Alerts a
      LEFT JOIN SensorData sd ON a.sensor_id = sd.sensor_id
      LEFT JOIN StorageUnit su ON sd.storage_id = su.storage_id
      WHERE a.alert_time >= NOW() - INTERVAL 7 DAY  -- ✅ extended range
      ORDER BY a.alert_time DESC
      LIMIT ?
    `, [limit]);

    if (!rows.length) {
      // ✅ fallback: show latest 10 even if older than 7 days
      const [fallback] = await db.pool.query(`
        SELECT 
          a.alert_id, 
          a.sensor_id, 
          a.alert_time, 
          a.message,
          su.name AS storage_name,
          su.type AS storage_type
        FROM Alerts a
        LEFT JOIN SensorData sd ON a.sensor_id = sd.sensor_id
        LEFT JOIN StorageUnit su ON sd.storage_id = su.storage_id
        ORDER BY a.alert_time DESC
        LIMIT ?
      `, [limit]);
      return res.json({ success: true, data: fallback });
    }

    res.json({ success: true, data: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to load recent alerts" });
  }
};
