import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { ArrowLeft, BookOpen, Eye, Users, Lightbulb, Save, Sparkles, Calendar, Brain, Wand2, Globe, ChevronDown, ChevronUp, Info, X } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";
import { insertSoapEntrySchema, type SoapEntry } from "../../../shared/schema";
import { z } from "zod";
import { moodCategories, allMoods, getMoodsByIds } from "../lib/moodCategories";
import ExpirationSettings from "./ExpirationSettings";

const formSchema = insertSoapEntrySchema.extend({
  devotionalDate: z.string(),
});

type FormData = z.infer<typeof formSchema>;

interface SoapEntryFormProps {
  entry?: SoapEntry | null;
  onClose: () => void;
  onSuccess: () => void;
}

// Use comprehensive mood system from shared library

export function SoapEntryForm({ entry, onClose, onSuccess }: SoapEntryFormProps) {
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [reflectionQuestions, setReflectionQuestions] = useState<string[]>([]);
  const [contextualInfo, setContextualInfo] = useState<any>(null);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [pendingVerse, setPendingVerse] = useState<{ reference: string; text: string; version: string } | null>(null);
  const [isLookingUpVerse, setIsLookingUpVerse] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('NIV'); // Will be updated from user preferences
  const [autoLookupTimeout, setAutoLookupTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isAutoLookingUp, setIsAutoLookingUp] = useState(false);
  
  // Comprehensive mood system state
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [isDetectingMood, setIsDetectingMood] = useState(false);
  const [aiMoodSuggestions, setAiMoodSuggestions] = useState<string[]>([]);
  const [moodDetectionTimeout, setMoodDetectionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showFullMoodGrid, setShowFullMoodGrid] = useState(false);
  const [useAiSuggestions, setUseAiSuggestions] = useState(true);
  
  // Expiration settings state
  const [expirationSettings, setExpirationSettings] = useState<{
    expiresAt: Date | null;
    allowsExpiration: boolean;
  }>({
    expiresAt: entry?.expiresAt ? new Date(entry.expiresAt) : null,
    allowsExpiration: entry?.allowsExpiration || false,
  });

  const { toast } = useToast();

  const form = useForm<FormData>({
    // resolver: zodResolver(formSchema), // Simplified validation
    defaultValues: {
      scripture: entry?.scripture || "",
      scriptureReference: entry?.scriptureReference || "",
      observation: entry?.observation || "",
      application: entry?.application || "",
      prayer: entry?.prayer || "",
      moodTag: entry?.moodTag || "",
      isPublic: entry?.isPublic ?? true,
      isSharedWithGroup: entry?.isSharedWithGroup || false,
      isSharedWithPastor: entry?.isSharedWithPastor || false,
      aiAssisted: entry?.aiAssisted || false,
      tags: entry?.tags || [],
      devotionalDate: entry?.devotionalDate ? new Date(entry.devotionalDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      estimatedReadTime: entry?.estimatedReadTime || 0,
    },
  });

  // Initialize mood state from entry data
  useEffect(() => {
    if (entry?.moodTag) {
      const moodIds = entry.moodTag.split(', ').map(mood => {
        // Find mood ID by label (for backwards compatibility)
        const foundMood = allMoods.find(m => m.label.toLowerCase() === mood.toLowerCase() || m.id === mood);
        return foundMood?.id || mood;
      }).filter(Boolean);
      setSelectedMoods(moodIds);
    }
  }, [entry?.moodTag]);

  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  // Initialize selectedVersion from user's Bible translation preference
  useEffect(() => {
    if (user && (user as any)?.bibleTranslationPreference) {
      setSelectedVersion((user as any).bibleTranslationPreference);
    }
  }, [user]);

  const { data: churchAffiliation } = useQuery({
    queryKey: ['/api/user-profiles/church-affiliation'],
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

  // AI Mood Detection Function
  const detectMoodFromContent = useCallback(async () => {
    const scripture = form.getValues('scripture');
    const scriptureReference = form.getValues('scriptureReference');
    const observation = form.getValues('observation');
    const application = form.getValues('application');
    const prayer = form.getValues('prayer');

    // Only run if we have enough content
    if (!scripture && !observation && !application && !prayer) {
      return;
    }

    setIsDetectingMood(true);
    try {
      const response = await apiRequest('POST', '/api/mood/detect', {
        scripture,
        scriptureReference,
        observation,
        application,
        prayer
      });

      const { suggestedMoods } = response;
      if (suggestedMoods && suggestedMoods.length > 0) {
        setAiMoodSuggestions(suggestedMoods);
        
        // Auto-apply AI suggestions if using AI mode and no moods currently selected
        if (selectedMoods.length === 0 && useAiSuggestions) {
          setSelectedMoods(suggestedMoods);
          const moodLabels = getMoodsByIds(suggestedMoods).map(m => m.label).join(', ');
          form.setValue('moodTag', moodLabels);
        }
      }
    } catch (error) {
      // Silently handle errors for better UX
    } finally {
      setIsDetectingMood(false);
    }
  }, [form, selectedMoods]);

  // Debounced mood detection on content change
  const triggerMoodDetection = useCallback(() => {
    if (moodDetectionTimeout) {
      clearTimeout(moodDetectionTimeout);
    }
    
    const timeoutId = setTimeout(() => {
      detectMoodFromContent();
    }, 2000); // 2 second delay after user stops typing
    
    setMoodDetectionTimeout(timeoutId);
  }, [detectMoodFromContent, moodDetectionTimeout]);

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

    // Fallback to recent check-in mood only if no moods selected and no AI suggestions
    if (recentCheckins && recentCheckins.length > 0 && selectedMoods.length === 0 && aiMoodSuggestions.length === 0) {
      const latestCheckin = recentCheckins[0];
      if (latestCheckin.mood && !form.getValues('moodTag')) {
        form.setValue('moodTag', latestCheckin.mood);
      }
    }
  }, [worldEvents, liturgicalContext, recentCheckins, form, selectedMoods, aiMoodSuggestions]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      
      const payload = {
        ...data,
        churchId: user?.churchId || 1,
        devotionalDate: new Date(data.devotionalDate).toISOString(),
        tags: data.tags || [],
        expiresAt: expirationSettings.expiresAt ? expirationSettings.expiresAt.toISOString() : null,
        allowsExpiration: expirationSettings.allowsExpiration,
      };

      // Remove any undefined fields to prevent backend issues
      Object.keys(payload).forEach(key => {
        if (payload[key as keyof typeof payload] === undefined) {
          delete payload[key as keyof typeof payload];
        }
      });

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
      queryClient.invalidateQueries({ queryKey: ['/api/soap-entries/public'] });
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      
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
      const enhanced = await apiRequest('POST', '/api/soap-entries/ai/enhance', {
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
      const response = await apiRequest('POST', '/api/soap-entries/ai/questions', {
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
      const enhanced = await apiRequest('POST', '/api/soap-entries/ai/enhance', {
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

  // Mood Selection Handlers
  const toggleMoodSelection = (moodId: string) => {
    setSelectedMoods(prev => {
      const newMoods = prev.includes(moodId) 
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId];
      
      // Update form with mood labels
      const moodLabels = getMoodsByIds(newMoods).map(m => m.label).join(', ');
      form.setValue('moodTag', moodLabels);
      return newMoods;
    });
  };

  const clearMoods = () => {
    setSelectedMoods([]);
    form.setValue('moodTag', '');
  };

  const applyAiSuggestions = () => {
    setSelectedMoods(aiMoodSuggestions);
    const moodLabels = getMoodsByIds(aiMoodSuggestions).map(m => m.label).join(', ');
    form.setValue('moodTag', moodLabels);
    setUseAiSuggestions(true);
  };

  const openMoodCustomization = () => {
    setShowFullMoodGrid(true);
    setUseAiSuggestions(false);
  };

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
    
    // Set form errors for missing fields to show red error messages
    if (missingFields.length > 0) {
      // Set form errors for each missing field
      missingFields.forEach(field => {
        const fieldName = field.toLowerCase() as keyof FormData;
        form.setError(fieldName, {
          type: 'required',
          message: `${field} section is required`
        });
      });
      
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
    
    // Additional validation for minimum content length with form errors
    let hasMinLengthErrors = false;
    
    if (data.scripture.trim().length < 10) {
      form.setError('scripture', {
        type: 'minLength',
        message: 'Scripture needs at least 10 characters'
      });
      hasMinLengthErrors = true;
    }
    
    if (data.observation.trim().length < 10) {
      form.setError('observation', {
        type: 'minLength', 
        message: 'Observation needs at least 10 characters'
      });
      hasMinLengthErrors = true;
    }
    
    if (data.application.trim().length < 10) {
      form.setError('application', {
        type: 'minLength',
        message: 'Application needs at least 10 characters'
      });
      hasMinLengthErrors = true;
    }
    
    if (data.prayer.trim().length < 10) {
      form.setError('prayer', {
        type: 'minLength',
        message: 'Prayer needs at least 10 characters'
      });
      hasMinLengthErrors = true;
    }
    
    if (hasMinLengthErrors) {
      toast({
        title: "Content Too Short",
        description: "All sections need at least 10 characters for meaningful reflection. Please see error messages below.",
        variant: "destructive",
      });
      return;
    }
    
    // Convert devotionalDate string to proper format for schema validation
    const submissionData = {
      ...data,
      devotionalDate: data.devotionalDate.toString()
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
        <form onSubmit={(e) => {
          e.preventDefault();
          const data = form.getValues();
          handleSubmit(data);
        }} className="space-y-6">
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
                          placeholder={`e.g., John 3:16, Psalm 23:1-3 (auto-loads ${selectedVersion})`} 
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
                        onChange={(e) => {
                          field.onChange(e);
                          triggerMoodDetection();
                        }}
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
                          onChange={(e) => {
                            field.onChange(e);
                            triggerMoodDetection();
                          }}
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
                          onChange={(e) => {
                            field.onChange(e);
                            triggerMoodDetection();
                          }}
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
                          onChange={(e) => {
                            field.onChange(e);
                            triggerMoodDetection();
                          }}
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
              {/* Show mood tag field for backwards compatibility */}
              <FormField
                control={form.control}
                name="moodTag"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} type="hidden" />
                    </FormControl>
                  </FormItem>
                )}
              />

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
                        <Label className={!churchAffiliation?.hasChurch ? "text-muted-foreground" : ""}>
                          Share with Pastor
                        </Label>
                        {churchAffiliation?.hasChurch ? (
                          churchAffiliation.hasPastors ? (
                            <p className="text-sm text-muted-foreground">
                              Share this reflection with your church pastors ({churchAffiliation.pastorCount} pastor{churchAffiliation.pastorCount !== 1 ? 's' : ''})
                            </p>
                          ) : (
                            <p className="text-sm text-orange-600">
                              Your church doesn't have any pastors registered yet
                            </p>
                          )
                        ) : (
                          <p className="text-sm text-orange-600">
                            Join a church to share reflections with pastors
                          </p>
                        )}
                      </div>
                      <FormControl>
                        <Switch 
                          checked={field.value || false} 
                          onCheckedChange={churchAffiliation?.hasChurch && churchAffiliation?.hasPastors ? field.onChange : undefined}
                          disabled={!churchAffiliation?.hasChurch || !churchAffiliation?.hasPastors}
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

          {/* Comprehensive Mood Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  How are you feeling? (Optional)
                </CardTitle>
                {isDetectingMood && (
                  <div className="flex items-center gap-2 text-sm text-purple-600">
                    <div className="animate-spin h-4 w-4 border border-purple-600 border-t-transparent rounded-full"></div>
                    Analyzing mood...
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                AI can detect your emotional and spiritual state from your reflection content.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: AI Suggestions (Top 2-3 Moods) */}
              {aiMoodSuggestions.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">AI Suggests:</span>
                    <div className="flex items-center gap-1 text-xs text-purple-600">
                      <Info className="h-3 w-3" />
                      <span>Based on your scripture content</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {aiMoodSuggestions.slice(0, 3).map(moodId => {
                      const mood = allMoods.find(m => m.id === moodId);
                      return mood ? (
                        <div key={moodId} className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-purple-200">
                          <span className="text-lg">{mood.icon}</span>
                          <span className="text-sm font-medium text-purple-800">{mood.label}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: User Choice */}
              <div className="space-y-3">
                {aiMoodSuggestions.length > 0 ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={useAiSuggestions ? "default" : "outline"}
                      size="sm"
                      onClick={applyAiSuggestions}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Keep AI Suggestions
                    </Button>
                    <Button
                      type="button"
                      variant={!useAiSuggestions ? "default" : "outline"}
                      size="sm"
                      onClick={openMoodCustomization}
                      className="flex items-center gap-2"
                    >
                      <ChevronDown className="h-4 w-4" />
                      Edit Moods
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFullMoodGrid(true)}
                    className="flex items-center gap-2"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Choose Your Moods
                  </Button>
                )}
              </div>

              {/* Full Mood Grid (Expandable) */}
              {showFullMoodGrid && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">Select All That Apply</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullMoodGrid(false)}
                      className="text-gray-500"
                    >
                      <ChevronUp className="h-4 w-4" />
                      Collapse
                    </Button>
                  </div>

                  {/* Mood Categories with Tabs */}
                  <div className="space-y-4">
                    {moodCategories.map((category) => (
                      <div key={category.title} className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md">
                          <span className="text-lg">{category.icon}</span>
                          {category.title}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {category.moods.map((mood) => {
                            const isSelected = selectedMoods.includes(mood.id);
                            const isAiSuggested = aiMoodSuggestions.includes(mood.id);
                            return (
                              <Button
                                key={mood.id}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleMoodSelection(mood.id)}
                                className={`flex items-center gap-2 justify-start text-left h-auto py-2 px-3 ${
                                  isSelected 
                                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                                    : isAiSuggested
                                    ? "border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                <span className="text-base">{mood.icon}</span>
                                <div className="text-left">
                                  <div className="text-xs font-medium">{mood.label}</div>
                                  <div className="text-xs opacity-70">{mood.subtitle}</div>
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Moods Display */}
              {selectedMoods.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">
                      Selected ({selectedMoods.length})
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearMoods}
                      className="text-gray-600 border-gray-300"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedMoods.map(moodId => {
                      const mood = allMoods.find(m => m.id === moodId);
                      return mood ? (
                        <Badge key={moodId} variant="secondary" className="bg-blue-100 text-blue-800">
                          {mood.icon} {mood.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Manual AI Detection */}
              {!isDetectingMood && aiMoodSuggestions.length === 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={detectMoodFromContent}
                  className="flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  Get AI Mood Suggestions
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Expiration Settings */}
          <ExpirationSettings
            contentType="S.O.A.P. entry"
            settings={expirationSettings}
            onSettingsChange={setExpirationSettings}
          />

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