const express = require('express');
const router = express.Router();
const {
    createMeme,
    getMemes,
    getMemeById,
    deleteMeme,
    toggleLike,
    getUserMemes,
} = require('../controllers/memeController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');   // changed import
const commentRoutes = require('./commentRoutes');

// Public routes
router.get('/', getMemes);
router.get('/user/:userId', getUserMemes);
router.get('/:id', getMemeById);

// Protected routes
router.post('/', protect, uploadSingle('image'), createMeme);          // changed usage
router.delete('/:id', protect, deleteMeme);
router.put('/:id/like', protect, toggleLike);

// Nested comment routes
router.use('/:id/comments', commentRoutes);

module.exports = router;