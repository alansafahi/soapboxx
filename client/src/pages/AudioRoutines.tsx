import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function AudioRoutines() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRoutineId, setSelectedRoutineId] = useState(null);

  // Test basic component rendering first
  console.log('AudioRoutines component rendering');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Audio Spiritual Routines
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Guided meditation, prayer, and scripture experiences with personalized audio
        </p>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow">
          <h2 className="text-xl font-semibold mb-4">Available Routines</h2>
          <p className="text-gray-600">Loading audio routines...</p>
        </div>
      </div>
    </div>
  );
}