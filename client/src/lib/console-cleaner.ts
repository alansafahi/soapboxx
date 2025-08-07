// Production console cleaner to reduce noise in development
export function initializeConsoleCleaner() {
  if (typeof window === 'undefined') return;

  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args) => {
    const message = args.join(' ');
    
    // Filter out known harmless errors that clutter the console
    const ignoredErrors = [
      'Failed to load resource: net::ERR_INTERNET_DISCONNECTED',
      'WebSocket connection',
      'wss://replit.com/graphql-subscriptions',
      'ws://replit.com/graphql-subscriptions', 
      'remote-metrics.tsx:13',
      'Failed to load resource: net::ERR_SOCKET_NOT_CONNECTED',
      'stalwart.build.js:1',
      'stalwart.build.js:1 Failed ping',
      'TypeError: Failed to fetch',
      'NetworkError when attempting to fetch resource',
      'at stalwart.build.js:1',
      'at t.anonymous',
      'at remote-metrics',
      'performance.mark',
      'performance.measure'
    ];

    if (!ignoredErrors.some(ignored => message.includes(ignored))) {
      originalError.apply(console, args);
    }
  };

  console.warn = (...args) => {
    const message = args.join(' ');
    
    // Filter out known harmless warnings
    const ignoredWarnings = [
      'Unrecognized feature:',
      'webSocket connection failed',
      'performance.mark',
      'performance.measure'
    ];

    if (!ignoredWarnings.some(ignored => message.includes(ignored))) {
      originalWarn.apply(console, args);
    }
  };
}