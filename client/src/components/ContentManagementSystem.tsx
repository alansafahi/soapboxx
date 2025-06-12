import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import SmartScriptureTextarea from "./SmartScriptureTextarea";
import { 
  Video, 
  FileText, 
  Upload, 
  Play, 
  Pause, 
  Download,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Eye,
  Share2,
  BookOpen,
  Mic,
  Speaker,
  Volume2,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  AlertTriangle,
  X,
  Star,
  MessageSquare,
  ThumbsUp,
  Settings
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MediaItem {
  id: number;
  title: string;
  description?: string;
  type: 'video' | 'audio' | 'document' | 'image';
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
  category: string;
  isPublic: boolean;
  viewCount: number;
  downloadCount: number;
  status: 'processing' | 'ready' | 'failed';
}

interface Sermon {
  id: number;
  title: string;
  description: string;
  preacher: string;
  sermonDate: string;
  scripture: string;
  seriesId?: number;
  seriesTitle?: string;
  audioUrl?: string;
  videoUrl?: string;
  notesUrl?: string;
  duration?: number;
  viewCount: number;
  likes: number;
  isPublished: boolean;
  tags: string[];
}

interface Devotional {
  id: number;
  title: string;
  content: string;
  author: string;
  publishDate: string;
  scripture: string;
  category: string;
  readingTime: number;
  isPublished: boolean;
  views: number;
  likes: number;
  comments: number;
}

interface WeeklySeries {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  imageUrl?: string;
  sermonCount: number;
  totalViews: number;
  isActive: boolean;
  status: 'planning' | 'active' | 'completed';
}

interface ContentModerationItem {
  id: number;
  type: 'comment' | 'discussion' | 'prayer_request' | 'media';
  content: string;
  author: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  flagReason?: string;
  moderatorNotes?: string;
  priority: 'low' | 'medium' | 'high';
}

const mediaUploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()),
  isPublic: z.boolean().default(true),
  file: z.any()
});

const sermonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  preacher: z.string().min(1, "Preacher is required"),
  sermonDate: z.string().min(1, "Date is required"),
  scripture: z.string().min(1, "Scripture reference is required"),
  seriesId: z.number().optional(),
  tags: z.array(z.string()).default([])
});

const devotionalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  scripture: z.string().min(1, "Scripture reference is required"),
  category: z.string().min(1, "Category is required"),
  publishDate: z.string().min(1, "Publish date is required"),
  readingTime: z.number().min(1).max(30)
});

const weeklySeriesSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional()
});

