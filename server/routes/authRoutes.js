const express = require('express');
const router = express.Router();

const{
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// public routes

router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/profile',protect,getUserProfile);
router.put(
    '/profile',
    protect,
    upload.single('profilePic'),
    updateUserProfile
);

module.exports=router;