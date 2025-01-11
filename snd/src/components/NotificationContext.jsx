import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import {
  markMessagesAsRead,
  onlineStatus,
  notifications as fetchNotificationsAPI,
  addNotifications,
  markAllNotifications
} from '../wsApi';
import { WebSocketManager } from '../websocketManager';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuthStore();
  const [wsManager, setWsManager] = useState(null);
  const wsManagerRef = useRef(null);
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetchNotificationsAPI();
      const newNotifications = Array.isArray(response) ? response : response.notifications || [];
      const newCount = typeof response === 'object' ? response.unread_count : newNotifications.length;
  
      console.log('Fetched Notifications:', newNotifications); // Log fetched notifications
      console.log('Unread Count:', newCount); // Log unread count
  
      setNotifications(newNotifications);
      setUnreadCount(newCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]); // Set default value on error
      setUnreadCount(0);
    }
  }, [user]);
  
  const handleWebSocketNotification = useCallback((wsNotification) => {
    if (!wsNotification) return;
  
    console.log('WebSocket Notification Received:', wsNotification); // Log WebSocket notification
  
    setNotifications(prev => {
      const exists = prev.some(n => n.id === wsNotification.id);
      if (exists) return prev;
  
      return [wsNotification, ...prev];
    });
  
    if (!wsNotification.isRead) {
      setUnreadCount(count => count + 1);
    }
  }, []);
  
  const notificationHandlerRef = useRef({
    addNotification: handleWebSocketNotification,
    removeNotification: async (notificationId) => {
      if (!notificationId) return;
      try {
        await addNotifications(notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(count => Math.max(0, count - 1));
      } catch (error) {
        console.error('Error removing notification:', error);
      }
    },
    markAsRead: async (senderId) => {
      if (!senderId) return;
      try {
        await markMessagesAsRead(senderId);
        setNotifications(prev => {
          const updated = prev.map(notif =>
            notif.sender_id === senderId ? { ...notif, isRead: true } : notif
          );
          const unread = updated.filter(n => !n.isRead).length;
          setUnreadCount(unread);
          return updated;
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    },
    clearNotifications: (senderId) => {
      if (!senderId) return;
      setNotifications(prev => {
        const filtered = prev.filter(notif => notif.sender_id !== senderId);
        setUnreadCount(filtered.filter(n => !n.isRead).length);
        return filtered;
      });
    }
  });
  
  const addNotification = useCallback((notification) => {
    if (!notification) return;
  
    console.log('Manually Added Notification:', notification); // Log manually added notification
  
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(count => count + 1);
  }, []);
  
  const markAsRead = useCallback(async (senderId) => {
    if (!senderId) return;
    try {
      console.log('Marking notifications as read for senderId:', senderId); // Log senderId
  
      await markMessagesAsRead(senderId);
      setNotifications(prev => {
        const updatedNotifications = prev.map(notif =>
          notif.sender_id === senderId ? { ...notif, isRead: true } : notif
        );
        console.log('Updated Notifications After Marking Read:', updatedNotifications); // Log updated notifications
        const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
        setUnreadCount(unreadCount);
        return updatedNotifications;
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, []);

  const removeNotification = useCallback(async (notificationId) => {
    if (!notificationId) return;
    try {
      await addNotifications(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(count => Math.max(0, count - 1));
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  }, []);

  const clearNotifications = useCallback((senderId) => {
    if (!senderId) return;
    setNotifications(prev => {
      const filtered = prev.filter(notif => notif.sender_id !== senderId);
      setUnreadCount(filtered.filter(n => !n.isRead).length);
      return filtered;
    });
  }, []);

  // Initialize WebSocketManager with notification handler
  useEffect(() => {
    if (user && !wsManagerRef.current) {
      const newWsManager = new WebSocketManager(notificationHandlerRef.current);
      wsManagerRef.current = newWsManager;
      setWsManager(newWsManager);

      const initializeWebSocket = async () => {
        try {
          await newWsManager.connect(user.id);
        } catch (error) {
          console.error('Failed to initialize WebSocket:', error);
        }
      };

      initializeWebSocket();

      return () => {
        if (wsManagerRef.current) {
          wsManagerRef.current.disconnect();
          wsManagerRef.current = null;
        }
      };
    }
  }, [user]);

  const value = {
    notifications: notifications || [], // Ensure notifications is always an array
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    clearNotifications,
    wsManager
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};