export default function ContentManagementSystem() {
  const [activeTab, setActiveTab] = useState("media");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: mediaItems, isLoading: mediaLoading } = useQuery<MediaItem[]>({
    queryKey: ["/api/content/media"],
  });

  const { data: sermons, isLoading: sermonsLoading } = useQuery<Sermon[]>({
    queryKey: ["/api/content/sermons"],
  });

  const { data: devotionals, isLoading: devotionalsLoading } = useQuery<Devotional[]>({
    queryKey: ["/api/content/devotionals"],
  });

  const { data: weeklySeries, isLoading: seriesLoading } = useQuery<WeeklySeries[]>({
    queryKey: ["/api/content/weekly-series"],
  });

  const { data: moderationQueue, isLoading: moderationLoading } = useQuery<ContentModerationItem[]>({
    queryKey: ["/api/content/moderation"],
  });

  // Mutations
  const uploadMediaMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsUploading(true);
      const response = await fetch("/api/content/media/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/media"] });
      setIsUploading(false);
      setUploadProgress(0);
      toast({ title: "Media uploaded successfully" });
    },
    onError: () => {
      setIsUploading(false);
      setUploadProgress(0);
      toast({ title: "Upload failed", variant: "destructive" });
    }
  });

  const createSermonMutation = useMutation({
    mutationFn: (data: z.infer<typeof sermonSchema>) => 
      apiRequest("/api/content/sermons", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/sermons"] });
      toast({ title: "Sermon created successfully" });
    }
  });

  const createDevotionalMutation = useMutation({
    mutationFn: (data: z.infer<typeof devotionalSchema>) => 
      apiRequest("/api/content/devotionals", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/devotionals"] });
      toast({ title: "Devotional created successfully" });
    }
  });

  const createSeriesMutation = useMutation({
    mutationFn: (data: z.infer<typeof weeklySeriesSchema>) => 
      apiRequest("/api/content/weekly-series", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/weekly-series"] });
      toast({ title: "Weekly series created successfully" });
    }
  });

  const moderateContentMutation = useMutation({
    mutationFn: ({ id, action, notes }: { id: number; action: 'approve' | 'reject'; notes?: string }) => 
      apiRequest(`/api/content/moderation/${id}`, "PATCH", { action, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/moderation"] });
      toast({ title: "Content moderated successfully" });
    }
  });

  const MediaLibraryTab = () => {
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [filterType, setFilterType] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredMedia = mediaItems?.filter(item => {
      const matchesType = filterType === "all" || item.type === filterType;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });

    const handleFileUpload = async (file: File) => {
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);
      formData.append("category", "general");
      formData.append("isPublic", "true");

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      uploadMediaMutation.mutate(formData);
    };

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDuration = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="image">Images</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Media
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Media</DialogTitle>
                <DialogDescription>
                  Upload videos, audio files, documents, or images
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Click to select files or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports videos, audio, documents, and images
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="video/*,audio/*,image/*,.pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMedia?.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {item.type === 'video' && <Video className="h-4 w-4" />}
                    {item.type === 'audio' && <Mic className="h-4 w-4" />}
                    {item.type === 'document' && <FileText className="h-4 w-4" />}
                    {item.type === 'image' && <FileText className="h-4 w-4" />}
                    <CardTitle className="text-sm truncate">{item.title}</CardTitle>
                  </div>
                  <Badge variant={item.status === 'ready' ? 'default' : 'secondary'}>
                    {item.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {item.thumbnailUrl && (
                  <div className="w-full h-32 bg-muted rounded-lg mb-3 overflow-hidden">
                    <img 
                      src={item.thumbnailUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span>{formatFileSize(item.fileSize)}</span>
                  </div>
                  {item.duration && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span>{formatDuration(item.duration)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Views</span>
                    <span>{item.viewCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Downloads</span>
                    <span>{item.downloadCount}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline">
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const SermonsTab = () => {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const form = useForm<z.infer<typeof sermonSchema>>({
      resolver: zodResolver(sermonSchema),
      defaultValues: {
        tags: []
      }
    });

    const onSubmit = (data: z.infer<typeof sermonSchema>) => {
      createSermonMutation.mutate(data);
      setCreateDialogOpen(false);
      form.reset();
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Sermon Library</h3>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Sermon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Sermon</DialogTitle>
                <DialogDescription>
                  Add a new sermon to your library
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sermon Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter sermon title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter sermon description" 
                            className="min-h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="preacher"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preacher</FormLabel>
                          <FormControl>
                            <Input placeholder="Preacher name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sermonDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="scripture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scripture Reference</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., John 3:16-17" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createSermonMutation.isPending}>
                      {createSermonMutation.isPending ? "Creating..." : "Create Sermon"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {sermons?.map((sermon) => (
            <Card key={sermon.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{sermon.title}</CardTitle>
                    <CardDescription>
                      {sermon.preacher} • {new Date(sermon.sermonDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={sermon.isPublished ? "default" : "secondary"}>
                      {sermon.isPublished ? "Published" : "Draft"}
                    </Badge>
                    {sermon.seriesTitle && (
                      <Badge variant="outline">{sermon.seriesTitle}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{sermon.description}</p>
                
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {sermon.scripture}
                    </span>
                    {sermon.duration && (
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {Math.floor(sermon.duration / 60)} min
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-muted-foreground">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {sermon.viewCount}
                    </span>
                    <span className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {sermon.likes}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {sermon.audioUrl && (
                      <Button size="sm" variant="outline">
                        <Volume2 className="h-4 w-4 mr-2" />
                        Audio
                      </Button>
                    )}
                    {sermon.videoUrl && (
                      <Button size="sm" variant="outline">
                        <Video className="h-4 w-4 mr-2" />
                        Video
                      </Button>
                    )}
                    {sermon.notesUrl && (
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Notes
                      </Button>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const DevotionalsTab = () => {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const form = useForm<z.infer<typeof devotionalSchema>>({
      resolver: zodResolver(devotionalSchema),
      defaultValues: {
        readingTime: 5
      }
    });

    const onSubmit = (data: z.infer<typeof devotionalSchema>) => {
      createDevotionalMutation.mutate(data);
      setCreateDialogOpen(false);
      form.reset();
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Devotional Publishing</h3>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Devotional
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Devotional</DialogTitle>
                <DialogDescription>
                  Create a new devotional for your community
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter devotional title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="scripture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scripture Reference</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Psalm 23:1-4" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write your devotional content..." 
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
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
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="seasonal">Seasonal</SelectItem>
                              <SelectItem value="topical">Topical</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="readingTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reading Time (min)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="30" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="publishDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Publish Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createDevotionalMutation.isPending}>
                      {createDevotionalMutation.isPending ? "Creating..." : "Create Devotional"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {devotionals?.map((devotional) => (
            <Card key={devotional.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{devotional.title}</CardTitle>
                  <Badge variant={devotional.isPublished ? "default" : "secondary"}>
                    {devotional.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <CardDescription>
                  {devotional.scripture} • {devotional.readingTime} min read
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {devotional.content}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>By {devotional.author}</span>
                  <span>{new Date(devotional.publishDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {devotional.views}
                    </span>
                    <span className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {devotional.likes}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {devotional.comments}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const WeeklySeriesTab = () => {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const form = useForm<z.infer<typeof weeklySeriesSchema>>({
      resolver: zodResolver(weeklySeriesSchema)
    });

    const onSubmit = (data: z.infer<typeof weeklySeriesSchema>) => {
      createSeriesMutation.mutate(data);
      setCreateDialogOpen(false);
      form.reset();
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Weekly Series Management</h3>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Series
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Weekly Series</DialogTitle>
                <DialogDescription>
                  Plan and structure your sermon series
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Series Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter series title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <SmartScriptureTextarea
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder="Describe the series theme and goals... (Type 'Ephesians 4:11' for auto-population)"
                            label="Series Description"
                            helpText="Include scripture references to automatically populate verse text"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createSeriesMutation.isPending}>
                      {createSeriesMutation.isPending ? "Creating..." : "Create Series"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {weeklySeries?.map((series) => (
            <Card key={series.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{series.title}</CardTitle>
                  <Badge variant={
                    series.status === 'active' ? 'default' : 
                    series.status === 'completed' ? 'secondary' : 'outline'
                  }>
                    {series.status}
                  </Badge>
                </div>
                <CardDescription>
                  {new Date(series.startDate).toLocaleDateString()} - 
                  {series.endDate ? new Date(series.endDate).toLocaleDateString() : 'Ongoing'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {series.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sermons</span>
                    <span>{series.sermonCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Views</span>
                    <span>{series.totalViews}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <Badge variant={series.isActive ? "default" : "secondary"}>
                    {series.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const ModerationTab = () => {
    const pendingItems = moderationQueue?.filter(item => item.status === 'pending') || [];
    const reviewedItems = moderationQueue?.filter(item => item.status !== 'pending') || [];

    const handleModeration = (id: number, action: 'approve' | 'reject', notes?: string) => {
      moderateContentMutation.mutate({ id, action, notes });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Content Moderation</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="destructive">
              {pendingItems.length} Pending
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Review ({pendingItems.length})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              Reviewed ({reviewedItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm">
                        {item.type.replace('_', ' ').toUpperCase()}
                      </CardTitle>
                      <CardDescription>
                        By {item.author} • {new Date(item.submittedAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        item.priority === 'high' ? 'destructive' :
                        item.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {item.priority}
                      </Badge>
                      {item.flagReason && (
                        <Badge variant="outline">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Flagged
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 p-3 bg-muted rounded-lg">
                    {item.content}
                  </p>
                  
                  {item.flagReason && (
                    <div className="mb-4 p-3 bg-destructive/10 rounded-lg">
                      <p className="text-sm text-destructive">
                        <strong>Flag Reason:</strong> {item.flagReason}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleModeration(item.id, 'reject')}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleModeration(item.id, 'approve')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {pendingItems.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">
                  No pending content to review at this time.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviewed" className="space-y-4">
            {reviewedItems.slice(0, 10).map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm">
                        {item.type.replace('_', ' ').toUpperCase()}
                      </CardTitle>
                      <CardDescription>
                        By {item.author} • {new Date(item.submittedAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge variant={item.status === 'approved' ? 'default' : 'destructive'}>
                      {item.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.content}
                  </p>
                  {item.moderatorNotes && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      <strong>Moderator Notes:</strong> {item.moderatorNotes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">
          Manage your church's media library, sermons, devotionals, and content moderation
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="media">Media Library</TabsTrigger>
          <TabsTrigger value="sermons">Sermons</TabsTrigger>
          <TabsTrigger value="devotionals">Devotionals</TabsTrigger>
          <TabsTrigger value="series">Weekly Series</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="media" className="mt-6">
          <MediaLibraryTab />
        </TabsContent>

        <TabsContent value="sermons" className="mt-6">
          <SermonsTab />
        </TabsContent>

        <TabsContent value="devotionals" className="mt-6">
          <DevotionalsTab />
        </TabsContent>

        <TabsContent value="series" className="mt-6">
          <WeeklySeriesTab />
        </TabsContent>

        <TabsContent value="moderation" className="mt-6">
          <ModerationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}