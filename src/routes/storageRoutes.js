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
