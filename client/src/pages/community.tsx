import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import CommunityFeed from "@/components/community-feed";

export default function Community() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Community</h1>
            <p className="text-gray-600">Connect and engage with your faith community</p>
          </div>
          
          <CommunityFeed />
        </div>
      </main>
    </div>
  );
}