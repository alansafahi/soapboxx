import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import ChurchDiscovery from "@/components/church-discovery";

export default function Churches() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Churches</h1>
            <p className="text-gray-600">Discover and connect with churches in your area</p>
          </div>
          
          <ChurchDiscovery />
        </div>
      </main>
    </div>
  );
}