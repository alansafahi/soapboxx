import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';

interface ScriptureExpandedTextProps {
  text: string;
  className?: string;
}

export function ScriptureExpandedText({ text, className = "" }: ScriptureExpandedTextProps) {
  const [expandedText, setExpandedText] = useState(text);
  const [processedRefs, setProcessedRefs] = useState<string[]>([]);

  // Scripture reference detection pattern
  const detectScriptureReferences = useCallback((text: string): string[] => {
    const pattern = /(?:(?:1st|2nd|3rd|1|2|3|I|II|III)\s+)?(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1\s*Samuel|2\s*Samuel|1\s*Kings|2\s*Kings|1\s*Chronicles|2\s*Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song\s+of\s+Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1\s*Corinthians|2\s*Corinthians|Galatians|Ephesians|Philippians|Colossians|1\s*Thessalonians|2\s*Thessalonians|1\s*Timothy|2\s*Timothy|Titus|Philemon|Hebrews|James|1\s*Peter|2\s*Peter|1\s*John|2\s*John|3\s*John|Jude|Revelation)\s+\d+:\d+(?:-\d+)?/gi;
    
    const matches = text.match(pattern) || [];
    // Remove duplicates using Array.from and Set
    return Array.from(new Set(matches));
  }, []);

  // Verse lookup mutation
  const verseLookupMutation = useMutation({
    mutationFn: async (reference: string) => {
      const response = await fetch("/api/bible/lookup-verse", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reference: reference.trim() })
      });
      
      if (!response.ok) {
        throw new Error('Failed to lookup verse');
      }
      
      return await response.json();
    },
    onSuccess: (data, reference) => {
      // Handle the correct response structure
      const verseText = data.verse?.text || data.text;
      const verseRef = data.verse?.reference || data.reference || reference;
      
      if (verseText) {
        setExpandedText(prev => {
          // Only replace if not already expanded
          if (!prev.includes(`${reference} - "`)) {
            return prev.replace(
              new RegExp(`\\b${reference.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'),
              `${verseRef} - "${verseText}"`
            );
          }
          return prev;
        });
        
        setProcessedRefs(prev => [...prev, reference]);
      }
    },
    onError: (error: any, reference: string) => {
      // Silently fail for display text - don't show error toasts
      setProcessedRefs(prev => [...prev, reference]);
    },
  });

  // Auto-detect and process scripture references on mount and text changes
  useEffect(() => {
    const references = detectScriptureReferences(text);
    const newReferences = references.filter(ref => 
      !processedRefs.includes(ref) && 
      !expandedText.includes(`${ref} - "`) // Don't process already expanded references
    );
    
    if (newReferences.length > 0) {
      // Process each reference
      newReferences.forEach(ref => {
        if (!processedRefs.includes(ref)) {
          verseLookupMutation.mutate(ref);
        }
      });
    }
  }, [text, processedRefs, expandedText, detectScriptureReferences, verseLookupMutation]);

  return (
    <div className={className}>
      {expandedText}
    </div>
  );
}