import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Loader2 } from "lucide-react";

interface SmartScriptureTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  maxLength?: number;
  disabled?: boolean;
  label?: string;
  helpText?: string;
}

export default function SmartScriptureTextarea({
  value,
  onChange,
  placeholder = "Type your message...",
  className = "",
  minHeight = "min-h-20",
  maxLength,
  disabled = false,
  label,
  helpText
}: SmartScriptureTextareaProps) {
  const { toast } = useToast();
  const [detectedReferences, setDetectedReferences] = useState<string[]>([]);
  const [lastProcessedValue, setLastProcessedValue] = useState("");

  // Function to detect scripture references in text
  const detectScriptureReferences = (text: string): string[] => {
    // Pattern matches: John 3:16, 1 John 3:16, 1st John 3:16, I John 3:16, etc.
    const scripturePattern = /((?:1st?|2nd?|3rd?|I{1,3}|1|2|3)?\s*[A-Za-z]+\s+\d+:\d+(?:-\d+)?)/g;
    const matches = text.match(scripturePattern) || [];
    return [...new Set(matches)]; // Remove duplicates
  };

  // Verse lookup mutation
  const verseLookupMutation = useMutation({
    mutationFn: async (reference: string) => {
      const response = await fetch("/api/bible/lookup-verse", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference: reference.trim() })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to lookup verse');
      }
      
      return await response.json();
    },
    onSuccess: (data, reference) => {
      // Handle the correct response structure
      const verseText = data.verse?.text || data.text;
      const verseRef = data.verse?.reference || data.reference || reference;
      
      if (verseText) {
        // Replace the reference with "reference - verse text" in the textarea
        const updatedText = value.replace(
          new RegExp(`\\b${reference.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'),
          `${verseRef} - "${verseText}"`
        );
        onChange(updatedText);
        
        toast({
          title: "Scripture Found",
          description: `Auto-populated verse text for ${verseRef}`,
          duration: 3000,
        });
      } else {
        toast({
          title: "Verse Not Found",
          description: `Could not find ${reference}. You can continue typing manually.`,
          variant: "destructive",
          duration: 3000,
        });
      }
    },
    onError: (error: any, reference) => {
      toast({
        title: "Verse Not Found",
        description: `Could not find ${reference}. You can continue typing manually.`,
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  // Auto-detect and process scripture references
  useEffect(() => {
    if (value !== lastProcessedValue && value.length > lastProcessedValue.length) {
      const references = detectScriptureReferences(value);
      const newReferences = references.filter(ref => 
        !detectedReferences.includes(ref) && 
        !value.includes(`${ref} - "`) // Don't process already expanded references
      );
      
      if (newReferences.length > 0) {
        setDetectedReferences(prev => [...prev, ...newReferences]);
        // Auto-lookup the first new reference
        verseLookupMutation.mutate(newReferences[0]);
      }
      
      setLastProcessedValue(value);
    }
  }, [value, lastProcessedValue, detectedReferences, verseLookupMutation]);

  const handleExpandReference = (reference: string) => {
    verseLookupMutation.mutate(reference);
  };

  const remainingReferences = detectedReferences.filter(ref => 
    value.includes(ref) && !value.includes(`${ref} - "`)
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 block">
          {label}
        </label>
      )}
      
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${className} ${minHeight} resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          maxLength={maxLength}
          disabled={disabled || verseLookupMutation.isPending}
        />
        
        {verseLookupMutation.isPending && (
          <div className="absolute right-3 top-3">
            <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
          </div>
        )}
      </div>

      {/* Show remaining unexpanded references */}
      {remainingReferences.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs text-gray-600">Scripture references found:</span>
          {remainingReferences.map((reference) => (
            <Button
              key={reference}
              variant="outline"
              size="sm"
              onClick={() => handleExpandReference(reference)}
              disabled={verseLookupMutation.isPending}
              className="text-xs h-6 px-2 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <BookOpen className="h-3 w-3 mr-1" />
              {reference}
            </Button>
          ))}
        </div>
      )}

      {helpText && (
        <p className="text-xs text-gray-500">
          {helpText}
        </p>
      )}
      
      {maxLength && (
        <p className="text-xs text-gray-500">
          {value.length}/{maxLength} characters
        </p>
      )}
      
      <p className="text-xs text-gray-500">
        Type scripture references like "John 3:16" to auto-populate verse text
      </p>
    </div>
  );
}