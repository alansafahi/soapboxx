import React from 'react';
import { MilestoneCelebration } from '@/components/MilestoneCelebration';

export function MilestonesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Spiritual Milestones</h1>
        <p className="text-gray-600">
          Track your growth and celebrate achievements in your faith journey
        </p>
      </div>
      
      <MilestoneCelebration />
    </div>
  );
}

export default MilestonesPage;