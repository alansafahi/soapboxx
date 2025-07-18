import { useAuth } from '@/hooks/useAuth';
import { ModerationDashboard } from '@/components/content-moderation/ModerationDashboard';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import MobileNav from '@/components/MobileNav';
import { useEffect } from 'react';

export default function ModerationDashboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Check if user is a moderator
  const { data: userChurches } = useQuery({
    queryKey: ['/api/user/churches'],
    enabled: !!user,
  });

  const isModerator = user?.role === 'soapbox_owner' || 
                     userChurches?.some((uc: any) => ['church_admin', 'pastor', 'lead-pastor', 'admin'].includes(uc.role));

  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  if (!isModerator) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Access Restricted
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need moderator privileges to access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ModerationDashboard />
      </div>
      <MobileNav />
    </div>
  );
}