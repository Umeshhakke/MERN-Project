import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import SearchPage from './pages/SearchPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import UploadPage from './pages/UploadPage';
import MainLayout from './components/MainLayout';
import UserProfilePage from './pages/UserProfilePage';

import { SocketProvider } from './context/SocketContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster position="top-center" />
        <AppRoutes />
      </SocketProvider>
    </AuthProvider>
  );
}

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <LoginPage />}
      />

      <Route
        path="/register"
        element={user ? <Navigate to="/" /> : <RegisterPage />}
      />

      <Route
        element={user ? <MainLayout /> : <Navigate to="/login" />}
      >
        <Route path="/" element={<FeedPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Route>

      <Route path="/profile/:id" element={<UserProfilePage />} />
    </Routes>
  );
};

export default App;