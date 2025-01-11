import React from 'react';

export const WebSocketContext = React.createContext(null);

export const WebSocketProvider = ({ children, socket }) => {
  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};