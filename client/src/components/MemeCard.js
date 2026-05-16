import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { likeMeme, deleteMeme, getComments, addComment } from '../services/api';
import { FaHeart, FaRegHeart, FaRegComment } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MemeCard = ({ meme, onDelete, showDelete = false, compact = false }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(meme.likes || []);
  const [liked, setLiked] = useState(likes.includes(user?._id));
  const [deleting, setDeleting] = useState(false);

  // Comment states
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const data = await getComments(meme._id);
      setComments(data);
    } catch (error) {
      toast.error('Could not load comments');
    }
  }, [meme._id]);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, fetchComments]);

  const handleLike = async () => {
    try {
      const data = await likeMeme(meme._id);
      setLikes(data.likes);
      setLiked(data.likes.includes(user._id));
    } catch (error) {
      toast.error('Could not like the meme');
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
      toast.error('Could not delete the meme');
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

  const isOwner = user && meme.user && (meme.user._id === user._id || meme.user === user._id);

  // ------------------- COMPACT MODE (used in profile grid) -------------------
  if (compact) {
    return (
      showDelete && isOwner ? (
        <button
          onClick={handleDelete}
          className="bg-white text-red-500 px-3 py-1 rounded-full text-sm font-semibold"
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      ) : null
    );
  }

  // ------------------- FULL CARD MODE -------------------
  return (
    <div className="bg-white rounded-lg shadow mb-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center p-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-bold text-sm mr-2">
          {meme.user?.username?.[0]?.toUpperCase()}
        </div>
        <span className="font-semibold">{meme.user?.username}</span>
      </div>

      {/* Image */}
      <img
        src={meme.imageUrl}
        alt="meme"
        className="w-full object-cover"
        loading="lazy"
      />

      {/* Actions & caption */}
      <div className="p-3">
        <div className="flex items-center gap-4 mb-2">
          {/* Like button */}
          <button onClick={handleLike} className="flex items-center gap-1">
            {liked ? (
              <FaHeart className="text-xl text-red-500" />
            ) : (
              <FaRegHeart className="text-xl text-gray-700" />
            )}
            {likes.length > 0 && (
              <span className="text-sm font-semibold">{likes.length}</span>
            )}
          </button>

          {/* Comment button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 text-gray-700"
          >
            <FaRegComment className="text-xl" />
            {comments.length > 0 && (
              <span className="text-sm font-semibold">{comments.length}</span>
            )}
          </button>
        </div>

        <p className="mb-1">
          <span className="font-semibold mr-2">{meme.user?.username}</span>
          {meme.caption}
        </p>

        {/* Comment section */}
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

            {comments.length === 0 ? (
              <p className="text-gray-400 text-sm">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="mb-2 text-sm">
                  <span className="font-semibold mr-2">{comment.user?.username}</span>
                  {comment.text}
                </div>
              ))
            )}
          </div>
        )}

        {/* Delete button (only when showDelete is true and user is owner) */}
        {showDelete && isOwner && !compact && (
          <button
            onClick={handleDelete}
            className="text-red-500 text-sm mt-2"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
};

export default MemeCard;