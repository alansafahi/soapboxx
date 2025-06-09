import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import EventsList from "@/components/events-list";

export default function Events() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
            <p className="text-gray-600">Discover upcoming events and activities in your community</p>
          </div>
          
          <EventsList />
        </div>
      </main>
    </div>
  );
}