import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle unhandled promise rejections and runtime plugin conflicts
window.addEventListener('unhandledrejection', (event) => {
  // Suppress runtime error plugin conflicts
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('runtime-error-plugin') || 
       event.reason.message.includes('plugin') ||
       event.reason.message.includes('overlay'))) {
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
  console.warn('Unhandled rejection:', event.reason);
});

createRoot(document.getElementById("root")!).render(
  <App />
);
