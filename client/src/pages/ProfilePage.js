import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserMemes, updateProfile } from '../services/api';
import MemeCard from '../components/MemeCard';
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

  // Memoized fetch function – depends on user ID
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

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading profile...</div>;

  return (
    <div className="pb-16">
      {/* Profile header */}
      <div className="bg-white p-4 mb-4">
        <div className="flex items-center gap-6">
          {/* Profile picture */}
          <div className="relative">
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center font-bold text-2xl overflow-hidden">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.username?.[0]?.toUpperCase()
              )}
            </div>
            {editing && (
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center"
              >
                +
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
          <div className="flex gap-6">
            <div className="text-center">
              <p className="font-bold">{memes.length}</p>
              <p className="text-sm text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="font-bold">0</p>
              <p className="text-sm text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold">0</p>
              <p className="text-sm text-gray-500">Following</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4">
          <h2 className="font-semibold text-lg">{user?.username}</h2>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="border rounded p-2 w-full mt-1 text-sm"
              rows="2"
              placeholder="Write a bio..."
            />
          ) : (
            <p className="text-sm mt-1">{user?.bio || 'No bio yet.'}</p>
          )}
        </div>

        {/* Edit / Save buttons */}
        {editing ? (
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleProfileUpdate}
              disabled={uploading}
              className="bg-blue-500 text-white px-4 py-1 rounded text-sm font-semibold disabled:opacity-50"
            >
              {uploading ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleEditToggle} className="text-sm text-gray-500">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleEditToggle}
            className="mt-3 border border-gray-300 rounded px-4 py-1 text-sm font-semibold"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Memes grid */}
      <div className="px-2">
        {memes.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No memes yet. Upload your first meme!</p>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {memes.map((meme) => (
              <div key={meme._id} className="aspect-square relative group">
                <img
                  src={meme.imageUrl}
                  alt="Meme"
                  className="w-full h-full object-cover"
                />
                {/* Overlay with delete button (visible on hover) */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <MemeCard
                    meme={meme}
                    showDelete={true}
                    onDelete={handleDeleteMeme}
                    compact={true}
                  />
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