const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/adminAuth');

// All admin routes require admin session
router.use(requireAdmin);

router.get('/dashboard', adminCtrl.getDashboard);

// Users
router.get('/users', adminCtrl.getUsers);
router.post('/users/:id/ban', adminCtrl.banUser);
router.post('/users/:id/unban', adminCtrl.unbanUser);
router.post('/users/:id/delete', adminCtrl.deleteUser);

// Products
router.get('/products', adminCtrl.getProducts);
router.post('/products/:id/approve', adminCtrl.approveProduct);
router.post('/products/:id/reject', adminCtrl.rejectProduct);
router.post('/products/:id/delete', adminCtrl.adminDeleteProduct);

// Reports
router.get('/reports', adminCtrl.getReports);
router.post('/reports/:id/resolve', adminCtrl.resolveReport);
router.post('/reports/:id/dismiss', adminCtrl.dismissReport);

// Categories
router.get('/categories', adminCtrl.getCategories);
router.post('/categories/create', adminCtrl.createCategory);
router.post('/categories/:id/update', adminCtrl.updateCategory);
router.post('/categories/:id/delete', adminCtrl.deleteCategory);

module.exports = router;
