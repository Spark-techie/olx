const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/new', isAuthenticated, productController.getNewProduct);
router.post('/', isAuthenticated, upload.single('image'), productController.postProduct);
router.get('/favorites', isAuthenticated, productController.getFavorites);
router.get('/:id', productController.getProduct);
router.get('/:id/edit', isAuthenticated, productController.getEditProduct);
router.post('/:id/edit', isAuthenticated, upload.single('image'), productController.putProduct);
router.post('/:id/delete', isAuthenticated, productController.deleteProduct);
router.post('/:id/favorite', isAuthenticated, productController.toggleFavorite);
router.post('/:id/message', isAuthenticated, productController.sendMessage);
router.post('/:id/report', isAuthenticated, productController.reportProduct);

module.exports = router;
