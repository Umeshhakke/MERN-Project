import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserMemes, updateProfile } from '../services/api';
import MemeCard from '../components/MemeCard';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePic, setProfilePic] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // New: view mode and selected meme index
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'feed'
  // const [selectedMemeIndex, setSelectedMemeIndex] = useState(0);

  const fetchUserMemes = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUserMemes(user._id);
      setMemes(data);
    } catch (error) {
      toast.error('Failed to load your memes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserMemes();
  }, [fetchUserMemes]);

  const handleDeleteMeme = (id) => {
    setMemes((prev) => prev.filter((m) => m._id !== id));
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    setBio(user?.bio || '');
    setProfilePic(null);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('bio', bio);
    if (profilePic) {
      formData.append('profilePic', profilePic);
    }
    try {
      setUploading(true);
      const updatedUser = await updateProfile(formData);
      const newUser = { ...user, ...updatedUser, token: user.token };
      localStorage.setItem('userInfo', JSON.stringify(newUser));
      setUser(newUser);
      toast.success('Profile updated');
      setEditing(false);
      setProfilePic(null);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  // Handle grid item click → switch to feed view, set index
  const handleGridItemClick = () => {
    // setSelectedMemeIndex(index);
    setViewMode('feed');
  };

  // Back to grid
  const handleBackToGrid = () => {
    setViewMode('grid');
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading profile...</div>;

  // Profile header (reused in both views)
  const ProfileHeader = () => (
    <div className="bg-white rounded-2xl shadow-lg mx-4 mt-4 mb-4 overflow-hidden">
      {/* Gradient banner */}
      <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      <div className="px-5 pb-5 -mt-10">
        <div className="flex items-end gap-4">
          {/* Avatar */}
          <div className="relative w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden shadow">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-gray-500">
                {user?.username?.[0]?.toUpperCase()}
              </span>
            )}
            {editing && (
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow"
              >
                <FaPlus />
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={(e) => setProfilePic(e.target.files[0])}
            />
          </div>

          {/* Stats */}
          <div className="flex gap-6 ml-4 mb-2">
            <div className="text-center">
              <p className="font-bold text-lg">{memes.length}</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{user?.followerCount || 0}</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{user?.followingCount || 0}</p>
              <p className="text-xs text-gray-500">Following</p>
            </div>
          </div>
        </div>

        {/* Bio & actions */}
        <div className="mt-3">
          <h2 className="font-bold text-xl">{user?.username}</h2>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="border rounded p-2 w-full mt-1 text-sm resize-none"
              rows="2"
              placeholder="Write a bio..."
            />
          ) : (
            <p className="text-sm text-gray-700 mt-1">{user?.bio || 'No bio yet.'}</p>
          )}
        </div>

        <div className="mt-3">
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={handleProfileUpdate}
                disabled={uploading}
                className="bg-blue-500 text-white px-6 py-1.5 rounded-full text-sm font-semibold disabled:opacity-50"
              >
                {uploading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleEditToggle}
                className="border border-gray-300 px-6 py-1.5 rounded-full text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleEditToggle}
              className="border border-gray-300 px-6 py-1.5 rounded-full text-sm font-semibold"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Feed view (when a grid item is clicked)
  if (viewMode === 'feed') {
    return (
      <div className="pb-16">
        {/* Top bar with back button */}
        <div className="flex items-center p-3 bg-white shadow sticky top-0 z-40">
          <button onClick={handleBackToGrid} className="text-xl mr-4">
            <FaArrowLeft />
          </button>
          <h2 className="font-bold text-lg">Posts</h2>
        </div>

        {/* Meme cards list */}
        <div className="max-w-xl mx-auto">
          {memes.map((meme, index) => (
            <MemeCard
              key={meme._id}
              meme={meme}
              showDelete={true}
              onDelete={handleDeleteMeme}
              deleteButtonPosition="top-right"
            />
          ))}
        </div>
      </div>
    );
  }

  // Default grid view
  return (
    <div className="pb-16">
      <ProfileHeader />

      {/* Grid */}
      <div className="px-4">
        {memes.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No memes yet. Upload your first meme!</p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {memes.map((meme, index) => (
              <div
                key={meme._id}
                className="aspect-square relative group cursor-pointer"
                onClick={() => handleGridItemClick(index)}
              >
                <img
                  src={meme.imageUrl}
                  alt="Meme"
                  className="w-full h-full object-cover rounded"
                />
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                  <span className="text-white font-semibold">
                    View
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;