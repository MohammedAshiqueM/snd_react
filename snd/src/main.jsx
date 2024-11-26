import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { initializeApp } from './auth';

const root = createRoot(document.getElementById('root'));

// Call initializeApp before rendering the app
initializeApp().then(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}).catch(() => {
  // Optionally handle any error that occurs during initialization
  console.error("Initialization failed, redirecting to login.");
  window.location.href = '/login';
});
