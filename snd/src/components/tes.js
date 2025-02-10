// // NotificationContext.js
// import React, { createContext, useContext, useState } from 'react';

// const NotificationContext = createContext();

// export const NotificationProvider = ({ children }) => {
//   const [notifications, setNotifications] = useState([]);

//   const addNotification = (notification) => {
//     setNotifications(prev => [notification, ...prev]);
//   };

//   const markAsRead = (senderId) => {
//     setNotifications(prev => 
//       prev.map(notif => 
//         notif.sender_id === senderId ? { ...notif, isRead: true } : notif
//       )
//     );
//   };

//   const clearNotifications = (senderId) => {
//     setNotifications(prev => 
//       prev.filter(notif => notif.sender_id !== senderId)
//     );
//   };

//   return (
//     <NotificationContext.Provider 
//       value={{ 
//         notifications, 
//         addNotification, 
//         markAsRead, 
//         clearNotifications 
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotifications = () => useContext(NotificationContext);

// // NotificationBadge.js
// const NotificationBadge = ({ count }) => {
//   if (!count) return null;
  
//   return (
//     <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
//                      rounded-full h-5 w-5 flex items-center justify-center">
//       {count > 9 ? '9+' : count}
//     </span>
//   );
// };

// // NotificationToast.js
// const NotificationToast = ({ notification, onClose }) => {
//   return (
//     <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg 
//                     shadow-lg flex items-center space-x-4 animate-slide-up">
//       <div>
//         <h4 className="font-semibold">{notification.sender}</h4>
//         <p className="text-sm text-gray-300">{notification.message}</p>
//       </div>
//       <button 
//         onClick={onClose}
//         className="text-gray-400 hover:text-white"
//       >
//         ×
//       </button>
//     </div>
//   );
// };

// // Updated PrivateChatContacts.js
// import React, { useState, useEffect, useCallback } from 'react';
// import { debounce } from 'lodash';
// import { useNotifications } from './NotificationContext';

// const PrivateChatContacts = ({ 
//   contacts, 
//   selectedContact, 
//   onContactSelect, 
//   currentUserId, 
//   onlineUsers,
//   websocket 
// }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filteredContacts, setFilteredContacts] = useState(contacts);
//   const { 
//     notifications, 
//     addNotification, 
//     markAsRead, 
//     clearNotifications 
//   } = useNotifications();

//   useEffect(() => {
//     if (websocket) {
//       websocket.addEventListener('message', handleWebSocketMessage);
//       return () => {
//         websocket.removeEventListener('message', handleWebSocketMessage);
//       };
//     }
//   }, [websocket]);

//   const handleWebSocketMessage = (event) => {
//     const data = JSON.parse(event.data);
//     if (data.type === 'notification') {
//       // Only show notification if we're not already chatting with this person
//       if (!selectedContact || selectedContact.id !== data.sender_id) {
//         addNotification({
//           sender: data.sender,
//           sender_id: data.sender_id,
//           message: data.message,
//           timestamp: new Date(),
//           isRead: false
//         });
//       }
//     }
//   };

//   const handleContactSelect = (contact) => {
//     markAsRead(contact.id);
//     clearNotifications(contact.id);
//     onContactSelect(contact);
//   };

//   // Rest of your existing PrivateChatContacts code...

//   return (
//     <div className="flex flex-col h-full">
//       {/* Existing search input */}
      
//       <div className="flex-1 overflow-y-auto">
//         {filteredContacts.map((contact) => {
//           const notificationCount = notifications.filter(
//             n => n.sender_id === contact.id && !n.isRead
//           ).length;
          
//           return (
//             <div
//               key={contact.id}
//               onClick={() => handleContactSelect(contact)}
//               className={`
//                 flex items-center p-4 cursor-pointer hover:bg-gray-800
//                 ${selectedContact?.id === contact.id ? 'bg-gray-800' : ''}
//                 ${notificationCount > 0 ? 'bg-opacity-50 bg-blue-900' : ''}
//               `}
//             >
//               <div className="relative">
//                 {/* Existing avatar code */}
                
//                 {/* Add notification badge */}
//                 {notificationCount > 0 && (
//                   <NotificationBadge count={notificationCount} />
//                 )}
//               </div>
              
//               {/* Rest of your existing contact item code */}
//             </div>
//           );
//         })}
//       </div>
      
//       {/* Show latest notification toast */}
//       {notifications.length > 0 && !notifications[0].isRead && (
//         <NotificationToast 
//           notification={notifications[0]}
//           onClose={() => markAsRead(notifications[0].sender_id)}
//         />
//       )}
//     </div>
//   );
// };

// export default PrivateChatContacts;