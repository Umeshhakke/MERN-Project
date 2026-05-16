const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUsers,
  getUserById,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
} = require('../controllers/userController');

// === Static routes (no parameters) ===
router.get('/', protect, getUsers);                     // GET /api/users

// === Parameterized routes ===
router.get('/:id', getUserById);                        // GET /api/users/:id
router.get('/:id/followers', getFollowers);             // GET /api/users/:id/followers
router.get('/:id/following', getFollowing);             // GET /api/users/:id/following
router.get('/:id/isfollowing', protect, isFollowing);   // GET /api/users/:id/isfollowing
router.put('/:id/follow', protect, followUser);         // PUT /api/users/:id/follow
router.put('/:id/unfollow', protect, unfollowUser);     // PUT /api/users/:id/unfollow

module.exports = router;