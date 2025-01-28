import React, { useState, useEffect, useCallback } from 'react';
import { notificationHandshake } from '../wsApi';
import { Bell } from 'lucide-react';

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
        className="relative rounded-full p-2 text-gray-400 hover:text-white hover:bg-indigo-500/10 
                transition-all duration-300 group"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center 
                        rounded-full bg-indigo-500 group-hover:animate-pulse text-white text-xs">{unreadCount}
            </span>
        )}
    </button>


      {/* Dropdown Notifications */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#1a1b2e] rounded-lg shadow-lg 
                     border border-gray-800/50 overflow-hidden z-50">
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification)}
                    className={`p-4 cursor-pointer hover:bg-indigo-500/10 
                             transition-colors duration-200
                             ${!notification.isRead ? 'bg-indigo-500/5' : ''}`}
                  >
                    <div className="font-medium text-white">
                      {notification.title}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {notification.message}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebSocketNotification;
