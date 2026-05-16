const express = require('express');
const router = express.Router();
const {
    createMeme,
    getMemes,
    getMemeById,
    deleteMeme,
    toggleLike,
    getUserMemes,
}= require('../controllers/memeController');
const {protect} = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const commentRoutes = require('./commentRoutes');

router.get('/',getMemes);
router.get('/:id',getMemeById);

router.post('/',protect, upload.single('image'), createMeme);
router.delete('/:id', protect, deleteMeme);
router.put('/:id/like',protect , toggleLike);

router.use('/:id/comments', commentRoutes);
// Public route to get memes by user ID
router.get('/user/:userId', getUserMemes);

module.exports=router;