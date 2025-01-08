import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import {
  markMessagesAsRead,
  onlineStatus,
  notifications as fetchNotificationsAPI,
  addNotifications,
  markAllNotifications
} from '../wsApi';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuthStore();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetchNotificationsAPI();
      // Handle both array and object response formats
      const newNotifications = Array.isArray(response) ? response : response.notifications || [];
      const newCount = typeof response === 'object' ? response.unread_count : newNotifications.length;
      
      setNotifications(newNotifications);
      setUnreadCount(newCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]); // Set default value on error
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const pollInterval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(pollInterval);
    }
  }, [fetchNotifications, user]);

  const addNotification = useCallback((notification) => {
    if (!notification) return;
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(count => count + 1);
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

  const markAsRead = useCallback(async (senderId) => {
    if (!senderId) return;
    try {
      await markMessagesAsRead(senderId);
      setNotifications(prev => {
        const updatedNotifications = prev.map(notif =>
          notif.sender_id === senderId ? { ...notif, isRead: true } : notif
        );
        const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
        setUnreadCount(unreadCount);
        return updatedNotifications;
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
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

  const value = {
    notifications: notifications || [], // Ensure notifications is always an array
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    clearNotifications,
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