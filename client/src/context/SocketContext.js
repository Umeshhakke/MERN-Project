import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.emit('join', user._id);

    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);