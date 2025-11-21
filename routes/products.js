const express = require('express');
const { getProducts, createProduct, getMyProducts } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProducts);

router.use(protect);

router.post('/', authorize('manufacturer'), createProduct);
router.get('/my-products', authorize('manufacturer'), getMyProducts);

module.exports = router;