import { Outlet, Link } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const avatarLetter = user?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white shadow-sm p-3 flex justify-between items-center sticky top-0 z-40">
        <Link to="/" className="text-xl font-bold text-blue-500">
          MemeUni
        </Link>
        <div className="flex items-center gap-4">
            <span className="w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
              {avatarLetter}
            </span>
            
          <span className="text-sm font-medium">{user?.username}</span>
          <button
            onClick={logout}
            className="text-red-500 border border-red-500 px-3 py-1 rounded text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Page content */}
      <div className="pb-16">
        <Outlet />
      </div>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;