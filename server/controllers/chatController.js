const Message = require('../models/Message');
const Follow = require('../models/Follow');
const User = require('../models/User');

// Helper: check if currentUser and targetUser are mutual followers
const isMutualFollow = async (userId1, userId2) => {
  const follow1 = await Follow.findOne({ follower: userId1, following: userId2 });
  const follow2 = await Follow.findOne({ follower: userId2, following: userId1 });
  return !!(follow1 && follow2);
};

// @desc    Get list of mutual followers with last message preview + unread count
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const following = await Follow.find({ follower: req.user._id }).select('following');
    const followingIds = following.map((f) => f.following.toString());

    const mutuals = [];
    for (const id of followingIds) {
      const followsBack = await Follow.findOne({ follower: id, following: req.user._id });
      if (followsBack) mutuals.push(id);
    }

    const conversations = await Promise.all(
      mutuals.map(async (userId) => {
        const user = await User.findById(userId).select('username profilePic');

        const lastMessage = await Message.findOne({
          $or: [
            { sender: req.user._id, receiver: userId },
            { sender: userId, receiver: req.user._id },
          ],
        }).sort({ createdAt: -1 });

        // Count unread messages from this user to me
        const unreadCount = await Message.countDocuments({
          sender: userId,
          receiver: req.user._id,
          read: false,
        });

        return {
          user,
          unreadCount,
          lastMessage: lastMessage
            ? {
                text: lastMessage.text,
                createdAt: lastMessage.createdAt,
                isMine: lastMessage.sender.toString() === req.user._id.toString(),
              }
            : null,
        };
      })
    );

    // Sort: conversations with unread first, then by last message time
    conversations.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get messages between current user and another user
// @route   GET /api/chat/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const otherUser = req.params.userId;
    const mutual = await isMutualFollow(req.user._id, otherUser);
    if (!mutual) {
      return res.status(403).json({ message: 'You can only chat with mutual followers' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherUser },
        { sender: otherUser, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'username profilePic')
      .populate('receiver', 'username profilePic');

    // Mark messages from other user as read
    await Message.updateMany(
      { sender: otherUser, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send a message to another user (real-time via socket)
// @route   POST /api/chat/:userId
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const receiverId = req.params.userId;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const mutual = await isMutualFollow(req.user._id, receiverId);
    if (!mutual) {
      return res.status(403).json({ message: 'You can only chat with mutual followers' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text: text.trim(),
    });

    const populated = await message.populate('sender', 'username profilePic');

    // Emit real‑time events using Socket.IO
    const io = req.app.get('io');
    if (io) {
      // Send to receiver
      io.to(receiverId).emit('receive_message', populated);
      // Also emit to sender so their own UI updates
      req.user._id && io.to(req.user._id.toString()).emit('receive_message', populated);

      // Emit conversation update for both
      const lastMessage = {
        text: populated.text,
        createdAt: populated.createdAt,
      };
      io.to(receiverId).emit('conversation_update', { userId: req.user._id, lastMessage });
      req.user._id && io.to(req.user._id.toString()).emit('conversation_update', { userId: receiverId, lastMessage });
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  isMutualFollow,
};