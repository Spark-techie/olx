const { User } = require('../models/User');

const setCurrentUser = async (req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');

  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.session.user = user;
        res.locals.user = user;
        res.locals.isLoggedIn = true;
      } else {
        req.session.destroy(() => {});
        res.locals.user = null;
        res.locals.isLoggedIn = false;
      }
    } catch (e) {
      res.locals.user = req.session.user || null;
      res.locals.isLoggedIn = !!(req.session.user);
    }
  } else {
    res.locals.user = null;
    res.locals.isLoggedIn = false;
  }
  next();
};

const requireLogin = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  req.flash('error', 'Please login to continue.');
  res.redirect('/auth/login');
};

const redirectIfLoggedIn = (req, res, next) => {
  if (req.session && req.session.userId) return res.redirect('/');
  next();
};

const isAuthenticated = requireLogin;
const isGuest = redirectIfLoggedIn;
const setUserLocals = setCurrentUser;

module.exports = { requireLogin, redirectIfLoggedIn, setUserLocals, setCurrentUser, isAuthenticated, isGuest };
