const requireAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.user && req.session.user.is_admin) {
    return next();
  }
  req.flash('error', 'Access denied. Admins only.');
  res.redirect('/auth/login');
};

module.exports = { requireAdmin };
