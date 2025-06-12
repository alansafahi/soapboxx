import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Palette, 
  Download, 
  Share2, 
  Sparkles, 
  Image as ImageIcon,
  RefreshCw,
  Heart,
  Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VerseArtData {
  imageUrl: string;
  verseReference: string;
  verseText: string;
  backgroundTheme: string;
  fontStyle: string;
  colorScheme: string;
}

const BACKGROUND_THEMES = [
  { value: 'sunset', label: 'Golden Sunset', description: 'Warm, peaceful evening sky' },
  { value: 'mountains', label: 'Majestic Mountains', description: 'Inspiring mountain landscape' },
  { value: 'ocean', label: 'Calm Ocean', description: 'Serene ocean waves' },
  { value: 'forest', label: 'Peaceful Forest', description: 'Quiet woodland setting' },
  { value: 'flowers', label: 'Garden Flowers', description: 'Beautiful blooming garden' },
  { value: 'abstract', label: 'Abstract Art', description: 'Modern artistic background' },
  { value: 'watercolor', label: 'Watercolor', description: 'Soft painted texture' },
  { value: 'minimalist', label: 'Minimalist', description: 'Clean, simple design' },
  { value: 'stained-glass', label: 'Stained Glass', description: 'Church window style' },
  { value: 'cross', label: 'Sacred Cross', description: 'Christian symbol focus' }
];

const FONT_STYLES = [
  { value: 'elegant', label: 'Elegant Script' },
  { value: 'bold', label: 'Bold Modern' },
  { value: 'classic', label: 'Classic Serif' },
  { value: 'handwritten', label: 'Handwritten' },
  { value: 'calligraphy', label: 'Calligraphy' }
];

const COLOR_SCHEMES = [
  { value: 'warm', label: 'Warm Gold' },
  { value: 'cool', label: 'Cool Blue' },
  { value: 'earth', label: 'Earth Tones' },
  { value: 'monochrome', label: 'Black & White' },
  { value: 'soft', label: 'Soft Pastels' }
];

interface VerseArtGeneratorProps {
  currentVerse?: {
    text: string;
    reference: string;
  };
}

export default function VerseArtGenerator({ currentVerse }: VerseArtGeneratorProps) {
  const { toast } = useToast();
  const downloadRef = useRef<HTMLAnchorElement>(null);
  
  const [verseReference, setVerseReference] = useState(currentVerse?.reference || '');
  const [verseText, setVerseText] = useState(currentVerse?.text || '');
  const [backgroundTheme, setBackgroundTheme] = useState('sunset');
  const [fontStyle, setFontStyle] = useState('elegant');
  const [colorScheme, setColorScheme] = useState('warm');
  const [generatedArt, setGeneratedArt] = useState<VerseArtData | null>(null);

  // Generate verse art mutation
  const generateArtMutation = useMutation({
    mutationFn: async (data: {
      verseText: string;
      verseReference: string;
      backgroundTheme: string;
      fontStyle: string;
      colorScheme: string;
    }) => {
      const response = await fetch("/api/bible/generate-verse-art", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate verse art');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      setGeneratedArt(data);
      toast({
        title: "Verse Art Generated",
        description: "Your beautiful verse art is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate verse art. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateArt = () => {
    if (!verseText.trim() || !verseReference.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both verse text and reference.",
        variant: "destructive",
      });
      return;
    }

    generateArtMutation.mutate({
      verseText: verseText.trim(),
      verseReference: verseReference.trim(),
      backgroundTheme,
      fontStyle,
      colorScheme
    });
  };

  const handleDownload = async () => {
    if (!generatedArt?.imageUrl) return;

    try {
      // Use proxy endpoint to handle CORS issues
      const response = await fetch(`/api/bible/download-verse-art`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: generatedArt.imageUrl })
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      if (downloadRef.current) {
        downloadRef.current.href = url;
        downloadRef.current.download = `verse-art-${generatedArt.verseReference.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
        downloadRef.current.click();
      }
      
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: "Verse art saved to your device.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (!generatedArt) return;

    const shareText = `${generatedArt.verseReference} 🙏 #SoapBoxApp`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Bible Verse Art',
        text: shareText,
        url: generatedArt.imageUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText} ${generatedArt.imageUrl}`);
      toast({
        title: "Link Copied",
        description: "Verse art link copied to clipboard for sharing.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Palette className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Verse Art Generator</h2>
          <Sparkles className="h-6 w-6 text-purple-600" />
        </div>
        <p className="text-gray-600">Transform Bible verses into beautiful, shareable artwork</p>
      </motion.div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Create Your Verse Art
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Verse Input */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Bible Verse Reference
              </label>
              <Input
                value={verseReference}
                onChange={(e) => setVerseReference(e.target.value)}
                placeholder="e.g., John 3:16, Psalm 23:1"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Verse Text
              </label>
              <textarea
                value={verseText}
                onChange={(e) => setVerseText(e.target.value)}
                placeholder="Enter the full verse text..."
                className="w-full min-h-20 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {verseText.length}/500 characters
              </p>
            </div>
          </div>

          {/* Style Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Background Theme
              </label>
              <Select value={backgroundTheme} onValueChange={setBackgroundTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BACKGROUND_THEMES.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      <div>
                        <div className="font-medium">{theme.label}</div>
                        <div className="text-xs text-gray-500">{theme.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Font Style
              </label>
              <Select value={fontStyle} onValueChange={setFontStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_STYLES.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Color Scheme
              </label>
              <Select value={colorScheme} onValueChange={setColorScheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_SCHEMES.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      {color.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateArt}
            disabled={generateArtMutation.isPending || !verseText.trim() || !verseReference.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
            size="lg"
          >
            {generateArtMutation.isPending ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Generating Beautiful Art...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Verse Art
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Art Display */}
      <AnimatePresence>
        {generatedArt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-purple-600" />
                    Your Verse Art
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{generatedArt.backgroundTheme}</Badge>
                    <Badge variant="secondary">{generatedArt.fontStyle}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Art Preview */}
                <div className="relative rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={generatedArt.imageUrl}
                    alt={`Verse art for ${generatedArt.verseReference}`}
                    className="w-full h-auto max-h-96 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-black/50 text-white">
                      {generatedArt.verseReference}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  
                  <Button
                    onClick={handleGenerateArt}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                  </Button>
                </div>

                {/* Verse Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{generatedArt.verseReference}</h4>
                  <p className="text-gray-700 italic">"{generatedArt.verseText}"</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden download link */}
      <a ref={downloadRef} style={{ display: 'none' }} />

      {/* Tips Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Tips for Beautiful Verse Art</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Choose shorter verses for better readability</li>
                <li>• Warm colors work great with inspirational verses</li>
                <li>• Cool colors suit peaceful and calming passages</li>
                <li>• Stained glass backgrounds are perfect for worship verses</li>
                <li>• Try different combinations to find your perfect style</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}