import React from 'react';

export default function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>SoapBox Super App - Test Page</h1>
      <p>If you can see this, the React app is loading successfully!</p>
      <p>Current URL: {window.location.href}</p>
      <p>Current hostname: {window.location.hostname}</p>
      <p>Current port: {window.location.port}</p>
      <button onClick={() => window.location.reload()}>Refresh</button>
    </div>
  );
}