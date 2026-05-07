const Admin = require('../models/Admin');
const { User } = require('../models/User');
const { Product, CATEGORIES } = require('../models/Product');
const db = require('../config/db');

// ── Dashboard ──────────────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const stats = await Admin.getStats();
    const signupTrend = await Admin.getSignupTrend();
    const productTrend = await Admin.getProductTrend();
    const catBreakdown = await Admin.getCategoryBreakdown();
    const collegeBreakdown = await Admin.getCollegeBreakdown();

    // Recent users
    const usersSnap = await db.collection('users').where('is_admin', '==', 0)
      .orderBy('created_at', 'desc').limit(5).get();
    const recentUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Recent products
    const prodSnap = await db.collection('products').orderBy('created_at', 'desc').limit(5).get();
    const recentProducts = [];
    for (const doc of prodSnap.docs) {
      const p = { id: doc.id, ...doc.data() };
      const seller = await db.collection('users').doc(p.seller_id).get();
      if (seller.exists) p.seller = seller.data().full_name;
      recentProducts.push(p);
    }

    res.render('admin/dashboard', {
      title: 'Admin Dashboard – KR Mart',
      stats, signupTrend, productTrend, catBreakdown, collegeBreakdown,
      recentUsers, recentProducts, page: 'dashboard'
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading dashboard');
    res.redirect('/');
  }
};

// ── Users ──────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const { search = '', page = 1 } = req.query;
    const limit = 20;
    const users = await Admin.getAllUsers({ search, page, limit });
    const total = await Admin.countUsers(search);
    res.render('admin/users', {
      title: 'Manage Users – Admin', users, search,
      currentPage: parseInt(page), totalPages: Math.ceil(total / limit), total,
      page: 'users'
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading users');
    res.redirect('/admin/dashboard');
  }
};

exports.banUser = async (req, res) => {
  try {
    const { reason } = req.body;
    await Admin.banUser(req.params.id, reason || 'Violation of campus marketplace rules');
    req.flash('success', 'User banned successfully.');
    res.redirect('/admin/users');
  } catch (err) {
    req.flash('error', 'Error banning user');
    res.redirect('/admin/users');
  }
};

exports.unbanUser = async (req, res) => {
  try {
    await Admin.unbanUser(req.params.id);
    req.flash('success', 'User unbanned successfully.');
    res.redirect('/admin/users');
  } catch (err) {
    req.flash('error', 'Error unbanning user');
    res.redirect('/admin/users');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await Admin.deleteUser(req.params.id);
    req.flash('success', 'User deleted.');
    res.redirect('/admin/users');
  } catch (err) {
    req.flash('error', 'Error deleting user');
    res.redirect('/admin/users');
  }
};

// ── Products ───────────────────────────────────────────────────────
exports.getProducts = async (req, res) => {
  try {
    const { search = '', status = '', category = '', page = 1 } = req.query;
    const limit = 20;
    const products = await Admin.getAllProducts({ search, status, category, page, limit });
    const total = await Admin.countProducts({ search, status, category });
    res.render('admin/products', {
      title: 'Manage Products – Admin', products, search, status, category,
      categories: CATEGORIES, currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit), total, page: 'products'
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading products');
    res.redirect('/admin/dashboard');
  }
};

exports.approveProduct = async (req, res) => {
  try {
    await Admin.approveProduct(req.params.id);
    req.flash('success', 'Product approved.');
    res.redirect('/admin/products');
  } catch (err) {
    req.flash('error', 'Error approving product');
    res.redirect('/admin/products');
  }
};

exports.rejectProduct = async (req, res) => {
  try {
    const { reason } = req.body;
    await Admin.rejectProduct(req.params.id, reason || 'Does not meet community guidelines');
    req.flash('success', 'Product rejected.');
    res.redirect('/admin/products');
  } catch (err) {
    req.flash('error', 'Error rejecting product');
    res.redirect('/admin/products');
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Admin.adminDeleteProduct(req.params.id);
    req.flash('success', 'Product deleted.');
    res.redirect('/admin/products');
  } catch (err) {
    req.flash('error', 'Error deleting product');
    res.redirect('/admin/products');
  }
};

exports.markProductSold = async (req, res) => {
  try {
    await Admin.markProductSold(req.params.id);
    req.flash('success', 'Product marked as sold.');
    res.redirect('/admin/products');
  } catch (err) {
    req.flash('error', 'Error updating product');
    res.redirect('/admin/products');
  }
};

// ── Reports ────────────────────────────────────────────────────────
exports.getReports = async (req, res) => {
  try {
    const { status = '', page = 1 } = req.query;
    const limit = 20;
    const reports = await Admin.getAllReports({ status, page, limit });
    res.render('admin/reports', {
      title: 'Reports – Admin', reports, status,
      currentPage: parseInt(page), totalPages: 1, page: 'reports'
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading reports');
    res.redirect('/admin/dashboard');
  }
};

exports.resolveReport = async (req, res) => {
  try {
    await Admin.resolveReport(req.params.id);
    req.flash('success', 'Report resolved.');
    res.redirect('/admin/reports');
  } catch (err) {
    req.flash('error', 'Error resolving report');
    res.redirect('/admin/reports');
  }
};

exports.dismissReport = async (req, res) => {
  try {
    await Admin.dismissReport(req.params.id);
    req.flash('success', 'Report dismissed.');
    res.redirect('/admin/reports');
  } catch (err) {
    req.flash('error', 'Error dismissing report');
    res.redirect('/admin/reports');
  }
};

// ── Categories ─────────────────────────────────────────────────────
exports.getCategories = async (req, res) => {
  try {
    const categories = await Admin.getAllCategories();
    res.render('admin/categories', { title: 'Manage Categories – Admin', categories, page: 'categories' });
  } catch (err) {
    req.flash('error', 'Error loading categories');
    res.redirect('/admin/dashboard');
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    await Admin.createCategory(name, icon);
    req.flash('success', 'Category created.');
    res.redirect('/admin/categories');
  } catch (err) {
    req.flash('error', 'Error creating category');
    res.redirect('/admin/categories');
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, icon, is_active, sort_order } = req.body;
    await Admin.updateCategory(req.params.id, { name, icon, is_active: is_active === '1', sort_order: parseInt(sort_order) });
    req.flash('success', 'Category updated.');
    res.redirect('/admin/categories');
  } catch (err) {
    req.flash('error', 'Error updating category');
    res.redirect('/admin/categories');
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Admin.deleteCategory(req.params.id);
    req.flash('success', 'Category deleted.');
    res.redirect('/admin/categories');
  } catch (err) {
    req.flash('error', 'Error deleting category');
    res.redirect('/admin/categories');
  }
};
