// frontend/src/context/SocketContext.jsx

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (token && user.id) {
      
      const newSocket = io(
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  { transports: ['websocket'] }
);
      newSocket.on('connect', () => {
        console.log('✅ Socket connected');
        newSocket.emit('user:online', user.id);
      });

      newSocket.on('users:online', (users) => {
        setOnlineUsers(users);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};