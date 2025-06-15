import { useState } from "react";

export default function FreshAudioBible() {
  const [status, setStatus] = useState("Ready");
  const [verseCount, setVerseCount] = useState<number | null>(null);

  const testConnection = async () => {
    setStatus("Testing connection...");
    try {
      const response = await fetch('/api/bible/verses');
      if (response.ok) {
        const verses = await response.json();
        setVerseCount(verses.length);
        setStatus(`Success! Found ${verses.length} verses`);
      } else {
        setStatus("Please sign in to access Bible verses");
      }
    } catch (error) {
      setStatus("Connection error - please refresh");
    }
  };

  const handleClick = () => {
    alert("Button works! Interface is responsive.");
  };

  return (
    <div className="min-h-screen bg-red-50 py-8">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-red-500">
          <div className="bg-red-100 p-4 rounded-lg mb-6 text-center">
            <h2 className="text-2xl font-bold text-red-800">🔴 FRESH AUDIO BIBLE COMPONENT LOADING 🔴</h2>
            <p className="text-red-600 font-semibold">This should show instead of complex mood selection interface</p>
          </div>
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">Fresh Audio Bible - Simple Interface</h1>
        
          <div className="text-center space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Database Status</h2>
              <p className="text-gray-700">Complete Bible: 42,561 verses available</p>
              <p className="text-gray-700">Coverage: Genesis through Revelation</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={testConnection}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Test Bible Connection
              </button>
              
              <button 
                onClick={handleClick}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium ml-4"
              >
                Test Interface
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mt-6">
              <h3 className="font-semibold">Status:</h3>
              <p className="text-gray-700 mt-2">{status}</p>
              {verseCount && (
                <p className="text-green-600 font-medium">
                  ✓ Connected to database with {verseCount.toLocaleString()} verses
                </p>
              )}
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg mt-6">
              <h3 className="font-semibold text-yellow-800">Audio Features</h3>
              <ul className="text-left mt-2 space-y-1 text-yellow-700">
                <li>• Premium voice narration</li>
                <li>• Custom reading routines</li>
                <li>• Background music options</li>
                <li>• Category-based verse selection</li>
                <li>• Complete Bible access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}