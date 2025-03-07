import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { useNotifications } from './NotificationContext';
import NotificationBadge from './NotificationBadge';
import NotificationToast from './NotificationToast';
import { getCloudinaryUrl } from '../constants/constant';

const PrivateChatContacts = ({
  contacts,
  selectedContact,
  onContactSelect,
  currentUserId,
  onlineUsers,
  websocket,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const { notifications, markAsRead, clearNotifications } =
    useNotifications();

  const debouncedSearch = useCallback(
    debounce((term) => {
      const filtered = contacts.filter(
        (contact) =>
          contact.username.toLowerCase().includes(term.toLowerCase()) ||
          contact.first_name?.toLowerCase().includes(term.toLowerCase()) ||
          contact.last_name?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredContacts(filtered);
    }, 300),
    [contacts]
  );

  useEffect(() => {
    setFilteredContacts(contacts);
  }, [contacts]);

  const handleContactSelect = (contact) => {
    markAsRead(contact.id);
    clearNotifications(contact.id);
    onContactSelect(contact);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-800">
        <input
          type="search"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search contacts"
          className="w-full bg-gray-800 text-gray-200 rounded-md px-4 py-2 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact) => {
          const notificationCount = notifications.filter(
            (n) => n.sender_id === contact.id && !n.isRead
          ).length;

          return (
            <div
              key={contact.id}
              onClick={() => handleContactSelect(contact)}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-800 
                          ${selectedContact?.id === contact.id ? 'bg-gray-800' : ''}`}
            >
              <div className="relative">
                {contact.profile_image ? (
                  <img
                    src={getCloudinaryUrl(contact.profile_image)}
                    alt={contact.username}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-xl text-white">
                      {contact.username[0].toUpperCase()}
                    </span>
                  </div>
                )}
                {onlineUsers.has(contact.id) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 
                                bg-green-500 rounded-full border-2 border-gray-800" />
                )}
                {notificationCount > 0 && <NotificationBadge count={notificationCount} />}
                {/* {notificationCount} */}
              </div>

              <div className="ml-4 flex-1">
                <div className="flex justify-between items-start">
                  <span className="font-medium">{contact.username}</span>
                  {contact.last_message_time && (
                    <span className="text-xs text-gray-400">
                      {formatLastMessageTime(contact.last_message_time)}
                    </span>
                  )}
                </div>
                {contact.last_message && (
                  <p className="text-sm text-gray-400 truncate">
                    {contact.last_message_sender_id === currentUserId ? 'You: ' : ''}
                    {contact.last_message}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {notifications.length > 0 && !notifications[0].isRead && (
        <NotificationToast
          notification={notifications[0]}
          onClose={() => markAsRead(notifications[0].sender_id)}
        />
      )}
    </div>
  );
};

export default PrivateChatContacts;