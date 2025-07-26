import { useAuth } from "../hooks/useAuth";
import MyCommunities from "../components/MyCommunities";
import EnhancedCommunityDiscovery from "../components/enhanced-community-discovery";

export default function Communities() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* My Communities Section */}
          <MyCommunities />
          
          {/* Community Discovery Section */}
          <div className="space-y-4" id="community-discovery">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Discover More Communities
              </h2>
            </div>
            <EnhancedCommunityDiscovery />
          </div>
        </div>
      </main>
    </div>
  );
}