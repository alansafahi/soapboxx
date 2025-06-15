import { useState, useEffect } from "react";

interface BibleVerse {
  id: number;
  reference: string;
  text: string;
  category: string;
}

export default function WorkingAudioBible() {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerse, setCurrentVerse] = useState<BibleVerse | null>(null);

  useEffect(() => {
    loadVerses();
  }, []);

  const loadVerses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bible/verses');
      if (response.ok) {
        const data = await response.json();
        setVerses(data);
        setError(null);
      } else {
        setError("Please sign in to access the complete Bible verse library");
      }
    } catch (err) {
      setError("Connection issue - please try again");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", "faith", "hope", "love", "peace", "strength", "wisdom", "comfort"];

  const filteredVerses = selectedCategory === "all" 
    ? verses 
    : verses.filter(v => v.category === selectedCategory);

  const startAudioReading = (verse: BibleVerse) => {
    setCurrentVerse(verse);
    setIsPlaying(true);
    
    // Use Web Speech API for audio
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`${verse.reference}. ${verse.text}`);
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      
      utterance.onend = () => {
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

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Loading Audio Bible...</h2>
        <p>Connecting to Bible verse database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Audio Bible</h2>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#eff6ff', 
          borderRadius: '8px', 
          border: '1px solid #3b82f6',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#1e40af', margin: 0 }}>{error}</p>
        </div>
        <button 
          onClick={loadVerses}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Audio Bible Experience</h1>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>
          {verses.length.toLocaleString()} verses available • Complete Bible coverage
        </p>
      </div>

      {/* Audio Controls */}
      {currentVerse && (
        <div style={{
          padding: '20px',
          backgroundColor: '#1e40af',
          color: 'white',
          borderRadius: '12px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Now Playing</h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '18px' }}>{currentVerse.reference}</p>
          <p style={{ margin: '0 0 20px 0', fontStyle: 'italic' }}>{currentVerse.text}</p>
          <button 
            onClick={stopAudio}
            style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              color: '#1e40af',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Stop Audio
          </button>
        </div>
      )}

      {/* Category Filter */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h3>Select Category</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedCategory === category ? '#3b82f6' : '#f3f4f6',
                color: selectedCategory === category ? 'white' : '#374151',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {category} {category !== "all" && `(${verses.filter(v => v.category === category).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Verse Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredVerses.slice(0, 12).map(verse => (
          <div
            key={verse.id}
            style={{
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: currentVerse?.id === verse.id ? '2px solid #3b82f6' : '1px solid #e5e7eb'
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>{verse.reference}</h4>
              <span style={{
                padding: '4px 8px',
                backgroundColor: '#f3f4f6',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#6b7280',
                textTransform: 'capitalize'
              }}>
                {verse.category}
              </span>
            </div>
            <p style={{ 
              margin: '0 0 15px 0', 
              lineHeight: '1.6', 
              color: '#374151',
              fontSize: '15px'
            }}>
              {verse.text}
            </p>
            <button
              onClick={() => startAudioReading(verse)}
              disabled={isPlaying}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: isPlaying && currentVerse?.id === verse.id ? '#ef4444' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isPlaying ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {isPlaying && currentVerse?.id === verse.id ? 'Playing...' : 'Play Audio'}
            </button>
          </div>
        ))}
      </div>

      {filteredVerses.length > 12 && (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ color: '#6b7280' }}>
            Showing 12 of {filteredVerses.length} verses • 
            <button 
              onClick={loadVerses}
              style={{
                marginLeft: '10px',
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Load More
            </button>
          </p>
        </div>
      )}
    </div>
  );
}