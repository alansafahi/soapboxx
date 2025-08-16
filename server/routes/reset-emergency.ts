// Emergency reset endpoint for development
import { Express } from 'express';

export function setupEmergencyReset(app: Express, resetFunction: () => void) {
  // Development endpoint to reset emergency mode
  app.post('/api/reset-emergency', (req, res) => {
    resetFunction();
    res.json({ 
      success: true, 
      message: 'Emergency mode reset - Normal authentication restored' 
    });
  });
}