import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const serverUrl = process.env.REACT_APP_SERVER_URL || window.location.origin || 'http://localhost:3000';
      const newSocket = io(serverUrl, {
        transports: ['websocket'],
        upgrade: true,
        rememberUpgrade: true
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setConnected(true);
        
        // Join user-specific room for notifications
        newSocket.emit('join', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      // Listen for notifications
      newSocket.on('notification', (notification) => {
        console.log('New notification received:', notification);
        setNotifications(prev => [notification, ...prev]);
      });

      // Listen for messages
      newSocket.on('receive_message', (message) => {
        console.log('New message received:', message);
        // You can emit a custom event or update state here
        window.dispatchEvent(new CustomEvent('newMessage', { detail: message }));
      });

      // Listen for exchange status changes
      newSocket.on('status_changed', (data) => {
        console.log('Exchange status changed:', data);
        window.dispatchEvent(new CustomEvent('exchangeStatusChanged', { detail: data }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setConnected(false);
      };
    } else {
      // Clean up socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  const joinExchange = (exchangeId) => {
    if (socket && connected) {
      socket.emit('join_exchange', exchangeId);
    }
  };

  const leaveExchange = (exchangeId) => {
    if (socket && connected) {
      socket.emit('leave_exchange', exchangeId);
    }
  };

  const sendMessage = (messageData) => {
    if (socket && connected) {
      socket.emit('send_message', messageData);
    }
  };

  const updateExchangeStatus = (exchangeId, status) => {
    if (socket && connected) {
      socket.emit('status_update', { exchangeId, status });
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    connected,
    notifications,
    joinExchange,
    leaveExchange,
    sendMessage,
    updateExchangeStatus,
    markNotificationAsRead,
    clearNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};






