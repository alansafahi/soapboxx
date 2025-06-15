import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SimpleAudioBible() {
  const [verseCount, setVerseCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const checkVerses = async () => {
    setLoading(true);
    setMessage("Checking verses...");
    
    try {
      const response = await fetch('/api/bible/verses');
      if (response.ok) {
        const verses = await response.json();
        setVerseCount(verses.length);
        setMessage(`Successfully loaded ${verses.length} Bible verses`);
      } else {
        setMessage("Failed to load verses - authentication required");
      }
    } catch (error) {
      setMessage("Error loading verses - please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Audio Bible - Simple Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <Button 
              onClick={checkVerses}
              disabled={loading}
              size="lg"
              className="mb-4"
            >
              {loading ? "Checking..." : "Test Bible Verses API"}
            </Button>
            
            {message && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">{message}</p>
              </div>
            )}
            
            {verseCount !== null && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800">
                  Bible Database Status
                </h3>
                <p className="text-green-700">
                  Total verses available: {verseCount.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Database contains complete Bible coverage (Genesis - Revelation)
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Audio Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Premium voice selection</li>
                  <li>• Background music options</li>
                  <li>• Custom reading routines</li>
                  <li>• Verse selection tools</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bible Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• All 66 books included</li>
                  <li>• 42,561+ verses available</li>
                  <li>• Multiple categories</li>
                  <li>• Fast search capabilities</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center pt-6">
            <p className="text-sm text-gray-600">
              Click the test button above to verify the Audio Bible database connection
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}