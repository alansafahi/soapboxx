import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeConsoleCleaner } from "./lib/console-cleaner";

// Initialize console cleaning to reduce development noise
initializeConsoleCleaner();

// Suppress SSL errors from Replit development environment
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('SSL') || 
       event.reason.message.includes('dotdevproxy') ||
       event.reason.message.includes('reachability'))) {
    event.preventDefault();
  }
});

try {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Root container not found");
  }

  const root = createRoot(container);
  root.render(<App />);
} catch (error) {
  // Failed to render React app - error handled
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