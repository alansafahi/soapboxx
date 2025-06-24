import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle unhandled promise rejections to prevent console errors
window.addEventListener('unhandledrejection', (event) => {
  // Suppress WebSocket errors since we're using REST-only mode
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('WebSocket') || 
       event.reason.message.includes('websocket') ||
       event.reason.message.includes('wss://'))) {
    console.warn('WebSocket error suppressed (REST-only mode):', event.reason.message);
    event.preventDefault();
    return;
  }
  
  // Suppress Vite HMR connection errors
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('vite') ||
       event.reason.message.includes('connecting'))) {
    event.preventDefault();
    return;
  }
  
  // Suppress 404 errors from failed API requests to prevent global error display
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('404') || 
       event.reason.message.includes('Not Found') ||
       event.reason.message.includes('not found'))) {
    event.preventDefault();
    return;
  }
  
  // Suppress authentication and network errors that are handled by components
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('fetch') || 
       event.reason.message.includes('network') ||
       event.reason.message.includes('auth') ||
       event.reason.message.includes('login') ||
       event.reason.message.includes('Network error'))) {
    event.preventDefault();
    return;
  }
  
  // Log other errors for debugging
  console.warn('Unhandled rejection:', event.reason);
});

createRoot(document.getElementById("root")!).render(
  <App />
);
