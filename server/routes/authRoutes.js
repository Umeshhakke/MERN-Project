const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');   // destructure

// public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// protected routes
router.get('/profile', protect, getUserProfile);

router.put(
    '/profile',
    protect,
    uploadSingle('profilePic'),    // pass the field name
    updateUserProfile
);

module.exports = router;