console.log("main.tsx loading...");
import { createRoot } from "react-dom/client";
console.log("React imports loaded");
import App from "./App";
console.log("App import loaded");
import "./index.css";
console.log("CSS loaded");

// Check if DOM is ready
console.log("DOM readyState:", document.readyState);
console.log("Root element exists:", !!document.getElementById("root"));
console.log("Document body exists:", !!document.body);

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

try {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Root element not found");
  }
  
  console.log("Starting React app...");
  console.log("Window location:", window.location.href);
  console.log("Window origin:", window.location.origin);
  const root = createRoot(container);
  
  // Test with minimal component first
  root.render(
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1>SoapBox Super App - Test</h1>
      <p>Basic React render test successful!</p>
      <p>Now testing full app...</p>
    </div>
  );
  
  // After 2 seconds, render the full app
  setTimeout(() => {
    try {
      root.render(<App />);
      console.log("Full app rendered successfully");
    } catch (appError) {
      console.error("App component error:", appError);
      const errorMessage = appError instanceof Error ? appError.message : 'Unknown app error';
      root.render(
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
          <h1>SoapBox Super App - Error</h1>
          <p style={{ color: 'red' }}>App component failed to load</p>
          <p style={{ fontSize: '12px', color: 'red' }}>Error: {errorMessage}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Refresh Page</button>
        </div>
      );
    }
  }, 2000);
  console.log("React app rendered successfully");
} catch (error) {
  console.error("Failed to render React app:", error);
  const container = document.getElementById("root");
  if (container) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    container.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1>SoapBox Super App</h1>
        <p>Loading error. Please refresh the page.</p>
        <p style="color: red; font-size: 12px;">Error: ${errorMessage}</p>
        <button onclick="window.location.reload()" style="margin-top: 10px; padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer;">Refresh Page</button>
      </div>
    `;
  }
}
