import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BibleVerse {
  id: number;
  reference: string;
  text: string;
  book: string;
  category: string;
}

export default function AudioBibleMinimal() {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch verses directly with fetch API
  useEffect(() => {
    const fetchVerses = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/bible/verses');
        
        if (!response.ok) {
          throw new Error('Failed to fetch verses');
        }
        
        const data = await response.json();
        setVerses(data);
        console.log(`Loaded ${data.length} verses successfully`);
      } catch (err: any) {
        setError(err.message || 'Failed to load verses');
        console.error('Error fetching verses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVerses();
  }, []);

  const toggleVerse = (verseId: number) => {
    setSelectedVerses(prev => 
      prev.includes(verseId) 
        ? prev.filter(id => id !== verseId)
        : [...prev, verseId]
    );
  };

  const generateRoutine = () => {
    if (selectedVerses.length === 0) {
      alert('Please select at least one verse');
      return;
    }
    
    alert(`Creating audio routine with ${selectedVerses.length} verses`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Audio Bible</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading Bible verses...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Audio Bible</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Audio Bible - Custom Routine Builder</CardTitle>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Badge variant="outline">Found {verses.length} verses</Badge>
            <Badge variant="outline">{selectedVerses.length}/10 selected</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Button 
              onClick={generateRoutine}
              disabled={selectedVerses.length === 0}
              className="w-full"
            >
              Generate Audio Routine ({selectedVerses.length} verses)
            </Button>
          </div>

          <div className="grid gap-2 max-h-96 overflow-y-auto">
            {verses.slice(0, 50).map((verse) => (
              <div
                key={verse.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedVerses.includes(verse.id)
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleVerse(verse.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{verse.reference}</div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {verse.text}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {verse.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {verses.length > 50 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Showing first 50 of {verses.length} verses
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}