const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, productController.getMessages);

module.exports = router;
