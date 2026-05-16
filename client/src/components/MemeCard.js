import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { likeMeme, deleteMeme, getComments, addComment } from '../services/api';
import { FaHeart, FaRegHeart, FaRegComment, FaRegShareSquare, FaRegBookmark, FaBookmark } from 'react-icons/fa';
import toast from 'react-hot-toast';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const MemeCard = ({ meme, onDelete, showDelete = false, compact = false, deleteButtonPosition = 'bottom' }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(meme.likes || []);
  const [liked, setLiked] = useState(likes.includes(user?._id));
  const [deleting, setDeleting] = useState(false);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const imageRef = useRef(null);

  const fetchComments = useCallback(async () => {
    try {
      const data = await getComments(meme._id);
      setComments(data);
    } catch (error) {
      toast.error('Could not load comments');
    }
  }, [meme._id]);

  useEffect(() => {
    if (showComments) fetchComments();
  }, [showComments, fetchComments]);

  const handleLike = async () => {
    try {
      const data = await likeMeme(meme._id);
      setLikes(data.likes);
      setLiked(data.likes.includes(user._id));
    } catch (error) {
      toast.error('Could not like');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this meme?')) return;
    try {
      setDeleting(true);
      await deleteMeme(meme._id);
      onDelete && onDelete(meme._id);
      toast.success('Meme deleted');
    } catch (error) {
      toast.error('Could not delete');
      setDeleting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      setSubmittingComment(true);
      const newComment = await addComment(meme._id, commentText.trim());
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Could not add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDoubleTap = () => {
    if (!liked) {
      handleLike();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
  };

  let lastTap = 0;
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      handleDoubleTap();
      lastTap = 0;
    } else {
      lastTap = now;
    }
  };

  const isOwner = user && meme.user && (meme.user._id === user._id || meme.user === user._id);

  // Compact mode (used in grid overlay)
  if (compact) {
    return showDelete && isOwner ? (
      <button
        onClick={handleDelete}
        className="bg-white text-red-500 px-3 py-1 rounded-full text-sm font-semibold"
        disabled={deleting}
      >
        {deleting ? 'Deleting...' : 'Delete'}
      </button>
    ) : null;
  }

  return (
    <div className="bg-white rounded-lg shadow mb-6 max-w-xl mx-auto relative">
      {/* Header */}
      <div className="flex items-center p-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-bold text-sm mr-2">
          {meme.user?.username?.[0]?.toUpperCase()}
        </div>
        <span className="font-semibold flex-1">{meme.user?.username}</span>
        <span className="text-gray-400 text-xs">{timeAgo(meme.createdAt)}</span>
      </div>

      {/* Image with double-tap */}
      <div
        ref={imageRef}
        onClick={handleTap}
        className="relative overflow-hidden cursor-pointer"
      >
        <img
          src={meme.imageUrl}
          alt="meme"
          className="w-full object-cover"
          loading="lazy"
        />
        {showHeart && (
          <FaHeart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-7xl animate-ping" />
        )}

        {/* Delete button at top-right if requested */}
        {showDelete && isOwner && deleteButtonPosition === 'top-right' && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 bg-white/80 text-red-500 px-3 py-1 rounded-full text-sm font-semibold shadow"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="focus:outline-none">
              {liked ? <FaHeart className="text-xl text-red-500" /> : <FaRegHeart className="text-xl" />}
            </button>
            <button onClick={() => setShowComments(!showComments)} className="focus:outline-none">
              <FaRegComment className="text-xl" />
            </button>
            <button className="focus:outline-none">
              <FaRegShareSquare className="text-xl" />
            </button>
          </div>
          <button onClick={() => setSaved(!saved)} className="focus:outline-none">
            {saved ? <FaBookmark className="text-xl text-black" /> : <FaRegBookmark className="text-xl" />}
          </button>
        </div>

        <div className="font-semibold text-sm mb-1">
          {likes.length > 0 ? `${likes.length} likes` : 'No likes yet'}
        </div>

        <p className="mb-1">
          <span className="font-semibold mr-2">{meme.user?.username}</span>
          {meme.caption}
        </p>

        {showComments && (
          <div className="mt-3 border-t pt-3">
            <form onSubmit={handleAddComment} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 border rounded px-2 py-1 text-sm"
                maxLength={300}
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="text-blue-500 text-sm font-semibold disabled:opacity-50"
              >
                Post
              </button>
            </form>
            {comments.map((comment) => (
              <div key={comment._id} className="mb-2 text-sm">
                <span className="font-semibold mr-2">{comment.user?.username}</span>
                {comment.text}
              </div>
            ))}
          </div>
        )}

        {/* Delete button at bottom (default) */}
        {showDelete && isOwner && deleteButtonPosition !== 'top-right' && (
          <button onClick={handleDelete} className="text-red-500 text-sm mt-2" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
};

export default MemeCard;