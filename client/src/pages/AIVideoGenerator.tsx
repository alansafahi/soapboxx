import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { 
  Sparkles, 
  Video, 
  Clock, 
  Users, 
  Palette, 
  Mic,
  BookOpen,
  Play,
  Download,
  Wand2,
  FileVideo,
  Settings,
  Zap
} from "lucide-react";

interface GenerationRequest {
  type: string;
  topic: string;
  bibleVerse: string;
  duration: number;
  voicePersona: string;
  visualStyle: string;
  targetAudience: string;
  seriesCount?: number;
  generateSeries: boolean;
}

export default function AIVideoGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [request, setRequest] = useState<GenerationRequest>({
    type: 'devotional',
    topic: '',
    bibleVerse: '',
    duration: 180,
    voicePersona: 'pastor-david',
    visualStyle: 'modern',
    targetAudience: 'general',
    seriesCount: 4,
    generateSeries: false,
  });

  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // AI video generation mutation
  const generateVideoMutation = useMutation({
    mutationFn: async (requestData: GenerationRequest) => {
      setIsGenerating(true);
      return await apiRequest('POST', '/api/videos/ai-generate', {
        ...requestData,
        churchId: 1, // Default church for demo
      });
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      setIsGenerating(false);
      toast({
        title: "Success",
        description: request.generateSeries 
          ? `Generated ${request.seriesCount} video series successfully`
          : "Video content generated successfully",
      });
    },
    onError: (error: any) => {
      setIsGenerating(false);
      toast({
        title: "Error",
        description: error.message || "Failed to generate video content",
        variant: "destructive",
      });
    },
  });

  // Create video from generated content
  const createVideoMutation = useMutation({
    mutationFn: async (content: any) => {
      return await apiRequest('POST', '/api/videos/ai-create', content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Success",
        description: "AI video created and added to library",
      });
      setGeneratedContent(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create video",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!request.topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic for your video",
        variant: "destructive",
      });
      return;
    }
    generateVideoMutation.mutate(request);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const voicePersonas = [
    { value: 'pastor-david', label: 'Pastor David - Warm & Authoritative', description: 'Deep, caring voice perfect for sermons' },
    { value: 'sister-maria', label: 'Sister Maria - Gentle & Nurturing', description: 'Soft, compassionate voice for devotionals' },
    { value: 'teacher-john', label: 'Teacher John - Clear & Educational', description: 'Clear, methodical voice for studies' },
    { value: 'evangelist-sarah', label: 'Evangelist Sarah - Inspiring & Energetic', description: 'Dynamic voice for testimonies' },
  ];

  const visualStyles = [
    { value: 'modern', label: 'Modern', description: 'Clean, contemporary design' },
    { value: 'traditional', label: 'Traditional', description: 'Classic church aesthetics' },
    { value: 'minimalist', label: 'Minimalist', description: 'Simple, clean design' },
    { value: 'artistic', label: 'Artistic', description: 'Creative, expressive visuals' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              AI Video Generator
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Create inspiring spiritual content with artificial intelligence
          </p>
          <Badge variant="outline" className="mt-2">
            <Zap className="h-3 w-3 mr-1" />
            Phase 2: AI Visual Content
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Content Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content Type */}
              <div>
                <Label htmlFor="type">Content Type</Label>
                <Select 
                  value={request.type} 
                  onValueChange={(value) => setRequest(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="devotional">Daily Devotional</SelectItem>
                    <SelectItem value="sermon">Sermon Message</SelectItem>
                    <SelectItem value="study">Bible Study</SelectItem>
                    <SelectItem value="prayer">Prayer Guide</SelectItem>
                    <SelectItem value="testimony">Testimony</SelectItem>
                    <SelectItem value="worship">Worship Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Topic */}
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Finding Hope in Difficult Times"
                  value={request.topic}
                  onChange={(e) => setRequest(prev => ({ ...prev, topic: e.target.value }))}
                />
              </div>

              {/* Bible Verse */}
              <div>
                <Label htmlFor="bibleVerse">Bible Verse (Optional)</Label>
                <Input
                  id="bibleVerse"
                  placeholder="e.g., Romans 8:28"
                  value={request.bibleVerse}
                  onChange={(e) => setRequest(prev => ({ ...prev, bibleVerse: e.target.value }))}
                />
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration">
                  Duration: {formatDuration(request.duration)}
                </Label>
                <Slider
                  value={[request.duration]}
                  onValueChange={([value]) => setRequest(prev => ({ ...prev, duration: value }))}
                  max={600}
                  min={60}
                  step={30}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>1:00</span>
                  <span>10:00</span>
                </div>
              </div>

              {/* Voice Persona */}
              <div>
                <Label htmlFor="voicePersona">Voice Persona</Label>
                <Select 
                  value={request.voicePersona} 
                  onValueChange={(value) => setRequest(prev => ({ ...prev, voicePersona: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice persona" />
                  </SelectTrigger>
                  <SelectContent>
                    {voicePersonas.map((persona) => (
                      <SelectItem key={persona.value} value={persona.value}>
                        <div>
                          <div className="font-medium">{persona.label}</div>
                          <div className="text-sm text-gray-500">{persona.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Visual Style */}
              <div>
                <Label htmlFor="visualStyle">Visual Style</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {visualStyles.map((style) => (
                    <Card
                      key={style.value}
                      className={`cursor-pointer border-2 transition-colors ${
                        request.visualStyle === style.value 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setRequest(prev => ({ ...prev, visualStyle: style.value }))}
                    >
                      <CardContent className="p-3">
                        <div className="text-sm font-medium">{style.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{style.description}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select 
                  value={request.targetAudience} 
                  onValueChange={(value) => setRequest(prev => ({ ...prev, targetAudience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youth">Youth (13-25)</SelectItem>
                    <SelectItem value="adults">Adults (26-55)</SelectItem>
                    <SelectItem value="seniors">Seniors (55+)</SelectItem>
                    <SelectItem value="families">Families</SelectItem>
                    <SelectItem value="general">General Audience</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Series Generation */}
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={request.generateSeries}
                    onCheckedChange={(checked) => setRequest(prev => ({ ...prev, generateSeries: checked }))}
                  />
                  <Label htmlFor="generateSeries">Generate Video Series</Label>
                </div>
                
                {request.generateSeries && (
                  <div className="mt-3">
                    <Label htmlFor="seriesCount">Number of Episodes</Label>
                    <Select 
                      value={request.seriesCount?.toString()} 
                      onValueChange={(value) => setRequest(prev => ({ ...prev, seriesCount: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select episode count" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Episodes</SelectItem>
                        <SelectItem value="4">4 Episodes</SelectItem>
                        <SelectItem value="5">5 Episodes</SelectItem>
                        <SelectItem value="6">6 Episodes</SelectItem>
                        <SelectItem value="8">8 Episodes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !request.topic.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating AI Content...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate {request.generateSeries ? 'Video Series' : 'Video'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview/Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="h-5 w-5 mr-2" />
                Generated Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Creating AI Content
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This may take a few moments...
                  </p>
                  <div className="mt-4">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="space-y-4">
                  {Array.isArray(generatedContent) ? (
                    // Series content
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Video Series Generated</h3>
                      <div className="space-y-3">
                        {generatedContent.map((episode: any, index: number) => (
                          <Card key={index} className="border">
                            <CardContent className="p-4">
                              <h4 className="font-medium text-sm">{episode.title}</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {episode.description}
                              </p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDuration(episode.estimatedDuration)}
                                <span className="mx-2">•</span>
                                <BookOpen className="h-3 w-3 mr-1" />
                                {episode.bibleReferences?.length || 0} verses
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Single video content
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{generatedContent.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {generatedContent.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-purple-600" />
                          <span className="text-sm">{formatDuration(generatedContent.estimatedDuration)}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-purple-600" />
                          <span className="text-sm capitalize">{request.targetAudience}</span>
                        </div>
                        <div className="flex items-center">
                          <Mic className="h-4 w-4 mr-2 text-purple-600" />
                          <span className="text-sm">{voicePersonas.find(p => p.value === request.voicePersona)?.label.split(' - ')[0]}</span>
                        </div>
                        <div className="flex items-center">
                          <Palette className="h-4 w-4 mr-2 text-purple-600" />
                          <span className="text-sm capitalize">{request.visualStyle}</span>
                        </div>
                      </div>

                      {generatedContent.bibleReferences && generatedContent.bibleReferences.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm mb-2">Bible References:</h4>
                          <div className="flex flex-wrap gap-2">
                            {generatedContent.bibleReferences.map((ref: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {ref}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {generatedContent.tags && generatedContent.tags.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm mb-2">Tags:</h4>
                          <div className="flex flex-wrap gap-2">
                            {generatedContent.tags.map((tag: string, index: number) => (
                              <Badge key={index} className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-sm mb-2">Script Preview:</h4>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-6">
                            {generatedContent.script}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button
                      onClick={() => createVideoMutation.mutate(generatedContent)}
                      disabled={createVideoMutation.isPending}
                      className="flex-1"
                    >
                      {createVideoMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <FileVideo className="h-4 w-4 mr-2" />
                      )}
                      Create Video
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setGeneratedContent(null)}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Ready to Create
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure your video settings and click generate to create AI-powered spiritual content
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}