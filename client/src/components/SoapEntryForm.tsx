import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BookOpen, Eye, Users, Lightbulb, Save, Sparkles, Calendar, Brain, Wand2, Globe, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertSoapEntrySchema, type SoapEntry } from "@shared/schema";
import { z } from "zod";

const formSchema = insertSoapEntrySchema.extend({
  devotionalDate: z.string(),
});

type FormData = z.infer<typeof formSchema>;

interface SoapEntryFormProps {
  entry?: SoapEntry | null;
  onClose: () => void;
  onSuccess: () => void;
}

const moodOptions = [
  { value: "peaceful", label: "Peaceful", color: "bg-blue-100 text-blue-800" },
  { value: "grateful", label: "Grateful", color: "bg-green-100 text-green-800" },
  { value: "inspired", label: "Inspired", color: "bg-purple-100 text-purple-800" },
  { value: "struggling", label: "Struggling", color: "bg-orange-100 text-orange-800" },
  { value: "hopeful", label: "Hopeful", color: "bg-yellow-100 text-yellow-800" },
  { value: "reflective", label: "Reflective", color: "bg-indigo-100 text-indigo-800" },
  { value: "joyful", label: "Joyful", color: "bg-pink-100 text-pink-800" },
  { value: "seeking", label: "Seeking", color: "bg-gray-100 text-gray-800" },
];

