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
