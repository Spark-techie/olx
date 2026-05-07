const { Product, CATEGORIES } = require('../models/Product');
const Message = require('../models/Message');
const db = require('../config/db');

const productController = {
  async getHome(req, res) {
    try {
      const { search, category, minPrice, maxPrice, sort } = req.query;
      const products = await Product.findAll({ search, category, minPrice, maxPrice, sort });
      res.render('home', {
        title: 'KR Mart - Buy & Sell in Your College',
        products, categories: CATEGORIES,
        filters: { search, category, minPrice, maxPrice, sort }
      });
    } catch (err) {
      console.error('Home error:', err);
      res.render('home', { title: 'KR Mart', products: [], categories: CATEGORIES, filters: {} });
    }
  },

  async getProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) { req.flash('error', 'Product not found.'); return res.redirect('/'); }
      await Product.incrementViews(product.id);
      let isFavorited = false;
      if (req.session.userId) isFavorited = await Product.isFavorited(req.session.userId, product.id);
      const related = await Product.getRelated(product.category, product.id);
      res.render('products/show', { title: product.title, product, related, isFavorited, categories: CATEGORIES });
    } catch (err) {
      console.error('Product show error:', err);
      req.flash('error', 'Something went wrong.');
      res.redirect('/');
    }
  },

  getNewProduct(req, res) {
    res.render('products/new', { title: 'Post an Ad', categories: CATEGORIES });
  },

  async postProduct(req, res) {
    try {
      const { title, price, category, description, contact_number, location, condition_type, image_url } = req.body;
      if (!title || !price || !category || !description || !contact_number || !location) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/products/new');
      }
      const id = await Product.create({
        seller_id: req.session.userId,
        title, price: parseFloat(price), category, description,
        image_url: image_url || null, contact_number, location, condition_type: condition_type || 'Good'
      });
      req.flash('success', 'Ad posted successfully!');
      res.redirect(`/products/${id}`);
    } catch (err) {
      console.error('Post product error:', err);
      req.flash('error', 'Something went wrong. Please try again.');
      res.redirect('/products/new');
    }
  },

  async getEditProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product || product.seller_id !== req.session.userId) {
        req.flash('error', 'Unauthorized.');
        return res.redirect('/');
      }
      res.render('products/edit', { title: 'Edit Ad', product, categories: CATEGORIES });
    } catch (err) {
      req.flash('error', 'Something went wrong.');
      res.redirect('/');
    }
  },

  async putProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product || product.seller_id !== req.session.userId) {
        req.flash('error', 'Unauthorized.');
        return res.redirect('/');
      }
      const { title, price, category, description, contact_number, location, condition_type } = req.body;
      const image_url = req.file ? req.file.filename : null;
      await Product.update(req.params.id, req.session.userId, {
        title, price: parseFloat(price), category, description,
        image_url, contact_number, location, condition_type
      });
      req.flash('success', 'Ad updated successfully!');
      res.redirect(`/products/${req.params.id}`);
    } catch (err) {
      console.error('Edit product error:', err);
      req.flash('error', 'Something went wrong.');
      res.redirect('/');
    }
  },

  async deleteProduct(req, res) {
    try {
      await Product.delete(req.params.id, req.session.userId);
      req.flash('success', 'Ad deleted successfully.');
      res.redirect('/profile/my-ads');
    } catch (err) {
      console.error('Delete product error:', err);
      req.flash('error', 'Something went wrong.');
      res.redirect('/');
    }
  },

  async toggleFavorite(req, res) {
    try {
      const isFav = await Product.isFavorited(req.session.userId, req.params.id);
      if (isFav) {
        await Product.removeFavorite(req.session.userId, req.params.id);
        res.json({ success: true, favorited: false });
      } else {
        await Product.addFavorite(req.session.userId, req.params.id);
        res.json({ success: true, favorited: true });
      }
    } catch (err) {
      console.error('Favorite error:', err);
      res.json({ success: false });
    }
  },

  async getFavorites(req, res) {
    try {
      const products = await Product.getFavoriteProducts(req.session.userId);
      res.render('products/favorites', { title: 'My Favorites', products, categories: CATEGORIES });
    } catch (err) {
      req.flash('error', 'Something went wrong.');
      res.redirect('/');
    }
  },

  async sendMessage(req, res) {
    try {
      const { message } = req.body;
      const product = await Product.findById(req.params.id);
      if (!product || !message || !message.trim()) {
        req.flash('error', 'Invalid request.');
        return res.redirect(`/products/${req.params.id}`);
      }
      if (product.seller_id === req.session.userId) {
        req.flash('error', "You can't message yourself.");
        return res.redirect(`/products/${req.params.id}`);
      }
      await Message.create({
        sender_id: req.session.userId,
        receiver_id: product.seller_id,
        product_id: product.id,
        message: message.trim()
      });
      req.flash('success', 'Message sent to the seller!');
      res.redirect(`/products/${req.params.id}`);
    } catch (err) {
      console.error('Message error:', err);
      req.flash('error', 'Failed to send message.');
      res.redirect(`/products/${req.params.id}`);
    }
  },

  async getMessages(req, res) {
    try {
      const inbox = await Message.getInbox(req.session.userId);
      res.render('messages/inbox', { title: 'Messages', inbox });
    } catch (err) {
      req.flash('error', 'Something went wrong.');
      res.redirect('/');
    }
  },

  async reportProduct(req, res) {
    try {
      const { reason, details } = req.body;
      const product = await Product.findById(req.params.id);
      if (!product || !reason) {
        req.flash('error', 'Invalid report.');
        return res.redirect(`/products/${req.params.id}`);
      }
      await db.collection('reports').add({
        reporter_id: req.session.userId,
        product_id: product.id,
        reason, details: details || null,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      req.flash('success', 'Report submitted. Our team will review it.');
      res.redirect(`/products/${req.params.id}`);
    } catch (err) {
      console.error('Report error:', err);
      req.flash('error', 'Failed to submit report.');
      res.redirect(`/products/${req.params.id}`);
    }
  }
};

module.exports = productController;
