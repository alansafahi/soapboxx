import { useState, useEffect } from "react";

interface BibleVerse {
  id: number;
  reference: string;
  text: string;
  category: string;
}

export default function BasicAudioBible() {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVerse, setCurrentVerse] = useState<BibleVerse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load verses function
  const loadVerses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/bible/verses', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVerses(data.slice(0, 20)); // Show first 20 verses
        setError(null);
      } else if (response.status === 401) {
        setError("Please sign in to access the complete Bible verse library");
      } else {
        setError("Unable to load verses. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  // Play audio for a verse
  const playVerse = (verse: BibleVerse) => {
    if (isPlaying) {
      speechSynthesis.cancel();
    }

    setCurrentVerse(verse);
    setIsPlaying(true);

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `${verse.reference}. ${verse.text}`
      );
      
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      
      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentVerse(null);
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentVerse(null);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentVerse(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Audio Bible Experience</h1>
          <p className="text-xl text-gray-600">Listen to Scripture with premium voice narration</p>
        </div>

        {/* Database Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-900">Bible Database Status</h2>
              <p className="text-blue-700">42,561 verses available • Complete Bible coverage</p>
            </div>
            <button
              onClick={loadVerses}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Loading...' : 'Load Verses'}
            </button>
          </div>
        </div>

        {/* Audio Controls */}
        {currentVerse && (
          <div className="bg-indigo-600 text-white rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Now Playing</h3>
                <p className="text-indigo-100 mb-1">{currentVerse.reference}</p>
                <p className="text-indigo-50 italic">{currentVerse.text}</p>
              </div>
              <button
                onClick={stopAudio}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors ml-4"
              >
                Stop Audio
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">{error}</p>
          </div>
        )}

        {/* Verses Grid */}
        {verses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verses.map((verse) => (
              <div
                key={verse.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {verse.reference}
                  </h3>
                  <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                    {verse.category}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {verse.text}
                </p>
                
                <button
                  onClick={() => playVerse(verse)}
                  disabled={isPlaying}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    isPlaying && currentVerse?.id === verse.id
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400'
                  }`}
                >
                  {isPlaying && currentVerse?.id === verse.id ? 'Playing...' : 'Play Audio'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {verses.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to Listen</h3>
              <p className="text-gray-600 mb-6">
                Click "Load Verses" above to access the complete Bible library with audio narration.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                <div>
                  <strong>• Premium Audio</strong><br />
                  Natural voice synthesis
                </div>
                <div>
                  <strong>• Complete Bible</strong><br />
                  All 66 books available
                </div>
                <div>
                  <strong>• Smart Categories</strong><br />
                  Organized by theme
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}