const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);
router.post('/', authMiddleware, productController.createProduct); // Admin
router.put('/:id', authMiddleware, productController.updateProduct); // Admin
router.delete('/:id', authMiddleware, productController.deleteProduct); // Admin

module.exports = router;