import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Messages() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to chat page since they serve the same purpose
  useEffect(() => {
    setLocation("/chat");
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
            <p className="text-gray-600">Redirecting to chat...</p>
          </div>
        </div>
      </main>
    </div>
  );
}