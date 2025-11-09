-- ==========================================================
--  COLD CHAIN MONITORING SYSTEM
--  Author: Arya Khamaycha (Love)
--  Role: Database Developer – DBMS Course Project
--  Institute: VIT Pune | Year: 2025
-- ==========================================================

-- 1️⃣ Create and use database
DROP DATABASE IF EXISTS cold_chain_db;
CREATE DATABASE cold_chain_db;
USE cold_chain_db;

-- 2️⃣ Create tables
CREATE TABLE Product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    batch_no VARCHAR(100) UNIQUE,
    expiry_date DATE,
    min_temp FLOAT,
    max_temp FLOAT
);

CREATE TABLE StorageUnit (
    storage_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(150),
    type ENUM('Warehouse','Truck','Cold Room') NOT NULL
);

CREATE TABLE Shipment (
    shipment_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    storage_id INT,
    departure_time DATETIME,
    arrival_time DATETIME,
    status ENUM('In Transit','Delivered') DEFAULT 'In Transit',
    FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE,
    FOREIGN KEY (storage_id) REFERENCES StorageUnit(storage_id) ON DELETE CASCADE
);

CREATE TABLE SensorData (
    sensor_id INT AUTO_INCREMENT PRIMARY KEY,
    storage_id INT,
    recorded_at DATETIME,
    temperature FLOAT,
    humidity FLOAT,
    FOREIGN KEY (storage_id) REFERENCES StorageUnit(storage_id) ON DELETE CASCADE
);

CREATE TABLE Alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id INT NULL,
    alert_time DATETIME,
    message TEXT,
    FOREIGN KEY (sensor_id) REFERENCES SensorData(sensor_id) ON DELETE SET NULL
);

-- 3️⃣ Insert Products
INSERT INTO Product (name, batch_no, expiry_date, min_temp, max_temp) VALUES
('COVID-19 Vaccine', 'COVAX001', '2026-01-15', 2.0, 8.0),
('Insulin Injection', 'INS2024A', '2025-09-10', 2.0, 8.0),
('Frozen Peas', 'FRZP789', '2025-12-01', -20.0, -10.0),
('Ice Cream - Vanilla', 'ICV123', '2025-07-30', -18.0, -8.0),
('Blood Plasma', 'BP4521', '2025-06-01', -25.0, -15.0),
('Fresh Dairy Milk', 'MILK988', '2024-11-25', 1.0, 5.0),
('COVID-19 Booster', 'BOOST567', '2026-03-11', 2.0, 8.0),
('Frozen Chicken', 'CHKN001', '2025-10-20', -18.0, -12.0),
('Organic Juice', 'JUICE555', '2025-11-15', 1.0, 6.0),
('Eye Drops', 'EYE009', '2026-02-01', 2.0, 8.0);

-- 4️⃣ Insert Storage Units
INSERT INTO StorageUnit (name, location, type) VALUES
('Warehouse A', 'Pune', 'Warehouse'),
('Warehouse B', 'Mumbai', 'Warehouse'),
('Truck T-101', 'Mumbai-Pune Highway', 'Truck'),
('Truck T-205', 'Nagpur Route', 'Truck'),
('Cold Room CR-07', 'Nashik', 'Cold Room');

-- 5️⃣ Shipments (Product → Storage)
INSERT INTO Shipment (product_id, storage_id, departure_time, arrival_time, status) VALUES
(1, 3, '2025-09-29 08:30:00', '2025-09-29 14:30:00', 'Delivered'),
(2, 4, '2025-09-30 09:00:00', '2025-09-30 17:00:00', 'Delivered'),
(3, 3, '2025-10-01 10:00:00', '2025-10-01 15:30:00', 'Delivered'),
(4, 4, '2025-10-02 11:00:00', '2025-10-02 16:00:00', 'In Transit'),
(5, 1, '2025-10-03 07:00:00', '2025-10-03 11:00:00', 'Delivered'),
(6, 2, '2025-10-04 06:00:00', '2025-10-04 12:00:00', 'Delivered'),
(7, 5, '2025-10-05 09:00:00', '2025-10-05 18:00:00', 'In Transit'),
(8, 3, '2025-10-05 08:00:00', '2025-10-05 14:00:00', 'Delivered'),
(9, 4, '2025-10-06 07:30:00', '2025-10-06 15:30:00', 'Delivered'),
(10, 1, '2025-10-07 06:30:00', '2025-10-07 14:30:00', 'Delivered');

