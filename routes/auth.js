const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfLoggedIn } = require('../middleware/auth');

router.get('/signup', redirectIfLoggedIn, authController.getSignup);
router.post('/signup', authController.postSignup);

router.get('/login', redirectIfLoggedIn, authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/google-login', authController.googleLogin);

router.get('/logout', authController.logout);

router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);

router.get('/reset-password/:token', authController.getResetPassword);
router.post('/reset-password/:token', authController.postResetPassword);

module.exports = router;
