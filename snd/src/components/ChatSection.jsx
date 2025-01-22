import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Send } from 'lucide-react';

const ChatSection = ({ isChatOpen, toggleChat, messages, newMessage, setNewMessage, handleSendMessage, currentUserId }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isCurrentUser = (senderId) => senderId === currentUserId;

  return (
    <div 
      className={`fixed left-4 bottom-16 w-96 bg-gray-800 rounded-lg shadow-xl transition-transform duration-300 ${
        isChatOpen ? 'transform translate-y-0' : 'transform translate-y-full'
      }`}
    >
      {/* Chat Header */}
      <div className="flex justify-between items-center p-4 bg-gray-700 rounded-t-lg border-b border-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <h3 className="text-white font-semibold">Live Chat</h3>
          <span className="text-xs text-gray-400">({messages.length} messages)</span>
        </div>
        <button
          onClick={toggleChat}
          className="text-gray-400 hover:text-white p-1 hover:bg-gray-600 rounded-full transition-colors duration-200"
        >
          {isChatOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </div>

      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-800/50">
        {messages.map((message) => {
          const isOwn = isCurrentUser(message.sender_id);
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[80%] space-y-1">
                <div className={`flex items-center space-x-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  {!isOwn && (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <span className="text-white text-sm">
                        {message.sender_name[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-gray-400">
                    {isOwn ? 'You' : message.sender_name}
                  </span>
                </div>
                
                <div className={`rounded-2xl px-4 py-2 ${
                  isOwn 
                    ? 'bg-blue-500 text-white rounded-tr-none' 
                    : 'bg-gray-700 text-white rounded-tl-none'
                }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
                
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs text-gray-400">{message.time}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-700 rounded-b-lg border-t border-gray-600">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-600 text-white rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatSection;