import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FeedPage from './FeedPage';
import SearchPage from './SearchPage';
import ChatPage from './ChatPage';
import ProfilePage from './ProfilePage';
import BottomNav from '../components/BottomNav';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const { user } = useAuth();

  const renderTab = () => {
    switch (activeTab) {
      case 'feed': return <FeedPage />;
      case 'search': return <SearchPage />;
      case 'chat': return <ChatPage />;
      case 'profile': return <ProfilePage />;
      default: return <FeedPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal top bar – only branding, no upload button */}
      <header className="bg-white shadow-sm p-3 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-xl font-bold text-blue-500">MemeUni</h1>
        <span className="text-sm font-medium">{user?.username}</span>
      </header>

      <div className="pb-16">
        {renderTab()}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default HomePage;