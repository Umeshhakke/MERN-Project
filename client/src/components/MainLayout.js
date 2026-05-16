import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white shadow-sm p-3 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-xl font-bold text-blue-500">MemeUni</h1>
        <span className="text-sm font-medium">{user?.username}</span>
      </header>

      {/* Content */}
      <div className="pb-16">
        <Outlet />
      </div>

      {/* Bottom nav */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;