import { useAuth } from '@/hooks/useAuth';
import { ModerationDashboard } from '@/components/content-moderation/ModerationDashboard';
import { useQuery } from '@tanstack/react-query';
import MobileNav from '@/components/mobile-nav';

export default function ModerationDashboardPage() {
  const { user } = useAuth();

  // Check if user is a moderator
  const { data: userChurches, isLoading: churchesLoading, error: churchesError } = useQuery({
    queryKey: ['/api/users/churches'],
    enabled: !!user,
  });

  const isModerator = user?.role === 'soapbox_owner' || 
                     userChurches?.some((uc: any) => ['church_admin', 'pastor', 'lead-pastor', 'admin'].includes(uc.role));

  // If there's an error loading churches, show a more helpful message
  if (churchesError && !churchesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Session Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Unable to verify your church associations. Please refresh the page or log in again.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while checking permissions
  if (churchesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Loading...
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Checking your moderation privileges...
          </p>
        </div>
      </div>
    );
  }

  // Remove redirect useEffect as it may cause navigation conflicts
  // Authentication is handled by ProtectedRoute wrapper in App.tsx

  if (!isModerator && !churchesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Access Restricted
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need moderator privileges to access this dashboard.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-4 space-y-2">
            <p>Current user: {user?.email}</p>
            <p>User role: {user?.role}</p>
            <p>Church associations: {userChurches ? userChurches.length : 'Loading...'}</p>
            {userChurches && userChurches.map((uc: any, i: number) => (
              <p key={i}>Church {i+1}: {uc.name} ({uc.role})</p>
            ))}
          </div>
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