import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { Languages, Zap, BarChart3, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

interface TranslationStats {
  translationStats: Record<string, number>;
  totalLanguages: number;
  generatedAt: string;
}

interface TranslationResults {
  success: string[];
  failed: string[];
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'fa', name: 'Farsi/Persian', flag: '🇮🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
];

export default function AITranslationAdmin() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [results, setResults] = useState<TranslationResults | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch translation statistics
  const { data: stats, isLoading: statsLoading } = useQuery<TranslationStats>({
    queryKey: ['/api/translations/stats'],
    refetchInterval: 5000 // Refresh every 5 seconds during translation
  });

  // Translate all languages
  const translateAllMutation = useMutation({
    mutationFn: () => apiRequest('/api/translations/ai-translate-all', {
      method: 'POST'
    }),
    onSuccess: (data) => {
      setResults(data.results);
      setIsTranslating(false);
      setTranslationProgress(100);
      setCurrentLanguage('');
      queryClient.invalidateQueries({ queryKey: ['/api/translations/stats'] });
      toast({
        title: "AI Translation Completed",
        description: `Successfully translated to ${data.results.success.length} languages`,
      });
    },
    onError: (error: any) => {
      setIsTranslating(false);
      setTranslationProgress(0);
      setCurrentLanguage('');
      toast({
        title: "Translation Failed",
        description: error.message || "Failed to complete AI translation",
        variant: "destructive"
      });
    }
  });

  // Translate single language
  const translateSingleMutation = useMutation({
    mutationFn: (language: string) => apiRequest(`/api/translations/ai-translate/${language}`, {
      method: 'POST'
    }),
    onSuccess: (data, language) => {
      queryClient.invalidateQueries({ queryKey: ['/api/translations/stats'] });
      toast({
        title: "Translation Completed",
        description: `Successfully translated ${data.translationCount} keys to ${data.language}`,
      });
    },
    onError: (error: any, language) => {
      toast({
        title: "Translation Failed",
        description: `Failed to translate to ${language}: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleTranslateAll = async () => {
    setIsTranslating(true);
    setTranslationProgress(0);
    setResults(null);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setTranslationProgress(prev => {
        if (prev < 90) return prev + 10;
        return prev;
      });
    }, 2000);

    // Update current language simulation
    const languageInterval = setInterval(() => {
      const randomLang = SUPPORTED_LANGUAGES[Math.floor(Math.random() * SUPPORTED_LANGUAGES.length)];
      setCurrentLanguage(randomLang.name);
    }, 3000);

    try {
      await translateAllMutation.mutateAsync();
    } finally {
      clearInterval(progressInterval);
      clearInterval(languageInterval);
    }
  };

  const handleTranslateSingle = (languageCode: string) => {
    translateSingleMutation.mutate(languageCode);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Languages className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">AI Translation Admin</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Automatically translate all interface elements across 11 languages using OpenAI API. 
          This includes buttons, labels, titles, headlines, tooltips, menus, and content.
        </p>
      </div>

      {/* Translation Progress */}
      {isTranslating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>AI Translation in Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Translating: {currentLanguage}</span>
                <span>{translationProgress}%</span>
              </div>
              <Progress value={translationProgress} className="w-full" />
            </div>
            <p className="text-sm text-gray-500">
              This may take 2-5 minutes depending on the number of translations...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Translation Results:</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-green-600">Successful ({results.success.length}):</p>
                  <ul className="text-xs space-y-1">
                    {results.success.map((lang, index) => (
                      <li key={index} className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{lang}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {results.failed.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-600">Failed ({results.failed.length}):</p>
                    <ul className="text-xs space-y-1">
                      {results.failed.map((lang, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <AlertCircle className="h-3 w-3 text-red-500" />
                          <span>{lang}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Translate All */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <span>Translate All Languages</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Automatically translate all interface elements to all 10 supported languages using OpenAI API.
              This will translate buttons, labels, titles, headlines, tooltips, menus, and content.
            </p>
            <Button 
              onClick={handleTranslateAll}
              disabled={isTranslating || translateAllMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isTranslating ? (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Translating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Start AI Translation</span>
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Translation Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Translation Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 animate-spin" />
                <span>Loading statistics...</span>
              </div>
            ) : stats ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(stats.translationStats).map(([lang, count]) => {
                    const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === lang);
                    return (
                      <div key={lang} className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                          <span>{langInfo?.flag}</span>
                          <span>{langInfo?.name}</span>
                        </span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(stats.generatedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No statistics available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Individual Language Translation */}
      <Card>
        <CardHeader>
          <CardTitle>Translate Individual Languages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {SUPPORTED_LANGUAGES.filter(lang => lang.code !== 'en').map((lang) => (
              <Button
                key={lang.code}
                variant="outline"
                size="sm"
                onClick={() => handleTranslateSingle(lang.code)}
                disabled={translateSingleMutation.isPending}
                className="flex items-center space-x-2"
              >
                <span>{lang.flag}</span>
                <span className="text-xs">{lang.name}</span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Click on individual languages to translate only that language using OpenAI API
          </p>
        </CardContent>
      </Card>

      {/* Features Covered */}
      <Card>
        <CardHeader>
          <CardTitle>Translation Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <h4 className="font-medium">Navigation</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Menu items</li>
                <li>• Section headers</li>
                <li>• Breadcrumbs</li>
                <li>• Page titles</li>
              </ul>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Interface</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Buttons & labels</li>
                <li>• Form fields</li>
                <li>• Placeholders</li>
                <li>• Tooltips</li>
              </ul>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Content</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Post templates</li>
                <li>• Comments</li>
                <li>• Status messages</li>
                <li>• Notifications</li>
              </ul>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Features</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Prayer Wall</li>
                <li>• Donations</li>
                <li>• Mood Check-in</li>
                <li>• Settings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}