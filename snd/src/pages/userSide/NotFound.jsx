// src/pages/NotFound.jsx
import React from 'react';

const NotFound = () => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '50px', 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh' 
    }}>
      <h1 style={{ fontSize: '3rem', color: '#dc3545' }}>404 - Page Not Found</h1>
      <p style={{ fontSize: '1.2rem', color: '#6c757d' }}>
        Oops! The page you're looking for doesn't exist.
      </p>
      <a 
        href="/" 
        style={{ 
          textDecoration: 'none', 
          color: '#fff', 
          backgroundColor: '#007bff', 
          padding: '10px 20px', 
          borderRadius: '5px' 
        }}
      >
        Go back to the homepage
      </a>
    </div>
  );
};

export default NotFound;