export function SoapEntryForm({ entry, onClose, onSuccess }: SoapEntryFormProps) {
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [reflectionQuestions, setReflectionQuestions] = useState<string[]>([]);
  const [contextualInfo, setContextualInfo] = useState<any>(null);
  const [isLookingUpVerse, setIsLookingUpVerse] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('NIV');

  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scripture: entry?.scripture || "",
      scriptureReference: entry?.scriptureReference || "",
      observation: entry?.observation || "",
      application: entry?.application || "",
      prayer: entry?.prayer || "",
      moodTag: entry?.moodTag || "",
      isPublic: entry?.isPublic || false,
      isSharedWithGroup: entry?.isSharedWithGroup || false,
      isSharedWithPastor: entry?.isSharedWithPastor || false,
      aiAssisted: entry?.aiAssisted || false,
      tags: entry?.tags || [],
      devotionalDate: entry?.devotionalDate ? new Date(entry.devotionalDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      estimatedReadTime: entry?.estimatedReadTime || 0,
    },
  });

  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  // Fetch contextual information for AI enhancement
  const { data: worldEvents } = useQuery({
    queryKey: ['/api/context/world-events'],
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
  });

  const { data: liturgicalContext } = useQuery({
    queryKey: ['/api/context/liturgical'],
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Auto-detect mood from recent check-ins
  const { data: recentCheckins } = useQuery({
    queryKey: ['/api/checkins/recent'],
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Auto-detect mood from recent check-ins and load contextual information
  useEffect(() => {
    if (worldEvents && liturgicalContext) {
      setContextualInfo({
        worldEvents: worldEvents.events || [],
        spiritualThemes: worldEvents.spiritualThemes || [],
        liturgicalSeason: liturgicalContext.currentSeason,
        upcomingHolidays: liturgicalContext.upcomingHolidays || [],
        seasonalFocus: liturgicalContext.seasonalFocus
      });
    }

    // Auto-detect mood from most recent check-in
    if (recentCheckins && recentCheckins.length > 0) {
      const latestCheckin = recentCheckins[0];
      if (latestCheckin.mood && !form.getValues('moodTag')) {
        form.setValue('moodTag', latestCheckin.mood);
      }
    }
  }, [worldEvents, liturgicalContext, recentCheckins, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        churchId: user?.churchId || 1,
        devotionalDate: new Date(data.devotionalDate),
        tags: data.tags || [],
      };

      if (entry) {
        return apiRequest(`/api/soap/${entry.id}`, {
          method: 'PUT',
          body: payload,
        });
      } else {
        return apiRequest('/api/soap', {
          method: 'POST',
          body: payload,
        });
      }
    },
    onSuccess: () => {
      // Invalidate relevant caches to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/soap'] });
      queryClient.invalidateQueries({ queryKey: ['/api/soap/public'] });
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      
      toast({
        title: "S.O.A.P. Entry Saved",
        description: "Your spiritual reflection has been saved and shared with the community.",
      });
      
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save S.O.A.P. entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  // AI assistance functions
  const generateSuggestions = async () => {
    const currentData = form.getValues();
    
    setIsLoadingAI(true);
    try {
      // Build contextual information for AI
      const contextualEvents = contextualInfo?.worldEvents?.map((event: any) => 
        `${event.title}: ${event.description}`
      ) || [];

      const requestBody = {
        scripture: currentData.scripture || '',
        scriptureReference: currentData.scriptureReference || '',
        userMood: currentData.moodTag,
        currentEvents: contextualEvents,
        personalContext: contextualInfo ? 
          `Liturgical season: ${contextualInfo.liturgicalSeason}. ${contextualInfo.seasonalFocus}. Current spiritual themes: ${contextualInfo.spiritualThemes?.join(', ')}` 
          : undefined,
        generateComplete: !currentData.scripture || !currentData.scriptureReference // Generate complete S.O.A.P. if no scripture provided
      };

      const suggestions = await apiRequest('/api/soap/ai/suggestions', {
        method: 'POST',
        body: requestBody,
      });
      
      setAiSuggestions(suggestions);
      
      // If complete S.O.A.P. was generated, populate the scripture fields too
      if (suggestions.scripture && suggestions.scriptureReference) {
        form.setValue('scripture', suggestions.scripture);
        form.setValue('scriptureReference', suggestions.scriptureReference);
      }
      
      form.setValue('aiAssisted', true);
      toast({
        title: "Complete AI S.O.A.P. Generated",
        description: suggestions.scripture ? 
          "Generated complete Scripture passage and reflections based on your context." :
          "Enhanced your existing Scripture with contextual insights.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const enhanceReflection = async () => {
    const currentData = form.getValues();
    if (!currentData.scripture || !currentData.observation || !currentData.application || !currentData.prayer) {
      toast({
        title: "Complete Reflection Required",
        description: "Please fill in all S.O.A.P. sections before enhancing.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const enhanced = await apiRequest('/api/soap/ai/enhance', {
        method: 'POST',
        body: {
          scripture: currentData.scripture,
          scriptureReference: currentData.scriptureReference,
          observation: currentData.observation,
          application: currentData.application,
          prayer: currentData.prayer,
        },
      });
      
      // Apply enhanced versions
      form.setValue('observation', enhanced.enhancedObservation);
      form.setValue('application', enhanced.enhancedApplication);
      form.setValue('prayer', enhanced.enhancedPrayer);
      form.setValue('aiAssisted', true);
      
      toast({
        title: "Reflection Enhanced",
        description: "Your reflection has been deepened with AI assistance.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enhance reflection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const generateQuestions = async () => {
    const currentData = form.getValues();
    if (!currentData.scripture || !currentData.scriptureReference) {
      toast({
        title: "Scripture Required",
        description: "Please enter a Scripture passage and reference first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest('/api/soap/ai/questions', {
        method: 'POST',
        body: {
          scripture: currentData.scripture,
          scriptureReference: currentData.scriptureReference,
        },
      });
      
      setReflectionQuestions(response.questions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate reflection questions.",
        variant: "destructive",
      });
    }
  };

  const applySuggestion = (field: 'observation' | 'application' | 'prayer', suggestion: string) => {
    form.setValue(field, suggestion);
    form.setValue('aiAssisted', true);
    toast({
      title: "Suggestion Applied",
      description: `AI suggestion has been applied to your ${field}.`,
    });
  };

  const enhanceSingleSection = async (section: 'observation' | 'application' | 'prayer') => {
    const currentData = form.getValues();
    if (!currentData.scripture || !currentData[section]) {
      toast({
        title: "Content Required",
        description: `Please enter both Scripture and ${section} content first.`,
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const enhanced = await apiRequest('/api/soap/ai/enhance', {
        method: 'POST',
        body: {
          scripture: currentData.scripture,
          scriptureReference: currentData.scriptureReference,
          observation: section === 'observation' ? currentData.observation : '',
          application: section === 'application' ? currentData.application : '',
          prayer: section === 'prayer' ? currentData.prayer : '',
          enhanceOnly: section, // Tell backend to only enhance this section
        },
      });
      
      // Apply enhanced version to specific section
      if (section === 'observation' && enhanced.enhancedObservation) {
        form.setValue('observation', enhanced.enhancedObservation);
      } else if (section === 'application' && enhanced.enhancedApplication) {
        form.setValue('application', enhanced.enhancedApplication);
      } else if (section === 'prayer' && enhanced.enhancedPrayer) {
        form.setValue('prayer', enhanced.enhancedPrayer);
      }
      
      form.setValue('aiAssisted', true);
      
      toast({
        title: `${section.charAt(0).toUpperCase() + section.slice(1)} Enhanced`,
        description: `Your ${section} has been enhanced with AI assistance.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to enhance ${section}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const lookupVerse = async (reference: string, forceOverwrite = false) => {
    if (!reference.trim()) return;
    
    // Simple regex to detect verse references like "John 3:16" or "1 John 3:16"
    const versePattern = /^((?:1st?|2nd?|3rd?|I{1,3}|1|2|3)?\s*[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/;
    if (!versePattern.test(reference.trim())) return;

    // Check if there's existing text and user hasn't explicitly requested overwrite
    const currentScripture = form.getValues('scripture');
    if (currentScripture && !forceOverwrite) {
      const shouldOverwrite = window.confirm(
        `There's already text in the Scripture field. Do you want to replace it with the looked up verse?`
      );
      if (!shouldOverwrite) return;
    }

    setIsLookingUpVerse(true);
    try {
      const verseData = await apiRequest('/api/bible/lookup-verse', {
        method: 'POST',
        body: { 
          reference: reference.trim(),
          version: selectedVersion 
        },
      });
      
      if (verseData.text) {
        form.setValue('scripture', verseData.text);
        toast({
          title: "Scripture Found",
          description: `Populated ${verseData.reference} (${selectedVersion})`,
        });
      }
    } catch (error) {
      // Show helpful error message with suggestions
      toast({
        title: "Scripture Lookup",
        description: `"${reference}" not found in our database. Try a different format (e.g., "John 3:16") or enter the verse text manually below.`,
        variant: "default",
      });
      console.log('Verse lookup failed:', error);
    } finally {
      setIsLookingUpVerse(false);
    }
  };

  const handleSubmit = (data: FormData) => {
    console.log('Form submission triggered with data:', data);
    console.log('Form validation errors:', form.formState.errors);
    saveMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {entry ? 'Edit S.O.A.P. Entry' : 'Create S.O.A.P. Entry'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Scripture • Observation • Application • Prayer
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          Spiritual Reflection
        </Badge>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Scripture Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Scripture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="scriptureReference"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Scripture Reference</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ''}
                          placeholder="e.g., John 3:16, Psalm 23:1-3" 
                          onBlur={(e) => {
                            field.onBlur();
                            if (e.target.value.trim()) {
                              lookupVerse(e.target.value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              lookupVerse(field.value || '', true);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <Select value={selectedVersion} onValueChange={(value) => {
                    setSelectedVersion(value);
                    // Auto-lookup when version is changed if there's a reference
                    const reference = form.getValues('scriptureReference');
                    if (reference?.trim()) {
                      lookupVerse(reference, true);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Look Up With..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NIV">NIV - New International Version</SelectItem>
                      <SelectItem value="ESV">ESV - English Standard Version</SelectItem>
                      <SelectItem value="KJV">KJV - King James Version</SelectItem>
                      <SelectItem value="NLT">NLT - New Living Translation</SelectItem>
                      <SelectItem value="NASB">NASB - New American Standard</SelectItem>
                      <SelectItem value="CSB">CSB - Christian Standard Bible</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              </div>

              <FormField
                control={form.control}
                name="scripture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scripture Text</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        value={field.value || ''}
                        placeholder={isLookingUpVerse ? "Looking up verse..." : "Enter the Scripture passage you're reflecting on..."}
                        rows={4}
                        disabled={isLookingUpVerse}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Enter a reference above (like "John 3:16") and select a Bible version to auto-populate the verse text
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />



              {/* AI Assistance Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateSuggestions}
                  disabled={isLoadingAI}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {isLoadingAI ? 'Generating...' : 'Generate Complete S.O.A.P.'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateQuestions}
                  className="flex items-center gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  Reflection Questions
                </Button>
              </div>

              {/* Reflection Questions */}
              {reflectionQuestions.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Reflection Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {reflectionQuestions.map((question, index) => (
                        <li key={index} className="text-sm text-gray-700">
                          • {question}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* S.O.A.P. Sections */}
          <div className="grid gap-6">
            {/* Observation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Observation
                  </span>
                  {aiSuggestions?.observation ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => applySuggestion('observation', aiSuggestions.observation)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Brain className="h-4 w-4 mr-1" />
                      Apply AI Suggestion
                    </Button>
                  ) : form.getValues('observation') && !form.getValues('aiAssisted') && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => enhanceSingleSection('observation')}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Wand2 className="h-4 w-4 mr-1" />
                      Enhance with AI
                    </Button>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  What does this passage say? What are the key themes and context?
                </p>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="observation"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value || ''}
                          placeholder="What do you observe in this Scripture? What stands out to you?"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {aiSuggestions?.observation && (
                  <Card className="mt-3 bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium text-green-800 mb-2">AI Suggestion:</p>
                      <p className="text-sm text-green-700">{aiSuggestions.observation}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Application */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Application
                  </span>
                  {aiSuggestions?.application ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => applySuggestion('application', aiSuggestions.application)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Brain className="h-4 w-4 mr-1" />
                      Apply AI Suggestion
                    </Button>
                  ) : form.getValues('application') && !form.getValues('aiAssisted') && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => enhanceSingleSection('application')}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Wand2 className="h-4 w-4 mr-1" />
                      Enhance with AI
                    </Button>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  How can you apply this to your daily life? What changes will you make?
                </p>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="application"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value || ''}
                          placeholder="How will you apply this Scripture to your life today?"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {aiSuggestions?.application && (
                  <Card className="mt-3 bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium text-green-800 mb-2">AI Suggestion:</p>
                      <p className="text-sm text-green-700">{aiSuggestions.application}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Prayer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Prayer
                  </span>
                  {aiSuggestions?.prayer ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => applySuggestion('prayer', aiSuggestions.prayer)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Brain className="h-4 w-4 mr-1" />
                      Apply AI Suggestion
                    </Button>
                  ) : form.getValues('prayer') && !form.getValues('aiAssisted') && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => enhanceSingleSection('prayer')}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Wand2 className="h-4 w-4 mr-1" />
                      Enhance with AI
                    </Button>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your prayer response to this Scripture. Talk to God about what you've learned.
                </p>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="prayer"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value || ''}
                          placeholder="Write your prayer response to this Scripture..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {aiSuggestions?.prayer && (
                  <Card className="mt-3 bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium text-green-800 mb-2">AI Suggestion:</p>
                      <p className="text-sm text-green-700">{aiSuggestions.prayer}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Settings and Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Settings & Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show detected mood from check-ins */}
              {form.getValues('moodTag') && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">Detected Mood:</Label>
                  <Badge className={moodOptions.find(m => m.value === form.getValues('moodTag'))?.color || "bg-gray-100 text-gray-800"} variant="secondary">
                    {moodOptions.find(m => m.value === form.getValues('moodTag'))?.label || form.getValues('moodTag')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">(from recent check-in)</span>
                </div>
              )}

              <FormField
                control={form.control}
                name="devotionalDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Devotional Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Share with Community</Label>
                        <p className="text-sm text-muted-foreground">
                          Make this entry visible in the community feed
                        </p>
                      </div>
                      <FormControl>
                        <Switch 
                          checked={field.value || false} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isSharedWithPastor"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Share with Pastor</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow your pastor to see this entry
                        </p>
                      </div>
                      <FormControl>
                        <Switch 
                          checked={field.value || false} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                    </div>
                  )}
                />
              </div>

              {/* AI Enhancement Button - Only show if content was manually entered */}
              {!form.getValues('aiAssisted') && form.getValues('observation') && form.getValues('application') && form.getValues('prayer') && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Enhance with AI</h4>
                      <p className="text-sm text-muted-foreground">
                        Deepen your manually written reflection with spiritual insights
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={enhanceReflection}
                      disabled={isEnhancing}
                      className="flex items-center gap-2"
                    >
                      <Wand2 className="h-4 w-4" />
                      {isEnhancing ? 'Enhancing...' : 'Enhance Reflection'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saveMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? 'Saving...' : entry ? 'Update Entry' : 'Save Entry'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}