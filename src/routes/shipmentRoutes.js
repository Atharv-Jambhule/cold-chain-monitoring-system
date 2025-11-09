// src/routes/shipmentRoutes.js
const express = require('express');
const router = express.Router();

const shipmentController = require('../controllers/shipmentController');
const { validateShipment } = require('../middleware/validator');

// ──────────────────────────────────────────────────────────────
// GET: Shipments
// ──────────────────────────────────────────────────────────────
router.get('/', shipmentController.getAllShipments);                 // List all
router.get('/summary', shipmentController.getShipmentSummary);       // Stored-proc summary
router.get('/status/:status', shipmentController.getShipmentsByStatus); // Filter by status
router.get('/:id', shipmentController.getShipmentById);              // One by ID

// ──────────────────────────────────────────────────────────────
// POST: Create shipment
// NOTE: validateShipment expects product_id, storage_id, departure_time.
// If you're creating by product_name/shipment_code instead, temporarily
// remove `validateShipment` until you update the validator.
// ──────────────────────────────────────────────────────────────
router.post('/', validateShipment, shipmentController.createShipment);
// router.post('/', shipmentController.createShipment); // ← use this if validator blocks you

// ──────────────────────────────────────────────────────────────
// PUT/PATCH: Update shipment fields / status
// ──────────────────────────────────────────────────────────────
router.put('/:id', shipmentController.updateShipment);

// Update only the status (e.g., In Transit → Delivered)
router.put('/:id/status', shipmentController.updateShipmentStatus);
// If you prefer PATCH (partial), you can also expose this:
// router.patch('/:id/status', shipmentController.updateShipmentStatus);

// ──────────────────────────────────────────────────────────────
// DELETE: Remove a shipment
// ──────────────────────────────────────────────────────────────
router.delete('/:id', shipmentController.deleteShipment);

module.exports = router;
