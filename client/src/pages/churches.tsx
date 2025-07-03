import { useAuth } from "../hooks/useAuth";
import EnhancedChurchDiscovery from "../components/enhanced-church-discovery";

export default function Churches() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <EnhancedChurchDiscovery />
        </div>
      </main>
    </div>
  );
}