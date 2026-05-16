const Comment = require('../models/Comment');
const Meme = require('../models/Meme');

// @desc    Add a comment to a meme
// @route   POST /api/memes/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }

    const comment = await Comment.create({
      user: req.user._id,
      meme: req.params.id,
      text: req.body.text,
    });

    // Populate user info before returning
    const populatedComment = await comment.populate('user', 'username profilePic');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (owner of comment or owner of the meme)
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is comment author or meme owner
    const meme = await Meme.findById(comment.meme);
    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isMemeOwner = meme.user.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isMemeOwner) {
      return res.status(401).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get comments for a meme
// @route   GET /api/memes/:id/comments
// @access  Public
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ meme: req.params.id })
      .populate('user', 'username profilePic')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addComment, deleteComment, getComments };