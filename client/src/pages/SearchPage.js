import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, followUser, unfollowUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaSearch } from 'react-icons/fa';

const SearchPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user: currentUser, refreshCurrentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        // Exclude current user
        setUsers(data.filter((u) => u._id !== currentUser._id));
      } catch (error) {
        toast.error('Could not load users');
      }
    };
    fetchUsers();
  }, [currentUser]);

  const handleFollowToggle = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isFollowing: !isFollowing } : u
        )
      );

      await refreshCurrentUser();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  // Filter users based on search query (username or bio)
  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(q) ||
      user.bio?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="pb-16 px-2">
      {/* Search bar */}
      <div className="p-3 sticky top-0 bg-gray-50 z-10">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Results */}
      {filteredUsers.length === 0 && searchQuery.trim() !== '' ? (
        <p className="text-center text-gray-500 mt-10">No users found.</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No other users yet.</p>
      ) : (
        filteredUsers.map((user) => (
          <div key={user._id} className="flex items-center p-3 border-b">
            <Link to={`/profile/${user._id}`} className="flex items-center flex-1">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold mr-3">
                {user.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{user.username}</p>
                <p className="text-xs text-gray-500">
                  {user.bio?.substring(0, 30)}
                </p>
              </div>
            </Link>
            <button
              onClick={() => handleFollowToggle(user._id, user.isFollowing)}
              className={`px-4 py-1 rounded text-sm font-semibold ${
                user.isFollowing
                  ? 'border border-gray-300'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {user.isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default SearchPage;