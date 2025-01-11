// import { useNotifications } from '../context/NotificationContext'; // Adjust path as needed
// import { notificationHandshake } from '../wsApi';
import { useNotifications } from './components/NotificationContext';
import { notificationHandshake } from './wsApi';

export class WebSocketManager {
    constructor(notificationHandler) {
      this.socket = null;
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;
      this.reconnectTimeout = null;
      this.notificationHandler = notificationHandler;
      this.connectionPromise = null;
      this.userId = null;
      console.log("WebSocketManager initialized with notificationHandler:", this.notificationHandler);
    }
  
    async connect(userId) {
      if (this.connectionPromise) {
        return this.connectionPromise;
      }
  
      this.userId = userId;
      
      try {
        this.connectionPromise = this.establishConnection();
        await this.connectionPromise;
        return true;
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        this.handleReconnect();
        return false;
      } finally {
        this.connectionPromise = null;
      }
    }
  
    async establishConnection() {
      try {
        // Get WebSocket URL from handshake
        const response = await notificationHandshake(this.userId);
        const { websocket_url } = response;
        
        if (!websocket_url) {
          throw new Error('No WebSocket URL received');
        }
  
        if (this.socket) {
          this.socket.close();
        }
  
        return new Promise((resolve, reject) => {
          this.socket = new WebSocket(websocket_url);
          
          const connectionTimeout = setTimeout(() => {
            reject(new Error('WebSocket connection timeout'));
            this.socket.close();
          }, 5000);
  
          this.socket.onopen = () => {
            console.log('Notification WebSocket Connected');
            clearTimeout(connectionTimeout);
            this.reconnectAttempts = 0;
            this.setupEventListeners();
            resolve();
          };
  
          this.socket.onerror = (error) => {
            clearTimeout(connectionTimeout);
            reject(error);
          };
        });
      } catch (error) {
        throw error;
      }
    }
  
    setupEventListeners() {
      if (!this.socket) return;
  
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (!this.notificationHandler) {
            console.error('Notification handler not available');
            return;
          }
  
          switch (data.type) {
            case 'new_notification':
              this.handleNewNotification(data);
              break;
            case 'unread_notifications':
              this.handleUnreadNotifications(data);
              break;
            case 'error':
              console.error('Server error:', data.message);
              break;
            default:
              console.log('Unknown notification type:', data.type);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };
  
      this.socket.onclose = (event) => {
        console.log('WebSocket closed with code:', event.code);
        if (!event.wasClean || event.code === 1008) {
          this.handleReconnect();
        }
      };
  
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }

  handleNewNotification(data) {
    const notification = data.notification;
    this.notificationHandler.addNotification({
      id: notification.id,
      message: notification.message,
      sender_id: notification.sender_id,
      sender: notification.sender_name,
      timestamp: notification.timestamp,
      isRead: false,
      type: notification.notification_type
    });

    if (Notification.permission === 'granted') {
      new Notification(notification.sender_name || 'New Notification', {
        body: notification.message,
        icon: '/path/to/notification-icon.png'
      });
    }
  }

  handleUnreadNotifications(data) {
    data.notifications.forEach(notification => {
      this.notificationHandler.addNotification({
        id: notification.id,
        message: notification.message,
        sender_id: notification.sender_id,
        timestamp: notification.timestamp,
        isRead: false,
        type: notification.notification_type
      });
    });
  }
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      this.reconnectTimeout = setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts})`);
        this.connect();
      }, delay);
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Create a singleton instance
export const wsManager = new WebSocketManager();