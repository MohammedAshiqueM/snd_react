import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const markAsRead = (senderId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.sender_id === senderId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const clearNotifications = (senderId) => {
    setNotifications(prev => 
      prev.filter(notif => notif.sender_id !== senderId)
    );
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        markAsRead, 
        clearNotifications 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);