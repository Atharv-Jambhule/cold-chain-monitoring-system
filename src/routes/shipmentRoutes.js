const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');

// ✅ GET All shipments
router.get('/', shipmentController.getAllShipments);

// ❌ REMOVE THIS LINE
// router.get('/summary', shipmentController.getShipmentSummary);

// ✅ Get shipments by status
router.get('/status/:status', shipmentController.getShipmentsByStatus);

// ✅ Get one shipment by ID
router.get('/:id', shipmentController.getShipmentById);

// ✅ Create new shipment
router.post('/', shipmentController.createShipment);

// ✅ Update shipment details
router.put('/:id', shipmentController.updateShipment);

// ✅ Delete shipment
router.delete('/:id', shipmentController.deleteShipment);

// ✅ Update STATUS only
router.put('/:id/status', shipmentController.updateShipmentStatus);

module.exports = router;
