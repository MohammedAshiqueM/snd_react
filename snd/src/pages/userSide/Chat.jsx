import React, { useEffect, useState, useRef, useCallback } from "react";
import SecondNavbar from "../../components/SecondNavbar";
import SideBar from "../../components/SideBar";
import { usersList } from "../../api";
import { allUsers, chat, markMessagesAsRead, onlineStatus } from "../../wsApi";
import { useAuthStore } from "../../store/useAuthStore";
import debounce from 'lodash/debounce';
import PrivateChatContacts from "../../components/PrivateChatContacts";
import { NotificationProvider, useNotifications } from "../../components/NotificationContext";
import { Paperclip, Send } from "lucide-react";
import { useDropzone } from "react-dropzone";

const MessageItem = ({ msg }) => {
    const [mediaLoaded, setMediaLoaded] = useState(false);
    const [mediaError, setMediaError] = useState(false);
  
    const handleMediaLoad = () => {
      setMediaLoaded(true);
    };
  
    const handleMediaError = () => {
      setMediaError(true);
      console.error("Failed to load media");
    };
  
    return (
      <div className={`flex ${msg.isSent ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-lg rounded-lg px-4 py-2 ${
            msg.isSent ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          {msg.text && <p className="text-sm mb-2">{msg.text}</p>}
          
          {msg.media && !mediaError && (
            <div className="relative">
              {!mediaLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
              
              {msg.mediaType === "image" && (
                <img
                  src={msg.media}
                  alt="Shared image"
                  className={`max-w-xs rounded-md transition-opacity duration-300 ${
                    mediaLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={handleMediaLoad}
                  onError={handleMediaError}
                />
              )}
              
              {msg.mediaType === "video" && (
                <video
                  src={msg.media}
                  controls
                  className="max-w-xs rounded-md"
                  onLoadedData={handleMediaLoad}
                  onError={handleMediaError}
                />
              )}
              
              {msg.mediaType === "audio" && (
                <audio
                  src={msg.media}
                  controls
                  className="w-full max-w-xs"
                  onLoadedData={handleMediaLoad}
                  onError={handleMediaError}
                />
              )}
              
              {msg.mediaType === "file" && (
                <a
                  href={msg.media}
                  download
                  className="text-blue-400 hover:text-blue-300 underline flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Paperclip className="w-4 h-4" />
                  Download File
                </a>
              )}
            </div>
          )}
  
          <p className="text-xs text-gray-300 mt-1">
            {msg.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    );
  };

const NotificationToast = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Auto-dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4 animate-slide-up">
      <div>
        <h4 className="font-semibold">{notification.sender}</h4>
        <p className="text-sm text-gray-300">{notification.message}</p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-white">
        ×
      </button>
    </div>
  );
};

