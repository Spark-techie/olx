const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', isAuthenticated, profileController.getProfile);
router.get('/edit', isAuthenticated, profileController.getEditProfile);
router.post('/edit', isAuthenticated, upload.single('avatar'), profileController.postEditProfile);
router.get('/my-ads', isAuthenticated, profileController.getMyAds);
router.get('/change-password', isAuthenticated, profileController.getChangePassword);
router.post('/change-password', isAuthenticated, profileController.postChangePassword);

module.exports = router;
