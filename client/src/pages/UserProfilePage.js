import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getUserProfile,
  followUser,
  unfollowUser,
  getUserMemes,
  isFollowingUser,
} from '../services/api';
import toast from 'react-hot-toast';

const UserProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, refreshCurrentUser } = useAuth();
  const [user, setUserProfile] = useState(null);
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBtnLoading, setFollowBtnLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, memesData] = await Promise.all([
          getUserProfile(id),
          getUserMemes(id),
        ]);
        setUserProfile(userData);
        setMemes(memesData);

        if (currentUser) {
          const { isFollowing } = await isFollowingUser(id);
          setIsFollowing(isFollowing);
        }
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    setFollowBtnLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(id);
        setIsFollowing(false);
        setUserProfile((prev) => ({
          ...prev,
          followerCount: prev.followerCount - 1,
        }));
      } else {
        await followUser(id);
        setIsFollowing(true);
        setUserProfile((prev) => ({
          ...prev,
          followerCount: prev.followerCount + 1,
        }));
      }

      // 🔁 Update the logged‑in user’s counts (following count)
      await refreshCurrentUser();

      toast.success(isFollowing ? 'Unfollowed' : 'Followed');
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setFollowBtnLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!user) return <div className="text-center mt-20">User not found</div>;

  const isOwnProfile = currentUser && currentUser._id === id;

  return (
    <div className="pb-16">
      <div className="bg-white p-4 mb-4">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold overflow-hidden">
            {user.profilePic ? (
              <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user.username?.[0]?.toUpperCase()
            )}
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="font-bold">{memes.length}</p>
              <p className="text-sm text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{user.followerCount || 0}</p>
              <p className="text-sm text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{user.followingCount || 0}</p>
              <p className="text-sm text-gray-500">Following</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="font-semibold text-lg">{user.username}</h2>
          <p className="text-sm">{user.bio || 'No bio yet.'}</p>
        </div>

        {!isOwnProfile && (
          <button
            onClick={handleFollowToggle}
            disabled={followBtnLoading}
            className={`mt-3 px-6 py-1 rounded font-semibold text-sm ${
              isFollowing
                ? 'border border-gray-300 bg-white text-black'
                : 'bg-blue-500 text-white'
            }`}
          >
            {followBtnLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      <div className="px-2">
        {memes.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No memes yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {memes.map((meme) => (
              <div key={meme._id} className="aspect-square">
                <img src={meme.imageUrl} alt="Meme" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;