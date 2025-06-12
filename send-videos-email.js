import fs from 'fs';
import path from 'path';

// Simple script to test video email functionality
async function sendVideosEmail() {
  try {
    const response = await fetch('https://2c924485-4bb4-4841-992a-dd991482cfcd-00-29nlce9a8jvps.kirk.replit.dev/api/videos/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': fs.readFileSync('./cookies.txt', 'utf8').trim()
      },
      body: JSON.stringify({
        emailAddress: 'alan@soapboxsuperapp.com'
      })
    });

    const result = await response.json();
    console.log('Email send result:', result);
    
    // Also check what videos exist
    const videoFiles = fs.readdirSync('./uploads/videos/');
    console.log('Available video files:', videoFiles);
    
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

sendVideosEmail();