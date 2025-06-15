import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import BasicAudioBible from "@/pages/BasicAudioBible";

function AppMinimal() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">SoapBox Audio Bible</h1>
            <nav className="space-x-4">
              <a href="/audio-bible" className="text-blue-600 hover:text-blue-800 font-medium">
                Audio Bible
              </a>
            </nav>
          </div>
        </div>
      </div>
      
      <main>
        <Switch>
          <Route path="/audio-bible" component={BasicAudioBible} />
          <Route path="/" component={BasicAudioBible} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <Toaster />
    </div>
  );
}

export default AppMinimal;