export default function Chat() {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const contactsContainerRef = useRef(null);
  const [activeNotification, setActiveNotification] = useState(null);
  const [wsInitialized, setWsInitialized] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return JSON.parse(localStorage.getItem("isSidebarCollapsed") || "false");
  });

  const [notifications, setNotifications] = useState([]);

  const addNotification = (newNotification) => {
    setNotifications((prev) => [...prev, newNotification]);
  };

  const removeNotification = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // infinite scroll with debounce
  const handleContactsScroll = useCallback(
    debounce(() => {
      if (!contactsContainerRef.current || loading || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = contactsContainerRef.current;
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        setPage((prev) => prev + 1);
      }
    }, 150),
    [loading, hasMore]
  );

  useEffect(() => {
    const container = contactsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleContactsScroll);
      return () => container.removeEventListener('scroll', handleContactsScroll);
    }
  }, [handleContactsScroll]);

  // contact update logic
  const updateContactWithNewMessage = useCallback((contactId, newMessage, timestamp, senderId) => {
    setContacts((prevContacts) => {
      const contactIndex = prevContacts.findIndex((c) => c.id === contactId);
      if (contactIndex === -1) return prevContacts;

      const updatedContact = {
        ...prevContacts[contactIndex],
        last_message: newMessage,
        last_message_time: timestamp,
        last_message_sender_id: senderId,
        unread_count:
          selectedContact?.id === contactId
            ? 0
            : senderId !== user.id
            ? (prevContacts[contactIndex].unread_count || 0) + 1
            : prevContacts[contactIndex].unread_count,
      };

      // Reorder contacts for real-time updates
      const newContacts = prevContacts.filter((c) => c.id !== contactId);
      return [updatedContact, ...newContacts];
    });
  }, [selectedContact, user.id]);

  const fetchContacts = async (pageNum = 1) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await allUsers({ page: pageNum });
      setContacts((prev) => {
        let updatedContacts;
        if (pageNum === 1) {
          updatedContacts = response.data;
        } else {
          const newContacts = [...prev];
          response.data.forEach((contact) => {
            if (!newContacts.some((c) => c.id === contact.id)) {
              newContacts.push(contact);
            }
          });
          updatedContacts = newContacts;
        }
        // Only sort contacts with messages involving the current user
        return [...updatedContacts]
          .map((contact) => ({
            ...contact,
            // Clear last message if not involving current user
            last_message:
              contact.last_message_sender_id === user.id ||
              contact.last_message_receiver_id === user.id
                ? contact.last_message
                : null,
            last_message_time:
              contact.last_message_sender_id === user.id ||
              contact.last_message_receiver_id === user.id
                ? contact.last_message_time
                : null,
          }))
          .sort((a, b) => {
            // Sort null times to the bottom
            if (!a.last_message_time) return 1;
            if (!b.last_message_time) return -1;
            return new Date(b.last_message_time) - new Date(a.last_message_time);
          });
      });
      setHasMore(response.has_more);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOnlineUsers = useCallback(async () => {
    try {
      const response = await onlineStatus();
      if (response && response.online_users) {
        setOnlineUsers(new Set(response.online_users));
      }
    } catch (error) {
      console.error("Failed to fetch online users:", error);
    }
  }, []);

  useEffect(() => {
    fetchOnlineUsers();
    fetchContacts(page);
  }, [fetchOnlineUsers, page]);

  useEffect(() => {
    // Update the online status in the contacts whenever the onlineUsers state changes
    setContacts((prevContacts) =>
      prevContacts.map((contact) => ({
        ...contact,
        isOnline: onlineUsers.has(contact.id),
      }))
    );
  }, [onlineUsers]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setWsInitialized(false);
      }
    };
  }, []);

  const handleContactSelect = useCallback(
    async (contact) => {
      setMessages([]);
      setSelectedContact(contact);

      const newRoomId = generateRoomId(user.id, contact.id);
      setActiveRoomId(newRoomId);

      try {
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }

        const response = await chat(contact.id);
        const selectedContactInfo = contact;

        const ws = new WebSocket(response.websocket_url);
        socketRef.current = ws;
        setWsInitialized(true);

        ws.onopen = () => {
          setConnectionStatus("connected");
          ws.send(
            JSON.stringify({
              type: 'mark_read_for_sender',
              sender_id: contact.id,
            })
          );

          ws.send(
            JSON.stringify({
              type: 'request_online_status',
            })
          );
        };

        ws.onmessage = (e) => {
            try {
              const data = JSON.parse(e.data);
              console.log("WebSocket message received:", data);
    
              const messageRoomId = generateRoomId(
                data.sender_id || user.id,
                data.receiver_id || selectedContactInfo.id
              );
    
              if (messageRoomId !== newRoomId) {
                console.log("Message for different room, ignoring");
                return;
              }
    
              switch (data.type) {
                case 'chat_history':
                  const formattedHistory = data.messages.map((msg) => ({
                    text: msg.content,
                    username: msg.sender_id === user.id ? user.username : selectedContactInfo.username,
                    isSent: msg.sender_id === user.id,
                    timestamp: new Date(msg.timestamp),
                    roomId: generateRoomId(msg.sender_id, msg.receiver_id),
                    media: msg.media, 
                    mediaType: msg.media_type 
                  }));
                  setMessages(formattedHistory);
                  scrollToBottom();
                  break;

              case 'notification_message':
                if (!selectedContactInfo || selectedContactInfo.id !== data.sender_id) {
                  setNotifications((prev) => {
                    const isDuplicate = prev.some(
                      (n) =>
                        n.sender_id === data.sender_id &&
                        n.message === data.message &&
                        Math.abs(new Date(n.timestamp) - new Date()) < 1000
                    );
                    if (isDuplicate) return prev;

                    return [
                      ...prev,
                      {
                        sender: data.sender,
                        message: data.message,
                        sender_id: data.sender_id,
                        timestamp: new Date(),
                        isRead: false,
                      },
                    ];
                  });

                  updateContactWithNewMessage(
                    data.sender_id,
                    data.message,
                    new Date().toISOString(),
                    data.sender_id
                  );
                }
                break;

              case 'online_status':
                if (Array.isArray(data.online_users)) {
                  setOnlineUsers(new Set(data.online_users));
                }
                break;

                default:
                    if (data.message || data.media) {
                      const isSentByMe = data.sender_id === user.id;
                      const newMessage = {
                        text: data.message,
                        username: isSentByMe ? user.username : selectedContactInfo.username,
                        isSent: isSentByMe,
                        timestamp: new Date(data.timestamp || Date.now()),
                        roomId: messageRoomId,
                        media: data.media,
                        mediaType: data.media_type
                      };
      
                      setMessages((prev) => {
                        const newMessage = {
                            text: data.message,
                            username: isSentByMe ? user.username : selectedContactInfo.username,
                            isSent: isSentByMe,
                            timestamp: new Date(data.timestamp || Date.now()),
                            roomId: messageRoomId,
                            media: data.media,
                            mediaType: data.media_type
                          };
                        const isDuplicate = prev.some(
                          (m) =>
                            m.text === newMessage.text &&
                            m.username === newMessage.username &&
                            Math.abs(m.timestamp - newMessage.timestamp) < 1000 &&
                            m.roomId === newMessage.roomId &&
                            m.media === newMessage.media
                        );
                        return isDuplicate ? prev : [...prev, newMessage];
                      }
                    );
      
                      if (!isSentByMe) {
                        updateContactWithNewMessage(
                          data.sender_id,
                          data.message || "Media message",
                          data.timestamp || new Date().toISOString(),
                          data.sender_id
                        );
                      }
                      scrollToBottom();
                    }
                }
              } catch (error) {
                console.error("Error processing WebSocket message:", error);
              }
      
        };

        ws.onclose = () => {
          setConnectionStatus("disconnected");
          setWsInitialized(false);
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setConnectionStatus("error");
          setWsInitialized(false);
        };
      } catch (error) {
        console.error("Error selecting contact:", error);
      }
    },
    [user, scrollToBottom, updateContactWithNewMessage]
  );

  const generateRoomId = (user1_id, user2_id) => {
    const sorted_ids = [user1_id, user2_id].sort((a, b) => a - b);
    return `room_${sorted_ids[0]}_${sorted_ids[1]}`;
  };

  const sendMessage = useCallback(
    (e) => {
      e.preventDefault();
      if ((!message.trim() && !media) || connectionStatus !== "connected" || !selectedContact) return;

      const messageData = {
        message: message.trim(),
        username: user.username,
        media,
        media_type: mediaType,
      };

      try {
        socketRef.current.send(JSON.stringify(messageData));
        setMessage("");
        setMedia(null);
        setMediaType(null);

        // Update the contact's last message without reordering
        updateContactWithNewMessage(
          selectedContact.id,
          messageData.message || "Media file",
          new Date().toISOString(),
          user.id
        );
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [message, media, mediaType, connectionStatus, user, selectedContact, updateContactWithNewMessage]
  );

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setMedia(reader.result);
        setMediaType(file.type.split("/")[0]); // 'image', 'video', 'audio', etc.
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-[#0A0B1A] text-white flex flex-col">
        <SecondNavbar />
        <div
          className={`flex-1 flex overflow-hidden transition-all duration-300 ${
            isSidebarCollapsed ? "ml-16" : "ml-48"
          }`}
        >
          <SideBar
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          {notifications.map((notification, index) => (
            <NotificationToast
              key={index}
              notification={notification}
              onClose={() => removeNotification(index)}
            />
          ))}

          <div className="flex flex-1 h-[calc(100vh-64px)]">
            {/* Contacts List */}
            <div className="w-72 bg-[#0F0A2A] border-r border-gray-800 flex flex-col">
              <div className="p-4 border-b border-gray-800">
                <input
                  type="search"
                  placeholder="Search contacts"
                  className="w-full bg-gray-800 text-gray-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div
                ref={contactsContainerRef}
                className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
              >
                <div>
                  <PrivateChatContacts
                    contacts={contacts}
                    selectedContact={selectedContact}
                    onContactSelect={handleContactSelect}
                    currentUserId={user.id}
                    onlineUsers={onlineUsers}
                    websocket={socketRef.current}
                  />
                  {loading && (
                    <div className="p-4 text-center text-gray-400">Loading more contacts...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-[#0F0A2A] flex flex-col">
              {selectedContact ? (
                <>
                  <div className="p-4 border-b border-gray-800 flex items-center">
                    {/* Chat Header */}
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">
                          {selectedContact.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {onlineUsers.has(selectedContact.id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0F0A2A]" />
                      )}
                    </div>
                    <span className="ml-3 text-white">{selectedContact.username}</span>
                    <span className="ml-3 text-sm text-gray-400">
                      {onlineUsers.has(selectedContact.id) ? "Online" : "Offline"}
                    </span>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {messages.map((msg, index) => (
                    <MessageItem key={index} msg={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                  {/* Message Input */}
                  <form onSubmit={sendMessage} className="p-4 border-t border-gray-800">
                                        <div className="flex items-center space-x-2">
                      {/* Media Upload */}
                      <div {...getRootProps()} className="cursor-pointer p-2 bg-gray-800 rounded-md">
                        <input {...getInputProps()} />
                        <Paperclip className="w-5 h-5 text-gray-400" />
                      </div>

                      {/* Message Input */}
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write a message"
                        className="flex-1 bg-gray-800 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={connectionStatus !== "connected"}
                      />

                      {/* Send Button */}
                      <button
                        type="submit"
                        disabled={connectionStatus !== "connected"}
                        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Media Preview */}
                    {media && (
                      <div className="mt-2">
                        {mediaType === "image" && (
                          <img src={media} alt="Uploaded" className="max-w-xs rounded-md" />
                        )}
                        {mediaType === "video" && (
                          <video src={media} controls className="max-w-xs rounded-md" />
                        )}
                        {mediaType === "audio" && <audio src={media} controls />}
                        {mediaType === "file" && (
                          <a href={media} download className="text-blue-500 hover:underline">
                            Download File
                          </a>
                        )}
                      </div>
                    )}
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="h-16 w-16 mx-auto rounded-full bg-gray-800/50 flex items-center justify-center">
                        <Send className="h-8 w-8" />
                      </div>
                    </div>
                    <p className="text-lg font-medium">Select a contact to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {activeNotification && (
          <NotificationToast
            notification={activeNotification}
            onClose={() => setActiveNotification(null)}
          />
        )}
      </div>
    </NotificationProvider>
  );
}