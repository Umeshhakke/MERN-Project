import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';   // ✅ import
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
      <Navbar />   {/* ✅ Use the Navbar (it already includes upload & logout) */}

      <div className="pb-16">
        {renderTab()}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default HomePage;