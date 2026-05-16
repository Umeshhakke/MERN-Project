import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getUserProfile } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const register = async (username, email, password) => {
    const data = await registerUser(username, email, password);
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  // ✅ This is the function that keeps everything in sync
  const refreshCurrentUser = useCallback(async () => {
    if (!user?._id) return;
    try {
      const updated = await getUserProfile(user._id);
      const newUser = { ...user, ...updated, token: user.token };
      localStorage.setItem('userInfo', JSON.stringify(newUser));
      setUser(newUser);
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        refreshCurrentUser,        // ← must be here
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);