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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [pendingVerse, setPendingVerse] = useState<{ reference: string; text: string; version: string } | null>(null);
  const [isLookingUpVerse, setIsLookingUpVerse] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('KJV');
  const [autoLookupTimeout, setAutoLookupTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isAutoLookingUp, setIsAutoLookingUp] = useState(false);

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


      try {
        let result;
        if (entry) {
          result = await apiRequest('PUT', `/api/soap/${entry.id}`, payload);
        } else {
          result = await apiRequest('POST', '/api/soap', payload);
        }
        return result;
      } catch (error) {
        throw error;
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
      
      let errorMessage = "Failed to save S.O.A.P. entry. Please try again.";
      let errorTitle = "Not Saved";
      
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMsg = error.message as string;
        
        // Check for specific validation errors from backend
        if (errorMsg.includes('Missing required fields')) {
          errorTitle = "Complete All Required Sections";
          errorMessage = errorMsg;
        } else if (errorMsg.includes('must be at least 10 characters long')) {
          errorTitle = "More Detail Needed";
          errorMessage = errorMsg;
        } else if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
          errorMessage = "Your session has expired. Please refresh the page to continue.";
        } else if (errorMsg.includes('400')) {
          errorMessage = "Please make sure all required fields are filled out correctly.";
        } else if (errorMsg.includes('500')) {
          errorMessage = "Something went wrong on our end. Please try again in a moment.";
        } else {
          // Try to parse JSON error for more specific messages
          try {
            const errorObj = JSON.parse(errorMsg);
            if (errorObj.message) {
              errorMessage = errorObj.message;
              if (errorObj.missingFields) {
                errorTitle = "Complete All Required Sections";
              } else if (errorObj.field) {
                errorTitle = "More Detail Needed";
              }
            }
          } catch {
            errorMessage = errorMsg.length > 100 ? "Please check your entry and try again." : errorMsg;
          }
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
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

      const suggestions = await apiRequest('POST', '/api/soap/ai/suggestions', requestBody);
      
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
      const enhanced = await apiRequest('POST', '/api/soap/ai/enhance', {
        scripture: currentData.scripture,
        scriptureReference: currentData.scriptureReference,
        observation: currentData.observation,
        application: currentData.application,
        prayer: currentData.prayer,
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
      const response = await apiRequest('POST', '/api/soap/ai/questions', {
        scripture: currentData.scripture,
        scriptureReference: currentData.scriptureReference,
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
      const enhanced = await apiRequest('POST', '/api/soap/ai/enhance', {
        scripture: currentData.scripture,
        scriptureReference: currentData.scriptureReference,
        observation: section === 'observation' ? currentData.observation : '',
        application: section === 'application' ? currentData.application : '',
        prayer: section === 'prayer' ? currentData.prayer : '',
        enhanceOnly: section, // Tell backend to only enhance this section
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

  const lookupVerseWithVersion = async (reference: string, version: string, forceOverwrite = false) => {
    if (!reference.trim()) return;
    
    // Simple regex to detect verse references like "John 3:16" or "1 John 3:16"
    const versePattern = /^((?:1st?|2nd?|3rd?|I{1,3}|1|2|3)?\s*[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/;
    if (!versePattern.test(reference.trim())) return;

    // Check if there's existing text and user hasn't explicitly requested overwrite
    const currentScripture = form.getValues('scripture');
    if (currentScripture && !forceOverwrite) {
      // Look up the verse first to show it in the dialog
      setIsLookingUpVerse(true);
      try {
        const response = await apiRequest('POST', '/api/bible/lookup-verse', { 
          reference: reference.trim(),
          version: version 
        });
        
        const verseText = response.verse?.text || response.text;
        const verseRef = response.verse?.reference || response.reference || reference;
        const verseVersion = response.verse?.version || response.version || version;
        
        if (verseText && !verseText.includes('[') && !verseText.includes('text for')) {
          setPendingVerse({ reference: verseRef, text: verseText, version: verseVersion });
          setShowReplaceDialog(true);
          setIsLookingUpVerse(false);
          return;
        }
      } catch (error) {
        setIsLookingUpVerse(false);
        toast({
          title: "Scripture Lookup",
          description: `"${reference}" not found. Please enter the verse text manually.`,
          variant: "default",
        });
        return;
      }
    }

    setIsLookingUpVerse(true);
    try {
      const response = await apiRequest('POST', '/api/bible/lookup-verse', { 
        reference: reference.trim(),
        version: version 
      });
      
      // Handle the correct response structure
      const verseText = response.verse?.text || response.text;
      const verseRef = response.verse?.reference || response.reference || reference;
      
      // Check if verse text is authentic (not placeholder text)
      const isAuthentic = verseText && 
        !verseText.includes('[') && 
        !verseText.includes('text for') &&
        !verseText.includes('The word came according to') &&
        !verseText.includes('Scripture from') &&
        !verseText.includes('Biblical truth from') &&
        verseText.length > 20; // Authentic verses are typically longer than placeholders
      
      if (isAuthentic) {
        form.setValue('scripture', verseText);
        toast({
          title: "Scripture Found",
          description: `Populated ${verseRef} (${version})`,
        });
      } else {
        toast({
          title: "Scripture Lookup",
          description: `"${reference}" not found in ${version}. Please try a different version or enter manually.`,
          variant: "default",
        });
      }
    } catch (error) {
      // Show helpful error message with suggestions
      toast({
        title: "Scripture Lookup",
        description: `"${reference}" not found. Please enter the verse text manually below.`,
        variant: "default",
      });
    } finally {
      setIsLookingUpVerse(false);
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
      // Look up the verse first to show it in the dialog
      setIsLookingUpVerse(true);
      try {
        const response = await apiRequest('POST', '/api/bible/lookup-verse', { 
          reference: reference.trim(),
          version: selectedVersion 
        });
        
        const verseText = response.verse?.text || response.text;
        const verseRef = response.verse?.reference || response.reference || reference;
        const verseVersion = response.verse?.version || response.version || selectedVersion;
        
        if (verseText) {
          setPendingVerse({ reference: verseRef, text: verseText, version: verseVersion });
          setShowReplaceDialog(true);
          setIsLookingUpVerse(false);
          return;
        }
      } catch (error) {
        setIsLookingUpVerse(false);
        toast({
          title: "Scripture Lookup",
          description: `"${reference}" not found. Please enter the verse text manually.`,
          variant: "default",
        });
        return;
      }
    }

    // Just call the versioned function with current selected version
    return lookupVerseWithVersion(reference, selectedVersion, forceOverwrite);
  };

  // Auto-lookup function with debounce for better UX
  const autoLookupVerse = (reference: string) => {
    // Clear existing timeout
    if (autoLookupTimeout) {
      clearTimeout(autoLookupTimeout);
      setIsAutoLookingUp(false);
    }
    
    // Simple regex to detect verse references like "John 3:16" or "1 John 3:16"
    const versePattern = /^((?:1st?|2nd?|3rd?|I{1,3}|1|2|3)?\s*[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/;
    if (!versePattern.test(reference.trim())) {
      setIsAutoLookingUp(false);
      return;
    }
    
    // Show auto-lookup indicator
    setIsAutoLookingUp(true);
    
    // Set new timeout for auto-lookup (1.5 seconds after user stops typing)
    const timeoutId = setTimeout(async () => {
      try {
        const response = await apiRequest('POST', '/api/bible/lookup-verse', { 
          reference: reference.trim(),
          version: selectedVersion 
        });
        
        const verseText = response.verse?.text || response.text;
        if (verseText && !verseText.includes('[') && !verseText.includes('text for')) {
          form.setValue('scripture', verseText);
          toast({
            title: "Scripture Found",
            description: `Loaded ${reference} (${selectedVersion})`,
          });
        }
      } catch (error) {
      }
      setIsAutoLookingUp(false);
    }, 1500);
    
    setAutoLookupTimeout(timeoutId);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoLookupTimeout) {
        clearTimeout(autoLookupTimeout);
      }
    };
  }, [autoLookupTimeout]);

  const handleSubmit = (data: FormData) => {
    
    // Check if all required fields are filled with meaningful content
    const missingFields: string[] = [];
    
    if (!data.scripture || data.scripture.trim().length === 0) {
      missingFields.push("Scripture");
    }
    if (!data.observation || data.observation.trim().length === 0) {
      missingFields.push("Observation");
    }
    if (!data.application || data.application.trim().length === 0) {
      missingFields.push("Application");
    }
    if (!data.prayer || data.prayer.trim().length === 0) {
      missingFields.push("Prayer");
    }
    
    if (missingFields.length > 0) {
      const missingFieldsList = missingFields.join(", ");
      toast({
        title: "Complete All Required Sections",
        description: `Please fill out the following sections before saving: ${missingFieldsList}`,
        variant: "destructive",
      });
      
      // Focus on the first missing field for better UX
      const fieldMap: { [key: string]: string } = {
        "Scripture": "scripture",
        "Observation": "observation", 
        "Application": "application",
        "Prayer": "prayer"
      };
      const firstMissingField = fieldMap[missingFields[0]];
      if (firstMissingField) {
        // Try to focus the field
        const element = document.getElementsByName(firstMissingField)[0] as HTMLElement;
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      
      return;
    }
    
    // Additional validation for minimum content length
    if (data.observation.trim().length < 10) {
      toast({
        title: "Observation Too Short",
        description: "Please add more detail to your observation section (at least 10 characters).",
        variant: "destructive",
      });
      return;
    }
    
    if (data.application.trim().length < 10) {
      toast({
        title: "Application Too Short", 
        description: "Please add more detail to your application section (at least 10 characters).",
        variant: "destructive",
      });
      return;
    }
    
    if (data.prayer.trim().length < 10) {
      toast({
        title: "Prayer Too Short",
        description: "Please add more detail to your prayer section (at least 10 characters).",
        variant: "destructive",
      });
      return;
    }
    
    // Convert devotionalDate string to Date object for schema validation
    const submissionData = {
      ...data,
      devotionalDate: new Date(data.devotionalDate)
    };
    
    saveMutation.mutate(submissionData);
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
                          placeholder="e.g., John 3:16, Psalm 23:1-3 (auto-loads NIV)" 
                          onChange={(e) => {
                            field.onChange(e);
                            // Immediately trigger lookup when reference changes
                            if (e.target.value.trim()) {
                              // Clear any existing timeout and start fresh lookup
                              if (autoLookupTimeout) {
                                clearTimeout(autoLookupTimeout);
                              }
                              lookupVerseWithVersion(e.target.value.trim(), selectedVersion, true);
                            }
                          }}
                          onBlur={(e) => {
                            field.onBlur();
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
                  <FormLabel>Look Up With</FormLabel>
                  <Select value={selectedVersion} onValueChange={(value) => {
                    setSelectedVersion(value);
                    // Force immediate lookup when version is changed if there's a reference
                    const reference = form.getValues('scriptureReference');
                    if (reference?.trim()) {
                      // Use setTimeout to ensure state is updated before lookup
                      setTimeout(() => {
                        lookupVerseWithVersion(reference, value, true);
                      }, 50);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Bible version..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KJV">KJV - King James Version</SelectItem>
                      <SelectItem value="KJVA">KJVA - King James Version with Strong's</SelectItem>
                      <SelectItem value="WEB">WEB - World English Bible</SelectItem>
                      <SelectItem value="ASV">ASV - American Standard Version</SelectItem>
                      <SelectItem value="CEV">CEV - Contemporary English Version</SelectItem>
                      <SelectItem value="GNT">GNT - Good News Translation</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              </div>

              <FormField
                control={form.control}
                name="scripture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Scripture Text
                      {(isLookingUpVerse || isAutoLookingUp) && (
                        <span className="text-xs text-purple-600 font-normal flex items-center gap-1">
                          <div className="animate-spin h-3 w-3 border border-purple-600 border-t-transparent rounded-full"></div>
                          {isAutoLookingUp ? "Auto-loading NIV..." : "Looking up..."}
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        value={field.value || ''}
                        placeholder={
                          isLookingUpVerse ? "Looking up verse..." : 
                          isAutoLookingUp ? "Auto-loading NIV text..." :
                          "Enter the Scripture passage you're reflecting on..."
                        }
                        rows={4}
                        disabled={isLookingUpVerse}
                        className={isAutoLookingUp ? "border-purple-300 bg-purple-50/50" : ""}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      {isAutoLookingUp ? (
                        <span className="text-purple-600">Auto-populating NIV text for your reference...</span>
                      ) : (
                        "Type a reference above (like \"John 3:16\") and NIV text will auto-load. Change version to switch translations."
                      )}
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
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Observation
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    What does this passage say? What are the key themes and context?
                  </p>
                  
                  {/* Mobile-friendly AI buttons */}
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions?.observation ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applySuggestion('observation', aiSuggestions.observation)}
                        className="text-blue-600 hover:text-blue-800 border-blue-200"
                      >
                        <Brain className="h-4 w-4 mr-1" />
                        Apply AI Suggestion
                      </Button>
                    ) : form.getValues('observation') && form.getValues('observation').length > 10 && !form.getValues('aiAssisted') && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => enhanceSingleSection('observation')}
                        className="text-green-600 hover:text-green-800 border-green-200"
                      >
                        <Wand2 className="h-4 w-4 mr-1" />
                        Enhance with AI
                      </Button>
                    )}
                  </div>
                </div>
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
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Application
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    How can you apply this to your daily life? What changes will you make?
                  </p>
                  
                  {/* Mobile-friendly AI buttons */}
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions?.application ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applySuggestion('application', aiSuggestions.application)}
                        className="text-blue-600 hover:text-blue-800 border-blue-200"
                      >
                        <Brain className="h-4 w-4 mr-1" />
                        Apply AI Suggestion
                      </Button>
                    ) : form.getValues('application') && form.getValues('application').length > 10 && !form.getValues('aiAssisted') && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => enhanceSingleSection('application')}
                        className="text-green-600 hover:text-green-800 border-green-200"
                      >
                        <Wand2 className="h-4 w-4 mr-1" />
                        Enhance with AI
                      </Button>
                    )}
                  </div>
                </div>
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
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Prayer
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your prayer response to this Scripture. Talk to God about what you've learned.
                  </p>
                  
                  {/* Mobile-friendly AI buttons */}
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions?.prayer ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applySuggestion('prayer', aiSuggestions.prayer)}
                        className="text-blue-600 hover:text-blue-800 border-blue-200"
                      >
                        <Brain className="h-4 w-4 mr-1" />
                        Apply AI Suggestion
                      </Button>
                    ) : form.getValues('prayer') && form.getValues('prayer').length > 10 && !form.getValues('aiAssisted') && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => enhanceSingleSection('prayer')}
                        className="text-green-600 hover:text-green-800 border-green-200"
                      >
                        <Wand2 className="h-4 w-4 mr-1" />
                        Enhance with AI
                      </Button>
                    )}
                  </div>
                </div>
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
              onClick={(e) => {
                
                // Manually trigger form submission if validation passes
                const values = form.getValues();
                
                if (values.scripture && values.observation && values.application && values.prayer) {
                  
                  // Try direct handleSubmit call to bypass form wrapper
                  try {
                    handleSubmit(values);
                  } catch (error) {
                  }
                } else {
                }
              }}
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