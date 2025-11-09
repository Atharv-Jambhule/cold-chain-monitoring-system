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
