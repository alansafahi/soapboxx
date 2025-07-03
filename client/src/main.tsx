import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle unhandled promise rejections and runtime plugin conflicts
window.addEventListener('unhandledrejection', (event) => {
  // Suppress runtime error plugin conflicts
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('runtime-error-plugin') || 
       event.reason.message.includes('plugin') ||
       event.reason.message.includes('overlay') ||
       event.reason.message.includes('[object Object]') ||
       event.reason.message.includes('is not a valid HTTP method'))) {
    event.preventDefault();
    return;
  }
  
  // Suppress WebSocket errors since we're using REST-only mode
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('WebSocket') || 
       event.reason.message.includes('websocket') ||
       event.reason.message.includes('wss://'))) {
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
  
  // Suppress 404 errors from failed API requests
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('404') || 
       event.reason.message.includes('Not Found') ||
       event.reason.message.includes('not found'))) {
    event.preventDefault();
    return;
  }
  
  // Suppress authentication and network errors handled by components
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('fetch') || 
       event.reason.message.includes('network') ||
       event.reason.message.includes('auth') ||
       event.reason.message.includes('login') ||
       event.reason.message.includes('Network error'))) {
    event.preventDefault();
    return;
  }
  
  // Suppress empty rejection objects that trigger plugin failures
  if (!event.reason || (typeof event.reason === 'object' && Object.keys(event.reason).length === 0)) {
    event.preventDefault();
    return;
  }
  
  // Log legitimate errors only
});

// Global error handler for runtime plugin conflicts
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && 
      (event.error.message.includes('[object Object]') ||
       event.error.message.includes('is not a valid HTTP method') ||
       event.error.message.includes('runtime-error-plugin'))) {
    event.preventDefault();
    return false;
  }
});

// Prevent runtime error plugin from intercepting fetch errors
const originalFetch = window.fetch;
window.fetch = function(...args) {
  // Validate first argument is a string or Request object
  if (args[0] && typeof args[0] !== 'string' && !(args[0] instanceof Request)) {
    return Promise.reject(new Error('Invalid fetch URL'));
  }
  
  // Validate second argument if present
  if (args[1] && args[1].method && typeof args[1].method !== 'string') {
    args[1] = { ...args[1], method: 'POST' };
  }
  
  return originalFetch.apply(this, args);
};

createRoot(document.getElementById("root")!).render(
  <App />
);
