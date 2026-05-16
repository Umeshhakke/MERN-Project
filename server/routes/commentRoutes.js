const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :id from meme routes
const { protect } = require('../middleware/authMiddleware');
const { addComment, deleteComment, getComments } = require('../controllers/commentController');

// Public
router.get('/', getComments);

// Private
router.post('/', protect, addComment);
router.delete('/:commentId', protect, deleteComment);

module.exports = router;