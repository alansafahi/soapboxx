import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import PrayerRequests from "@/components/prayer-requests";

export default function Prayer() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Prayer</h1>
            <p className="text-gray-600">Share prayer requests and pray with your community</p>
          </div>
          
          <PrayerRequests />
        </div>
      </main>
    </div>
  );
}