import React, { useState, useEffect, useCallback } from 'react';
import { notificationHandshake } from '../wsApi';

const WebSocketNotification = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Connect WebSocket
  const connectWebSocket = useCallback(async () => {
    if (socket) {
      socket.close();
    }

    try {
      const { websocket_url } = await notificationHandshake(userId);
      console.log('Connecting to WebSocket:', websocket_url); // Debug

      const newSocket = new WebSocket(websocket_url);

      // Set up event handlers before attempting connection
      newSocket.addEventListener('open', () => {
        console.log('WebSocket Connected');
        setSocket(newSocket);
      });

      newSocket.addEventListener('message', (event) => {
        console.log('Raw WebSocket Message:', event.data); // Debug
        try {
          const data = JSON.parse(event.data);
          console.log('Parsed WebSocket Message:', data); // Debug
        //   console.log('Received:', data);
          
          if (data.type === 'new_notification') {
            handleNewNotification(data.notification);
          } else if (data.type === 'unread_notifications') {
            handleUnreadNotifications(data.notifications);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      });

      newSocket.addEventListener('error', (error) => {
        console.error('WebSocket Error:', error);
      });

      newSocket.addEventListener('close', (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setSocket(null);
        // Attempt to reconnect unless it was an intentional close
        if (event.code !== 1000) {
          setTimeout(connectWebSocket, 5000);
        }
      });

    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      connectWebSocket();
    }

    return () => {
      if (socket) {
        socket.close(1000, 'Component unmounting');
        setSocket(null);
      }
    };
  }, [userId, connectWebSocket]);
  useEffect(() => {
    if (isDropdownOpen && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'fetch_unread_notifications' }));
    }
  }, [isDropdownOpen, socket]);
  
  // Handle new notification
  const handleNewNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Trigger a browser notification
    if (Notification.permission === 'granted') {
      new Notification(notification.sender_name || 'New Notification', {
        body: notification.message,
        icon: '/notification-icon.png', // Replace with your actual icon path
      });
    }
  }, []);

  // Sync unread notifications
  const handleUnreadNotifications = useCallback((fetchedNotifications) => {
    setNotifications((prev) => {
      const mergedNotifications = [...fetchedNotifications, ...prev];
      const uniqueNotifications = mergedNotifications.filter(
        (value, index, self) =>
          index === self.findIndex((n) => n.id === value.id)
      );
      return uniqueNotifications.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    });
  
    setUnreadCount((prev) =>
      fetchedNotifications.filter((n) => !n.isRead).length
    );
  }, []);

  useEffect(() => {
    if (socket) {
      const handleMessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Parsed WebSocket Message:', data); // Debug
  
          if (data.type === 'new_notification') {
            handleNewNotification(data.notification);
          } else if (data.type === 'unread_notifications') {
            handleUnreadNotifications(data.notifications);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };
  
      socket.addEventListener('message', handleMessage);
  
      return () => {
        socket.removeEventListener('message', handleMessage);
      };
    }
  }, [socket, handleNewNotification, handleUnreadNotifications]);
  
  // Mark a notification as read
  const markAsRead = async (notification) => {
    try {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: 'mark_read',
            notification_id: notification.id,
          })
        );
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Establish WebSocket connection on component mount
  useEffect(() => {
    if (userId) {
      connectWebSocket();
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [userId, connectWebSocket]);

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        className="relative p-2"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405a2.032 2.032 0 01-.595-1.405V10c0-3.59-2.91-6.5-6.5-6.5S5.5 6.41 5.5 10v4.19c0 .52-.212 1.027-.595 1.405L3.5 17h5m6.5 0v1.5a3.5 3.5 0 01-7 0V17m7 0H8"
          ></path>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Notifications */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md border">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  onClick={() => markAsRead(notification)}
                  className={`p-4 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm text-gray-500">
                    {notification.message}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(notification.timestamp).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default WebSocketNotification;
