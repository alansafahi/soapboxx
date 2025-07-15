import { useAuth } from "../hooks/useAuth";
import MyChurches from "../components/MyChurches";
import EnhancedChurchDiscovery from "../components/enhanced-church-discovery";

export default function Churches() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* My Churches Section */}
          <MyChurches />
          
          {/* Church Discovery Section */}
          <div className="space-y-4">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Discover More Churches
              </h2>
            </div>
            <EnhancedChurchDiscovery />
          </div>
        </div>
      </main>
    </div>
  );
}