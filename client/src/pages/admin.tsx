import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Church, Calendar, Users, MessageSquare, Heart, Building, MapPin, Phone, Mail, Globe, Clock, Plus, Upload, X, Trophy, Settings, BookOpen, Video, Music, FileText, Edit, Trash2, Eye } from "lucide-react";
import { insertChurchSchema, insertEventSchema, insertDevotionalSchema, insertWeeklySeriesSchema, insertSermonMediaSchema } from "@shared/schema";
import { ChurchProfileManager } from "@/components/church-profile-manager";

const churchFormSchema = insertChurchSchema.extend({
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

const eventFormSchema = insertEventSchema.extend({
  churchId: z.coerce.number(),
});

const devotionalFormSchema = insertDevotionalSchema.extend({
  churchId: z.coerce.number().optional(),
});

const weeklySeriesFormSchema = insertWeeklySeriesSchema.extend({
  churchId: z.coerce.number().optional(),
});

const sermonMediaFormSchema = insertSermonMediaSchema.extend({
  churchId: z.coerce.number().optional(),
});

type ChurchFormData = z.infer<typeof churchFormSchema>;
type EventFormData = z.infer<typeof eventFormSchema>;
type DevotionalFormData = z.infer<typeof devotionalFormSchema>;
type WeeklySeriesFormData = z.infer<typeof weeklySeriesFormSchema>;
type SermonMediaFormData = z.infer<typeof sermonMediaFormSchema>;

// Stats component
function DevotionalStats() {
  const { data: devotionals } = useQuery({
    queryKey: ['/api/devotionals'],
    staleTime: 5 * 60 * 1000,
  });

  const devotionalList = Array.isArray(devotionals) ? devotionals : [];
  const thisMonth = new Date();
  const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
  
  const publishedThisMonth = devotionalList.filter(d => {
    if (!d.publishedAt) return false;
    const publishedDate = new Date(d.publishedAt);
    return publishedDate >= monthStart;
  }).length;

  return (
    <div className="text-sm text-gray-600 dark:text-gray-400">
      Published: {publishedThisMonth} devotionals this month
    </div>
  );
}

// Draft management components
function DraftDevotionalsList({ churchId }: { churchId: number | null }) {
  // Always fetch all drafts regardless of selected church
  const queryKey = '/api/drafts/devotionals';
  
  const { data: drafts, isLoading, error } = useQuery({
    queryKey: [queryKey],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const publishMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('PATCH', `/api/drafts/devotionals/${id}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drafts/devotionals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/devotionals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/drafts'] });
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['/api/drafts/devotionals'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/drafts/devotionals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drafts/devotionals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/drafts'] });
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['/api/drafts/devotionals'] });
    },
  });

  if (isLoading) return <div className="text-center py-4">Loading drafts...</div>;

  const draftList = Array.isArray(drafts) ? drafts : [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {draftList.length} devotional drafts saved
      </p>
      {draftList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No devotional drafts found
        </div>
      ) : (
        <div className="space-y-2">
          {draftList.map((draft: any) => (
            <Card key={draft.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{draft.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Category: {draft.category} • Created: {new Date(draft.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {draft.content}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => publishMutation.mutate(draft.id)}
                    disabled={publishMutation.isPending}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Publish
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(draft.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function DraftSeriesList({ churchId }: { churchId: number | null }) {
  // Always fetch all drafts regardless of selected church
  const queryKey = '/api/drafts/weekly-series';
  
  const { data: drafts, isLoading } = useQuery({
    queryKey: [queryKey],
  });

  const publishMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('PATCH', `/api/drafts/weekly-series/${id}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drafts/weekly-series'] });
      queryClient.invalidateQueries({ queryKey: ['/api/weekly-series'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/drafts/weekly-series/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drafts/weekly-series'] });
    },
  });

  if (isLoading) return <div className="text-center py-4">Loading drafts...</div>;

  const draftList = Array.isArray(drafts) ? drafts : [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {draftList.length} series drafts saved
      </p>
      {draftList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No series drafts found
        </div>
      ) : (
        <div className="space-y-2">
          {draftList.map((draft: any) => (
            <Card key={draft.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{draft.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Duration: {draft.duration} weeks • Created: {new Date(draft.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {draft.description}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => publishMutation.mutate(draft.id)}
                    disabled={publishMutation.isPending}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Activate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(draft.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function DraftMediaList({ churchId }: { churchId: number | null }) {
  // Always fetch all drafts regardless of selected church
  const queryKey = '/api/drafts/sermon-media';
  
  const { data: drafts, isLoading } = useQuery({
    queryKey: [queryKey],
  });

  const publishMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('PATCH', `/api/drafts/sermon-media/${id}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drafts/sermon-media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sermon-media'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/drafts/sermon-media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drafts/sermon-media'] });
    },
  });

  if (isLoading) return <div className="text-center py-4">Loading drafts...</div>;

  const draftList = Array.isArray(drafts) ? drafts : [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {draftList.length} media drafts saved
      </p>
      {draftList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No media drafts found
        </div>
      ) : (
        <div className="space-y-2">
          {draftList.map((draft: any) => (
            <Card key={draft.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{draft.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Type: {draft.mediaType} • Created: {new Date(draft.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {draft.description}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => publishMutation.mutate(draft.id)}
                    disabled={publishMutation.isPending}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Publish
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(draft.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedChurch, setSelectedChurch] = useState<number | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { data: churches = [], isLoading: churchesLoading } = useQuery({
    queryKey: ["/api/churches"],
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events", selectedChurch],
    enabled: !!selectedChurch,
  });

  const { data: discussions = [] } = useQuery({
    queryKey: ["/api/discussions", selectedChurch],
    enabled: !!selectedChurch,
  });

  const { data: prayers = [] } = useQuery({
    queryKey: ["/api/prayers", selectedChurch],
    enabled: !!selectedChurch,
  });

  const churchForm = useForm<ChurchFormData>({
    resolver: zodResolver(churchFormSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      denomination: "",
      isActive: true,
    },
  });

  const eventForm = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      churchId: selectedChurch || 0,
      category: "service",
      isPublic: true,
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      return response.json();
    },
  });

  const createChurchMutation = useMutation({
    mutationFn: async (data: ChurchFormData) => {
      let churchData = { ...data };
      
      // Upload logo if present
      if (logoFile) {
        try {
          const uploadResult = await uploadImageMutation.mutateAsync(logoFile);
          churchData.logoUrl = uploadResult.imageUrl;
        } catch (error) {
          throw new Error('Failed to upload logo');
        }
      }
      
      return await apiRequest("POST", "/api/churches", churchData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Church created successfully!",
      });
      churchForm.reset();
      setLogoFile(null);
      setLogoPreview(null);
      queryClient.invalidateQueries({ queryKey: ["/api/churches"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create church. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      return await apiRequest("POST", "/api/events", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
      eventForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleCreateChurch = (data: ChurchFormData) => {
    createChurchMutation.mutate(data);
  };

  const handleCreateEvent = (data: EventFormData) => {
    createEventMutation.mutate({
      ...data,
      churchId: selectedChurch!,
    });
  };

  // Content management mutations
  const createDevotionalMutation = useMutation({
    mutationFn: async (data: DevotionalFormData) => {
      return await apiRequest("POST", "/api/devotionals", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Devotional published successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/devotionals"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to publish devotional. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createWeeklySeriesMutation = useMutation({
    mutationFn: async (data: WeeklySeriesFormData) => {
      return await apiRequest("POST", "/api/weekly-series", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Weekly series created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-series"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create weekly series. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createSermonMediaMutation = useMutation({
    mutationFn: async (data: SermonMediaFormData) => {
      return await apiRequest("POST", "/api/sermon-media", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sermon media uploaded successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sermon-media"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload sermon media. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Draft saving mutations
  const saveDevotionalDraftMutation = useMutation({
    mutationFn: async (data: DevotionalFormData) => {
      return await apiRequest("POST", "/api/devotionals", {
        ...data,
        isPublished: false
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Devotional draft saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/drafts/devotionals"] });
      setDevotionalForm({ title: '', category: '', verseReference: '', content: '', churchId: selectedChurch });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save devotional draft. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveWeeklySeriesDraftMutation = useMutation({
    mutationFn: async (data: WeeklySeriesFormData) => {
      return await apiRequest("POST", "/api/weekly-series", {
        ...data,
        isActive: false
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Weekly series draft saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/drafts/weekly-series"] });
      setWeeklySeriesForm({ title: '', description: '', startDate: '', endDate: '', frequency: '', churchId: selectedChurch });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save weekly series draft. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveSermonMediaDraftMutation = useMutation({
    mutationFn: async (data: SermonMediaFormData) => {
      return await apiRequest("POST", "/api/sermon-media", {
        ...data,
        isPublished: false
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sermon media draft saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/drafts/sermon-media"] });
      setSermonMediaForm({ title: '', speaker: '', mediaType: '', date: '', description: '', churchId: selectedChurch });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save sermon media draft. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form handlers for content
  const [devotionalForm, setDevotionalForm] = useState({
    title: '',
    category: '',
    verseReference: '',
    content: '',
    churchId: selectedChurch,
  });

  const [weeklySeriesForm, setWeeklySeriesForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    frequency: '',
    churchId: selectedChurch,
  });

  const [sermonMediaForm, setSermonMediaForm] = useState({
    title: '',
    speaker: '',
    mediaType: '',
    date: '',
    description: '',
    churchId: selectedChurch,
  });

  const handlePublishDevotional = () => {
    if (!devotionalForm.title || !devotionalForm.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createDevotionalMutation.mutate({
      ...devotionalForm,
      churchId: selectedChurch,
    });
  };

  const handleSaveDevotionalDraft = () => {
    if (!devotionalForm.title || !devotionalForm.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    saveDraftMutation.mutate({
      ...devotionalForm,
      churchId: selectedChurch,
    });
  };

  const handleCreateWeeklySeries = () => {
    if (!weeklySeriesForm.title || !weeklySeriesForm.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createWeeklySeriesMutation.mutate({
      ...weeklySeriesForm,
      churchId: selectedChurch,
    });
  };

  const handleSaveWeeklySeriesDraft = () => {
    if (!weeklySeriesForm.title || !weeklySeriesForm.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    saveWeeklySeriesDraftMutation.mutate({
      ...weeklySeriesForm,
      churchId: selectedChurch,
    });
  };

  const handleUploadSermonMedia = () => {
    if (!sermonMediaForm.title || !sermonMediaForm.speaker) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createSermonMediaMutation.mutate({
      ...sermonMediaForm,
      churchId: selectedChurch,
    });
  };

  const handleSaveSermonMediaDraft = () => {
    if (!sermonMediaForm.title || !sermonMediaForm.speaker) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    saveSermonMediaDraftMutation.mutate({
      ...sermonMediaForm,
      churchId: selectedChurch,
    });
  };

  // Draft mutation for devotionals
  const saveDraftMutation = useMutation({
    mutationFn: async (data: DevotionalFormData) => {
      return await apiRequest("POST", "/api/devotionals", {
        ...data,
        isPublished: false, // Save as draft
      });
    },
    onSuccess: () => {
      toast({
        title: "Draft Saved",
        description: "Your devotional has been saved as a draft.",
      });
      setDevotionalForm({
        title: '',
        category: '',
        verseReference: '',
        content: '',
        churchId: selectedChurch,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/devotionals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drafts/devotionals"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Draft mutations for weekly series
  const saveSeriesDraftMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/weekly-series", {
        ...data,
        isActive: false, // Save as draft
      });
    },
    onSuccess: () => {
      toast({
        title: "Draft Saved",
        description: "Your weekly series has been saved as a draft.",
      });
      setWeeklySeriesForm({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        frequency: '',
        churchId: selectedChurch,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-series"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drafts/weekly-series"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Draft mutations for sermon media
  const saveMediaDraftMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/sermon-media", {
        ...data,
        isPublished: false, // Save as draft
      });
    },
    onSuccess: () => {
      toast({
        title: "Draft Saved",
        description: "Your sermon media has been saved as a draft.",
      });
      setSermonMediaForm({
        title: '',
        speaker: '',
        mediaType: '',
        date: '',
        description: '',
        churchId: selectedChurch,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sermon-media"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drafts/sermon-media"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    },
  });











  if (churchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Church className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Portal</h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <Button variant="ghost" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                  <Building className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => window.location.href = '/churches'} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  <Church className="h-4 w-4 mr-2" />
                  Churches
                </Button>
                <Button variant="ghost" onClick={() => window.location.href = '/events'} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  <Calendar className="h-4 w-4 mr-2" />
                  Events
                </Button>
                <Button variant="ghost" onClick={() => window.location.href = '/community'} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  <Users className="h-4 w-4 mr-2" />
                  Community
                </Button>
                <Button variant="ghost" onClick={() => window.location.href = '/leaderboard'} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  <Trophy className="h-4 w-4 mr-2" />
                  Leaderboard
                </Button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Settings className="h-3 w-3 mr-1" />
                Admin
              </Badge>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/profile'}>
                <Users className="h-4 w-4 mr-2" />
                My Profile
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
                <Globe className="h-4 w-4 mr-2" />
                Main Site
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Church Administration</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your church community and events</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Churches
              </CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Church
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Church</DialogTitle>
                    <DialogDescription>
                      Add a new church to the platform
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...churchForm}>
                    <form onSubmit={churchForm.handleSubmit(handleCreateChurch)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={churchForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Church Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Grace Community Church" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={churchForm.control}
                          name="denomination"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Denomination</FormLabel>
                              <FormControl>
                                <Input placeholder="Baptist, Methodist, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={churchForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about your church..." 
                                className="resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={churchForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St, City, State 12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={churchForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={churchForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="info@church.org" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={churchForm.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input placeholder="https://church.org" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* Logo Upload Section */}
                      <div className="space-y-4">
                        <Label>Church Logo</Label>
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoFileChange}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                          </div>
                          {logoPreview && (
                            <div className="relative">
                              <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="h-16 w-16 object-cover rounded-lg border-2 border-gray-200"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                onClick={removeLogo}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {logoFile && (
                          <p className="text-sm text-gray-600">
                            Selected: {logoFile.name} ({(logoFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={createChurchMutation.isPending || uploadImageMutation.isPending}
                      >
                        {createChurchMutation.isPending || uploadImageMutation.isPending ? "Creating..." : "Create Church"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-2">
              {churches.map((church: any) => (
                <Button
                  key={church.id}
                  variant={selectedChurch === church.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedChurch(church.id)}
                >
                  <Church className="h-4 w-4 mr-2" />
                  {church.name || `Church ${church.id}`}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedChurch ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="discussions">Discussions</TabsTrigger>
                <TabsTrigger value="prayers">Prayers</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Events</p>
                          <p className="text-2xl font-bold">{events.length}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Discussions</p>
                          <p className="text-2xl font-bold">{discussions.length}</p>
                        </div>
                        <MessageSquare className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prayer Requests</p>
                          <p className="text-2xl font-bold">{prayers.length}</p>
                        </div>
                        <Heart className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Members</p>
                          <p className="text-2xl font-bold">0</p>
                        </div>
                        <Users className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <ChurchProfileManager churchId={selectedChurch} />
              </TabsContent>

              <TabsContent value="events" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Church Events</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Event</DialogTitle>
                        <DialogDescription>
                          Schedule a new event for your church
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...eventForm}>
                        <form onSubmit={eventForm.handleSubmit(handleCreateEvent)} className="space-y-4">
                          <FormField
                            control={eventForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Event Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Sunday Service" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={eventForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Event details..." 
                                    className="resize-none" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={eventForm.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="service">Service</SelectItem>
                                      <SelectItem value="bible_study">Bible Study</SelectItem>
                                      <SelectItem value="prayer">Prayer Meeting</SelectItem>
                                      <SelectItem value="fellowship">Fellowship</SelectItem>
                                      <SelectItem value="outreach">Outreach</SelectItem>
                                      <SelectItem value="youth">Youth</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={eventForm.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Location</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Main Sanctuary" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={createEventMutation.isPending}
                          >
                            {createEventMutation.isPending ? "Creating..." : "Create Event"}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="grid gap-4">
                  {events.map((event: any) => (
                    <Card key={event.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {event.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location || "TBD"}
                              </span>
                              <Badge variant="secondary">{event.category}</Badge>
                            </div>
                          </div>
                          <Badge variant={event.isPublic ? "default" : "secondary"}>
                            {event.isPublic ? "Public" : "Private"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {events.length === 0 && (
                    <Card>
                      <CardContent className="p-6 text-center text-gray-500">
                        No events scheduled yet. Create your first event!
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Devotionals Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Devotionals
                      </CardTitle>
                      <CardDescription>
                        Publish daily devotionals and spiritual reflections
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            New Devotional
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Create Devotional</DialogTitle>
                            <DialogDescription>
                              Share a spiritual reflection with your community
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="devotional-title">Title</Label>
                              <Input 
                                id="devotional-title" 
                                placeholder="Finding Peace in Difficult Times"
                                value={devotionalForm.title}
                                onChange={(e) => setDevotionalForm({...devotionalForm, title: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="devotional-category">Category</Label>
                              <Select 
                                value={devotionalForm.category}
                                onValueChange={(value) => setDevotionalForm({...devotionalForm, category: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hope">Hope</SelectItem>
                                  <SelectItem value="faith">Faith</SelectItem>
                                  <SelectItem value="love">Love</SelectItem>
                                  <SelectItem value="strength">Strength</SelectItem>
                                  <SelectItem value="forgiveness">Forgiveness</SelectItem>
                                  <SelectItem value="gratitude">Gratitude</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="devotional-verse">Scripture Reference</Label>
                              <Input 
                                id="devotional-verse" 
                                placeholder="John 14:27"
                                value={devotionalForm.verseReference}
                                onChange={(e) => setDevotionalForm({...devotionalForm, verseReference: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="devotional-content">Content</Label>
                              <Textarea 
                                id="devotional-content" 
                                placeholder="Write your devotional content here..."
                                className="min-h-32"
                                value={devotionalForm.content}
                                onChange={(e) => setDevotionalForm({...devotionalForm, content: e.target.value})}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={handleSaveDevotionalDraft}
                              >
                                Save as Draft
                              </Button>
                              <Button 
                                className="flex-1"
                                onClick={handlePublishDevotional}
                                disabled={createDevotionalMutation.isPending}
                              >
                                {createDevotionalMutation.isPending ? "Publishing..." : "Publish Now"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <DevotionalStats />
                    </CardContent>
                  </Card>

                  {/* Weekly Series Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Weekly Series
                      </CardTitle>
                      <CardDescription>
                        Set up weekly series like "Lenten Journey" or "Advent Countdown"
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            New Series
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Create Weekly Series</DialogTitle>
                            <DialogDescription>
                              Plan a series of devotionals or studies
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="series-title">Series Title</Label>
                              <Input 
                                id="series-title" 
                                placeholder="Advent Countdown"
                                value={weeklySeriesForm.title}
                                onChange={(e) => setWeeklySeriesForm({...weeklySeriesForm, title: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="series-description">Description</Label>
                              <Textarea 
                                id="series-description" 
                                placeholder="A 4-week journey preparing our hearts for Christmas..."
                                className="min-h-20"
                                value={weeklySeriesForm.description}
                                onChange={(e) => setWeeklySeriesForm({...weeklySeriesForm, description: e.target.value})}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="series-start">Start Date</Label>
                                <Input 
                                  id="series-start" 
                                  type="date"
                                  value={weeklySeriesForm.startDate}
                                  onChange={(e) => setWeeklySeriesForm({...weeklySeriesForm, startDate: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="series-end">End Date</Label>
                                <Input 
                                  id="series-end" 
                                  type="date"
                                  value={weeklySeriesForm.endDate}
                                  onChange={(e) => setWeeklySeriesForm({...weeklySeriesForm, endDate: e.target.value})}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="series-frequency">Frequency</Label>
                              <Select
                                value={weeklySeriesForm.frequency}
                                onValueChange={(value) => setWeeklySeriesForm({...weeklySeriesForm, frequency: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="How often?" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline"
                                className="flex-1"
                                onClick={handleSaveWeeklySeriesDraft}
                              >
                                Save as Draft
                              </Button>
                              <Button 
                                className="flex-1"
                                onClick={handleCreateWeeklySeries}
                                disabled={createWeeklySeriesMutation.isPending}
                              >
                                {createWeeklySeriesMutation.isPending ? "Creating..." : "Create Series"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Active: 2 series running
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sermon Media Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        Sermon Media
                      </CardTitle>
                      <CardDescription>
                        Upload sermon audio, video, and documents
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Media
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Upload Sermon Media</DialogTitle>
                            <DialogDescription>
                              Share sermons with your congregation
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="media-title">Title</Label>
                              <Input 
                                id="media-title" 
                                placeholder="Sunday Service - Finding Hope"
                                value={sermonMediaForm.title}
                                onChange={(e) => setSermonMediaForm({...sermonMediaForm, title: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="media-speaker">Speaker</Label>
                              <Input 
                                id="media-speaker" 
                                placeholder="Pastor John Smith"
                                value={sermonMediaForm.speaker}
                                onChange={(e) => setSermonMediaForm({...sermonMediaForm, speaker: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="media-type">Media Type</Label>
                              <Select
                                value={sermonMediaForm.mediaType}
                                onValueChange={(value) => setSermonMediaForm({...sermonMediaForm, mediaType: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="audio">Audio</SelectItem>
                                  <SelectItem value="video">Video</SelectItem>
                                  <SelectItem value="document">Document</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="media-date">Date</Label>
                              <Input 
                                id="media-date" 
                                type="date"
                                value={sermonMediaForm.date}
                                onChange={(e) => setSermonMediaForm({...sermonMediaForm, date: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="media-file">File Upload</Label>
                              <Input id="media-file" type="file" accept="audio/*,video/*,.pdf,.doc,.docx" />
                            </div>
                            <div>
                              <Label htmlFor="media-description">Description</Label>
                              <Textarea 
                                id="media-description" 
                                placeholder="Brief description of the sermon..."
                                className="min-h-20"
                                value={sermonMediaForm.description}
                                onChange={(e) => setSermonMediaForm({...sermonMediaForm, description: e.target.value})}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline"
                                className="flex-1"
                                onClick={handleSaveSermonMediaDraft}
                              >
                                Save as Draft
                              </Button>
                              <Button 
                                className="flex-1"
                                onClick={handleUploadSermonMedia}
                                disabled={createSermonMediaMutation.isPending}
                              >
                                {createSermonMediaMutation.isPending ? "Uploading..." : "Upload Media"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Library: 24 audio, 8 video files
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Drafts Management Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Draft Content Management
                    </CardTitle>
                    <CardDescription>
                      View, edit, publish, or delete all saved drafts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>

                    <Tabs defaultValue="devotional-drafts" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="devotional-drafts">Devotional Drafts</TabsTrigger>
                        <TabsTrigger value="series-drafts">Series Drafts</TabsTrigger>
                        <TabsTrigger value="media-drafts">Media Drafts</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="devotional-drafts" className="space-y-4">
                        <DraftDevotionalsList churchId={selectedChurch} />
                      </TabsContent>
                      
                      <TabsContent value="series-drafts" className="space-y-4">
                        <DraftSeriesList churchId={selectedChurch} />
                      </TabsContent>
                      
                      <TabsContent value="media-drafts" className="space-y-4">
                        <DraftMediaList churchId={selectedChurch} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Recent Content Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Content</CardTitle>
                    <CardDescription>
                      Overview of your latest published content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">Walking in Faith</h4>
                            <p className="text-sm text-gray-600">Devotional • Published 2 days ago</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Hope</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Music className="h-5 w-5 text-green-600" />
                          <div>
                            <h4 className="font-medium">Sunday Service Audio</h4>
                            <p className="text-sm text-gray-600">Audio • Uploaded 5 days ago</p>
                          </div>
                        </div>
                        <Badge variant="outline">45 min</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-purple-600" />
                          <div>
                            <h4 className="font-medium">Advent Countdown</h4>
                            <p className="text-sm text-gray-600">Series • 3 of 4 weeks completed</p>
                          </div>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussions" className="space-y-6">
                <h3 className="text-lg font-semibold">Community Discussions</h3>
                <div className="grid gap-4">
                  {discussions.map((discussion: any) => (
                    <Card key={discussion.id}>
                      <CardContent className="p-6">
                        <h4 className="font-semibold">{discussion.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {discussion.content}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {discussion.likeCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {discussion.commentCount || 0}
                          </span>
                          <Badge variant="secondary">{discussion.category}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {discussions.length === 0 && (
                    <Card>
                      <CardContent className="p-6 text-center text-gray-500">
                        No discussions yet.
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="prayers" className="space-y-6">
                <h3 className="text-lg font-semibold">Prayer Requests</h3>
                <div className="grid gap-4">
                  {prayers.map((prayer: any) => (
                    <Card key={prayer.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            {prayer.title && <h4 className="font-semibold">{prayer.title}</h4>}
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {prayer.content}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {prayer.prayerCount || 0} prayers
                              </span>
                              <Badge variant="secondary">{prayer.category}</Badge>
                              {prayer.isAnswered && (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  Answered
                                </Badge>
                              )}
                            </div>
                          </div>
                          {prayer.isAnonymous && (
                            <Badge variant="outline">Anonymous</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {prayers.length === 0 && (
                    <Card>
                      <CardContent className="p-6 text-center text-gray-500">
                        No prayer requests yet.
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="members" className="space-y-6">
                <h3 className="text-lg font-semibold">Church Members</h3>
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    Member management coming soon...
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Building className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Select a Church
                </h3>
                <p className="text-gray-500">
                  Choose a church from the sidebar to manage its content and settings.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}