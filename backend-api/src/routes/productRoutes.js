const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const {
  validateProduct,
  validateProductUpdate,
  validateId
} = require('../middleware/validation');

// Product routes with validation
router.get('/', getAllProducts);
router.get('/:id', validateId, getProductById);
router.post('/', validateProduct, createProduct);
router.put('/:id', validateId, validateProductUpdate, updateProduct);
router.delete('/:id', validateId, deleteProduct);

module.exports = router;
