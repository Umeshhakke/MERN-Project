const User = require('../models/User');
const Follow = require('../models/Follow');

// @desc    Get all users (for discover)
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('username profilePic bio followerCount');
    // Check following status for each user
    const follows = await Follow.find({ follower: req.user._id }).select('following');
    const followingSet = new Set(follows.map(f => f.following.toString()));
    const result = users.map(u => ({
      ...u.toObject(),
      isFollowing: followingSet.has(u._id.toString()),
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get public profile of any user
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Follow a user
// @route   PUT /api/users/:id/follow
// @access  Private
const followUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) return res.status(404).json({ message: 'User not found' });

    // Check if already followed
    const alreadyFollowing = await Follow.findOne({
      follower: req.user._id,
      following: req.params.id,
    });
    if (alreadyFollowing) return res.status(400).json({ message: 'Already following' });

    // Create follow document
    await Follow.create({ follower: req.user._id, following: req.params.id });

    // Increment counts
    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(req.params.id, { $inc: { followerCount: 1 } });

    res.json({ message: 'Followed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Unfollow a user
// @route   PUT /api/users/:id/unfollow
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) return res.status(404).json({ message: 'User not found' });

    const follow = await Follow.findOne({
      follower: req.user._id,
      following: req.params.id,
    });
    if (!follow) return res.status(400).json({ message: 'You are not following this user' });

    await follow.deleteOne();

    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(req.params.id, { $inc: { followerCount: -1 } });

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get followers of a user
// @route   GET /api/users/:id/followers
// @access  Public
const getFollowers = async (req, res) => {
  try {
    const follows = await Follow.find({ following: req.params.id })
      .populate('follower', 'username profilePic');
    const followers = follows.map(f => f.follower);
    res.json(followers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get following list of a user
// @route   GET /api/users/:id/following
// @access  Public
const getFollowing = async (req, res) => {
  try {
    const follows = await Follow.find({ follower: req.params.id })
      .populate('following', 'username profilePic');
    const following = follows.map(f => f.following);
    res.json(following);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// @desc    Check if current user is following a user
// @route   GET /api/users/:id/isfollowing
// @access  Private
const isFollowing = async (req, res) => {
  try {
    const follow = await Follow.findOne({
      follower: req.user._id,
      following: req.params.id,
    });
    res.json({ isFollowing: !!follow });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
};