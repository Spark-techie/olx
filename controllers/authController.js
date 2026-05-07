const { User } = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const authController = {
  getSignup(req, res) {
    res.render('auth/signup', { title: 'Create Account' });
  },

  async postSignup(req, res) {
    try {
      const { full_name, email, password, confirm_password, phone } = req.body;
      if (!full_name || !email || !password || !confirm_password) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/auth/signup');
      }
      const isAdminEmail = email === 'jawaharm2007@gmail.com';
      if (!isAdminEmail && !User.isValidCollegeEmail(email)) {
        req.flash('error', 'Only verified college students can access KR Mart. Use your college email (@krct.ac.in, @krce.ac.in, @mkec.ac.in).');
        return res.redirect('/auth/signup');
      }
      if (password !== confirm_password) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect('/auth/signup');
      }
      if (password.length < 6) {
        req.flash('error', 'Password must be at least 6 characters.');
        return res.redirect('/auth/signup');
      }
      const existing = await User.findByEmail(email);
      if (existing) {
        req.flash('error', 'An account with this email already exists. Please login.');
        return res.redirect('/auth/login');
      }
      await User.create({ full_name, email, password, phone });
      req.flash('success', 'Account created successfully! Please login.');
      res.redirect('/auth/login');
    } catch (err) {
      console.error('Signup error:', err);
      req.flash('error', 'Something went wrong. Please try again.');
      res.redirect('/auth/signup');
    }
  },

  getLogin(req, res) {
    res.render('auth/login', { title: 'Login' });
  },

  async postLogin(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        req.flash('error', 'Email and password are required.');
        return res.redirect('/auth/login');
      }
      const isAdminEmail = email === 'jawaharm2007@gmail.com';
      if (!isAdminEmail && !User.isValidCollegeEmail(email)) {
        req.flash('error', 'Only verified college students can access KR Mart.');
        return res.redirect('/auth/login');
      }
      const user = await User.findByEmail(email);
      if (!user) {
        req.flash('error', 'No account found with this email. Please sign up first.');
        return res.redirect('/auth/login');
      }
      if (user.is_banned) {
        req.flash('error', `Your account has been suspended. Reason: ${user.ban_reason || 'Violation of rules'}`);
        return res.redirect('/auth/login');
      }
      const isMatch = await User.verifyPassword(password, user.password);
      if (!isMatch) {
        req.flash('error', 'Invalid password. Please try again.');
        return res.redirect('/auth/login');
      }
      req.session.userId = user.id;
      req.session.user = {
        id: user.id, full_name: user.full_name, email: user.email,
        college_name: user.college_name, profile_image: user.profile_image,
        is_admin: user.is_admin || 0
      };
      if (user.is_admin) {
        req.flash('success', `Welcome, Admin ${user.full_name}!`);
        return res.redirect('/admin/dashboard');
      }
      req.flash('success', `Welcome back, ${user.full_name}!`);
      res.redirect('/');
    } catch (err) {
      console.error('Login error:', err);
      req.flash('error', 'Something went wrong. Please try again.');
      res.redirect('/auth/login');
    }
  },

  logout(req, res) {
    req.session.destroy((err) => {
      if (err) console.error('Logout error:', err);
      res.redirect('/auth/login');
    });
  },

  getForgotPassword(req, res) {
    res.render('auth/forgot-password', { title: 'Forgot Password' });
  },

  async postForgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        req.flash('error', 'Please enter your email address.');
        return res.redirect('/auth/forgot-password');
      }
      const user = await User.findByEmail(email);
      if (!user) {
        req.flash('success', 'If that email exists, a reset link has been sent. (Demo: check server console)');
        return res.redirect('/auth/forgot-password');
      }
      const token = uuidv4();
      const expiry = new Date(Date.now() + 3600000);
      await User.setResetToken(email, token, expiry);
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      console.log(`\n📧 Password Reset Token for ${email}:`);
      console.log(`   ${appUrl}/auth/reset-password/${token}`);
      console.log(`   (Expires in 1 hour)\n`);
      req.flash('success', 'Reset link generated! Check the server console for the link (demo mode).');
      res.redirect('/auth/forgot-password');
    } catch (err) {
      console.error('Forgot password error:', err);
      req.flash('error', 'Something went wrong. Please try again.');
      res.redirect('/auth/forgot-password');
    }
  },

  async getResetPassword(req, res) {
    try {
      const user = await User.findByResetToken(req.params.token);
      if (!user) {
        req.flash('error', 'Invalid or expired reset token.');
        return res.redirect('/auth/forgot-password');
      }
      res.render('auth/reset-password', { title: 'Reset Password', token: req.params.token });
    } catch (err) {
      req.flash('error', 'Something went wrong.');
      res.redirect('/auth/forgot-password');
    }
  },

  async postResetPassword(req, res) {
    try {
      const { password, confirm_password } = req.body;
      const user = await User.findByResetToken(req.params.token);
      if (!user) {
        req.flash('error', 'Invalid or expired reset token.');
        return res.redirect('/auth/forgot-password');
      }
      if (password !== confirm_password) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect(`/auth/reset-password/${req.params.token}`);
      }
      if (password.length < 6) {
        req.flash('error', 'Password must be at least 6 characters.');
        return res.redirect(`/auth/reset-password/${req.params.token}`);
      }
      await User.updatePassword(user.id, password);
      await User.setResetToken(user.email, null, null);
      req.flash('success', 'Password reset successfully! Please login.');
      res.redirect('/auth/login');
    } catch (err) {
      console.error('Reset password error:', err);
      req.flash('error', 'Something went wrong.');
      res.redirect('/auth/forgot-password');
    }
  },

  async googleLogin(req, res) {
    try {
      const { email, full_name, profile_image } = req.body;
      if (!email) return res.status(400).json({ error: 'Email required' });

      const isAdminEmail = email === 'jawaharm2007@gmail.com';
      if (!isAdminEmail && !User.isValidCollegeEmail(email)) {
        return res.status(403).json({ error: 'Only verified college students can access KR Mart. Use your college email (@krct.ac.in, @krce.ac.in, @mkec.ac.in).' });
      }

      let user = await User.findByEmail(email);
      if (!user) {
        const college_name = User.getCollegeName(email);
        const ref = await db.collection('users').add({
          full_name, email, password: 'google-sso', college_name, phone: null, profile_image: profile_image || null, bio: null,
          is_admin: isAdminEmail ? 1 : 0, is_banned: 0, ban_reason: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        });
        user = { id: ref.id, full_name, email, college_name, profile_image, is_admin: isAdminEmail ? 1 : 0 };
      } else {
        if (user.is_banned) {
          return res.status(403).json({ error: `Your account has been suspended. Reason: ${user.ban_reason || 'Violation of rules'}` });
        }
      }

      req.session.userId = user.id;
      req.session.user = { id: user.id, full_name: user.full_name, email: user.email, college_name: user.college_name, profile_image: user.profile_image, is_admin: user.is_admin || 0 };
      res.json({ success: true, redirectUrl: user.is_admin ? '/admin/dashboard' : '/' });
    } catch (err) {
      console.error('Google login error:', err);
      res.status(500).json({ error: 'Something went wrong.' });
    }
  }
};

module.exports = authController;