-- 6️⃣ Sensor Data (some breaches)
INSERT INTO SensorData (storage_id, recorded_at, temperature, humidity) VALUES
(1, '2025-10-01 08:00:00', 5.0, 55.0),
(1, '2025-10-01 12:00:00', 7.5, 60.0),
(1, '2025-10-01 18:00:00', 8.5, 58.0),
(2, '2025-10-02 08:00:00', 3.0, 62.0),
(2, '2025-10-02 12:00:00', 9.0, 65.0),
(3, '2025-10-03 07:00:00', -12.0, 50.0),
(3, '2025-10-04 11:00:00', -21.0, 48.0),
(4, '2025-10-04 09:00:00', -17.0, 49.0),
(4, '2025-10-05 13:00:00', -9.0, 43.0),
(5, '2025-10-05 12:00:00', 9.0, 71.0);

-- 7️⃣ Trigger: Auto-alert on temperature breach
DROP TRIGGER IF EXISTS trg_temperature_breach;
DELIMITER $$
CREATE TRIGGER trg_temperature_breach
AFTER INSERT ON SensorData
FOR EACH ROW
BEGIN
    INSERT INTO Alerts (sensor_id, alert_time, message)
    SELECT NEW.sensor_id, NOW(),
        CONCAT('⚠ Temperature breach detected in ', su.name,
               ' (Reading: ', NEW.temperature, '°C, Safe Range: ',
               p.min_temp, '°C–', p.max_temp, '°C) for product ', p.name)
    FROM Product p
    JOIN Shipment s ON p.product_id = s.product_id
    JOIN StorageUnit su ON s.storage_id = su.storage_id
    WHERE s.storage_id = NEW.storage_id
      AND s.status = 'In Transit'
      AND (NEW.temperature < p.min_temp OR NEW.temperature > p.max_temp);
END$$
DELIMITER ;

-- 8️⃣ Stored Procedures
DROP PROCEDURE IF EXISTS sp_expiry_alerts;
DROP PROCEDURE IF EXISTS sp_shipment_summary;

DELIMITER $$
CREATE PROCEDURE sp_expiry_alerts()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_id INT;
    DECLARE v_name VARCHAR(150);
    DECLARE v_expiry DATE;
    DECLARE cur CURSOR FOR
        SELECT product_id, name, expiry_date
        FROM Product
        WHERE expiry_date <= CURDATE() + INTERVAL 30 DAY;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_id, v_name, v_expiry;
        IF done THEN LEAVE read_loop; END IF;
        INSERT INTO Alerts (sensor_id, alert_time, message)
        VALUES (NULL, NOW(),
                CONCAT('🕒 Product "', v_name, '" nearing expiry on ', v_expiry));
    END LOOP;
    CLOSE cur;
END$$

CREATE PROCEDURE sp_shipment_summary()
BEGIN
    SELECT s.shipment_id, p.name AS product, su.name AS storage,
           s.status, TIMESTAMPDIFF(HOUR, s.departure_time, s.arrival_time) AS travel_hours
    FROM Shipment s
    JOIN Product p ON s.product_id = p.product_id
    JOIN StorageUnit su ON s.storage_id = su.storage_id
    ORDER BY s.departure_time DESC;
END$$
DELIMITER ;

-- 9️⃣ Indexes
CREATE INDEX idx_product_expiry ON Product(expiry_date);
CREATE INDEX idx_sensor_storage ON SensorData(storage_id);
CREATE INDEX idx_alert_time ON Alerts(alert_time);
CREATE INDEX idx_shipment_storage_status ON Shipment(storage_id, status);

-- 🔟 Run procedure to create expiry alerts
CALL sp_expiry_alerts();

-- 1️⃣1️⃣ Demo queries for testing
-- A. Show counts
SELECT 'Products' AS type, COUNT(*) FROM Product
UNION ALL
SELECT 'Storages', COUNT(*) FROM StorageUnit
UNION ALL
SELECT 'Shipments', COUNT(*) FROM Shipment
UNION ALL
SELECT 'SensorData', COUNT(*) FROM SensorData
UNION ALL
SELECT 'Alerts', COUNT(*) FROM Alerts;

-- B. List latest alerts
SELECT * FROM Alerts ORDER BY alert_time DESC LIMIT 10;

-- C. Shipment summary
CALL sp_shipment_summary();

-- D. Average temperature per storage per day
SELECT su.name AS storage_unit, DATE(sd.recorded_at) AS rdate,
       ROUND(AVG(sd.temperature),2) AS avg_temp
FROM SensorData sd
JOIN StorageUnit su ON sd.storage_id = su.storage_id
GROUP BY su.name, DATE(sd.recorded_at)
ORDER BY rdate DESC, su.name;

-- E. Most alert-prone storage unit
SELECT su.name AS storage, COUNT(a.alert_id) AS total_alerts
FROM Alerts a
JOIN SensorData sd ON a.sensor_id = sd.sensor_id
JOIN StorageUnit su ON sd.storage_id = su.storage_id
GROUP BY su.storage_id
ORDER BY total_alerts DESC
LIMIT 1;

-- ==========================================================
-- END OF SCRIPT
-- ==========================================================
