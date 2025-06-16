import { useState, useEffect, useRef } from 'react';

interface ScriptureExpandedTextProps {
  text: string;
  className?: string;
}

export function ScriptureExpandedText({ text, className = "" }: ScriptureExpandedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const processedRefsRef = useRef<Set<string>>(new Set());
  const isProcessingRef = useRef(false);

  // Scripture reference detection pattern
  const detectScriptureReferences = (text: string): string[] => {
    const pattern = /(?:(?:1st|2nd|3rd|1|2|3|I|II|III)\s+)?(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1\s*Samuel|2\s*Samuel|1\s*Kings|2\s*Kings|1\s*Chronicles|2\s*Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song\s+of\s+Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1\s*Corinthians|2\s*Corinthians|Galatians|Ephesians|Philippians|Colossians|1\s*Thessalonians|2\s*Thessalonians|1\s*Timothy|2\s*Timothy|Titus|Philemon|Hebrews|James|1\s*Peter|2\s*Peter|1\s*John|2\s*John|3\s*John|Jude|Revelation)\s+\d+:\d+(?:-\d+)?/gi;
    
    const matches = text.match(pattern) || [];
    return Array.from(new Set(matches));
  };

  // Lookup single verse
  const lookupVerse = async (reference: string): Promise<void> => {
    if (processedRefsRef.current.has(reference) || isProcessingRef.current) {
      return;
    }

    try {
      processedRefsRef.current.add(reference);
      
      const response = await fetch("/api/bible/lookup-verse", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reference: reference.trim() })
      });
      
      if (!response.ok) {
        return;
      }
      
      const data = await response.json();
      const verseText = data.verse?.text || data.text;
      const verseRef = data.verse?.reference || data.reference || reference;
      
      if (verseText) {
        setDisplayText(prev => {
          // Only replace if not already expanded
          if (!prev.includes(`${reference} - "`)) {
            return prev.replace(
              new RegExp(`\\b${reference.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'),
              `${verseRef} - "${verseText}"`
            );
          }
          return prev;
        });
      }
    } catch (error) {
      // Silently fail for display text
    }
  };

  // Process scripture references only once on mount
  useEffect(() => {
    if (isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    
    const references = detectScriptureReferences(text);
    const newReferences = references.filter(ref => 
      !processedRefsRef.current.has(ref) && 
      !text.includes(`${ref} - "`)
    );
    
    // Process references sequentially to avoid overwhelming the API
    if (newReferences.length > 0) {
      newReferences.forEach((ref, index) => {
        setTimeout(() => {
          lookupVerse(ref);
        }, index * 100); // Stagger requests by 100ms
      });
    }
    
    isProcessingRef.current = false;
  }, [text]);

  // Reset when text changes
  useEffect(() => {
    setDisplayText(text);
    processedRefsRef.current.clear();
    isProcessingRef.current = false;
  }, [text]);

  return (
    <div className={className}>
      {displayText}
    </div>
  );
}