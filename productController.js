const { User } = require('../models/User');
const { Product } = require('../models/Product');

const profileController = {
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.session.userId);
      const products = await Product.getBySeller(req.session.userId);
      res.render('profile/index', { title: 'My Profile', profileUser: user, products });
    } catch (err) {
      req.flash('error', 'Something went wrong.');
      res.redirect('/');
    }
  },

  async getEditProfile(req, res) {
    try {
      const user = await User.findById(req.session.userId);
      res.render('profile/edit', { title: 'Edit Profile', profileUser: user });
    } catch (err) {
      req.flash('error', 'Something went wrong.');
      res.redirect('/profile');
    }
  },

  async postEditProfile(req, res) {
    try {
      const { full_name, phone, bio } = req.body;
      const profile_image = req.file ? req.file.filename : null;
      await User.updateProfile(req.session.userId, { full_name, phone, bio, profile_image });
      req.flash('success', 'Profile updated successfully!');
      res.redirect('/profile');
    } catch (err) {
      console.error('Edit profile error:', err);
      req.flash('error', 'Something went wrong.');
      res.redirect('/profile/edit');
    }
  },

  async getMyAds(req, res) {
    try {
      const products = await Product.getBySeller(req.session.userId);
      res.render('profile/my-ads', { title: 'My Ads', products });
    } catch (err) {
      req.flash('error', 'Something went wrong.');
      res.redirect('/profile');
    }
  },

  getChangePassword(req, res) {
    res.render('profile/change-password', { title: 'Change Password' });
  },

  async postChangePassword(req, res) {
    try {
      const { current_password, new_password, confirm_password } = req.body;
      const user = await User.findByEmail(req.session.user.email);
      const isMatch = await User.verifyPassword(current_password, user.password);
      if (!isMatch) { req.flash('error', 'Current password is incorrect.'); return res.redirect('/profile/change-password'); }
      if (new_password !== confirm_password) { req.flash('error', 'Passwords do not match.'); return res.redirect('/profile/change-password'); }
      if (new_password.length < 6) { req.flash('error', 'Min 6 characters.'); return res.redirect('/profile/change-password'); }
      await User.updatePassword(req.session.userId, new_password);
      req.flash('success', 'Password changed!');
      res.redirect('/profile');
    } catch (err) {
      req.flash('error', 'Something went wrong.');
      res.redirect('/profile/change-password');
    }
  }
};

module.exports = profileController;
