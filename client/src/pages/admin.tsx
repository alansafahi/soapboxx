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
import { Church, Calendar, Users, MessageSquare, Heart, Building, MapPin, Phone, Mail, Globe, Clock, Plus, Upload, X, Trophy, Settings, BookOpen, Video, Music, FileText, Edit, Trash2, Eye, Book, AlertTriangle, UserCheck, Tag, Flag, CheckCircle, XCircle, Filter, Search, Send, UserPlus, Calendar as CalendarIcon, UserCheck2, ClipboardList, Archive, Headphones, PlayCircle, User, Home, MapPinIcon, UserCog, HeartHandshake, Star } from "lucide-react";
import { insertChurchSchema, insertEventSchema, insertDevotionalSchema, insertWeeklySeriesSchema, insertSermonMediaSchema, insertPrayerFollowUpSchema, insertPrayerUpdateSchema, insertPrayerAssignmentSchema } from "@shared/schema";
import { ChurchProfileManager } from "@/components/church-profile-manager";
import { MemberManagementSystem } from "@/components/MemberManagementSystem";
import { SessionsManagement } from "@/components/SessionsManagement";
import { CounselingManagement } from "@/components/CounselingManagement";
import { EventManagement } from "@/components/EventManagement";
import MediaManagementSystem from "@/components/MediaManagementSystem";

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

const prayerFollowUpFormSchema = insertPrayerFollowUpSchema.extend({
  nextFollowUpDate: z.string().optional(),
});

const prayerAssignmentFormSchema = insertPrayerAssignmentSchema.extend({});

// Notification form schemas
const notificationFormSchema = z.object({
  type: z.enum(["scripture", "event", "message", "prayer"]),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  scheduledFor: z.string().min(1, "Schedule date/time is required"),
  timezone: z.string().default("America/Los_Angeles"),
  targetAudience: z.enum(["all", "members", "leaders", "group"]),
  targetGroupId: z.coerce.number().optional(),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.enum(["daily", "weekly", "monthly"]).optional(),
  recurringDays: z.array(z.string()).optional(),
  endDate: z.string().optional(),
});

const scriptureScheduleFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  scriptures: z.array(z.string()).min(1, "At least one scripture is required"),
  targetAudience: z.enum(["all", "members", "leaders", "group"]),
  targetGroupId: z.coerce.number().optional(),
  scheduleTime: z.string().min(1, "Schedule time is required"),
  timezone: z.string().default("America/Los_Angeles"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
});

type ChurchFormData = z.infer<typeof churchFormSchema>;
type EventFormData = z.infer<typeof eventFormSchema>;
type DevotionalFormData = z.infer<typeof devotionalFormSchema>;
type WeeklySeriesFormData = z.infer<typeof weeklySeriesFormSchema>;
type SermonMediaFormData = z.infer<typeof sermonMediaFormSchema>;
type PrayerFollowUpFormData = z.infer<typeof prayerFollowUpFormSchema>;
type PrayerAssignmentFormData = z.infer<typeof prayerAssignmentFormSchema>;
type NotificationFormData = z.infer<typeof notificationFormSchema>;
type ScriptureScheduleFormData = z.infer<typeof scriptureScheduleFormSchema>;

// File type validation function
function validateFileType(file: File, mediaType: string): boolean {
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.split('.').pop() || '';
  
  switch (mediaType) {
    case 'audio':
      return ['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg'].includes(fileExtension);
    case 'video':
      return ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv'].includes(fileExtension);
    case 'document':
      return ['pdf', 'doc', 'docx', 'txt'].includes(fileExtension);
    default:
      return false;
  }
}

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

// Media Library Stats component
function MediaLibraryStats() {
  const { data: media, isLoading } = useQuery({
    queryKey: ['/api/sermon-media'],
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <div className="text-sm text-gray-600 dark:text-gray-400">Loading library stats...</div>;

  const mediaList = Array.isArray(media) ? media : [];
  
  // Count by media type
  const audioCounts = mediaList.filter(m => m.mediaType === 'audio').length;
  const videoCounts = mediaList.filter(m => m.mediaType === 'video').length;
  const documentCounts = mediaList.filter(m => m.mediaType === 'document').length;
  
  const totalFiles = audioCounts + videoCounts + documentCounts;

  return (
    <div className="text-sm text-gray-600 dark:text-gray-400">
      Library: {audioCounts} audio, {videoCounts} video{documentCounts > 0 ? `, ${documentCounts} document` : ''} files ({totalFiles} total)
    </div>
  );
}

// Published series viewer
function PublishedSeries() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  
  const { data: series, isLoading } = useQuery({
    queryKey: ['/api/weekly-series'],
    staleTime: 5 * 60 * 1000,
  });

  const { toast } = useToast();

  const deleteSeriesMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/weekly-series/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Weekly series deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-series"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete weekly series. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteSeries = (seriesItem: any) => {
    if (window.confirm(`Are you sure you want to delete "${seriesItem.title}"? This action cannot be undone.`)) {
      deleteSeriesMutation.mutate(seriesItem.id);
    }
  };

  if (isLoading) return <div className="text-center py-4">Loading published series...</div>;

  const seriesList = Array.isArray(series) ? series : [];
  const publishedSeries = seriesList.filter(s => s.isActive && s.createdAt);

  // Filter by selected year and month
  const filteredSeries = publishedSeries.filter(s => {
    const createdDate = new Date(s.createdAt);
    const matchesYear = createdDate.getFullYear() === selectedYear;
    const matchesMonth = selectedMonth === 'all' || createdDate.getMonth() === selectedMonth;
    return matchesYear && matchesMonth;
  });

  // Get available years and months for filters
  const yearsList = publishedSeries.map(s => new Date(s.createdAt).getFullYear());
  const uniqueYears = new Set(yearsList);
  const availableYears = Array.from(uniqueYears).sort((a, b) => b - a);
  
  const monthsList = selectedYear ? 
    publishedSeries
      .filter(s => new Date(s.createdAt).getFullYear() === selectedYear)
      .map(s => new Date(s.createdAt).getMonth()) : [];
  const uniqueMonths = new Set(monthsList);
  const availableMonths = Array.from(uniqueMonths).sort((a, b) => a - b);

  // Group filtered series by month and year
  const groupedByMonth = filteredSeries.reduce((acc: any, seriesItem: any) => {
    const createdDate = new Date(seriesItem.createdAt);
    const monthKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}`;
    const monthName = createdDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        monthName,
        series: []
      };
    }
    acc[monthKey].series.push(seriesItem);
    return acc;
  }, {});

  // Sort each month's series by date (newest first)
  Object.values(groupedByMonth).forEach((month: any) => {
    month.series.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  const monthEntries = Object.entries(groupedByMonth).sort(([a], [b]) => b.localeCompare(a));
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Published Series</h3>
        <Badge variant="outline">{filteredSeries.length} series</Badge>
      </div>
      
      {/* Year and Month Filters */}
      <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Year:</label>
          <Select value={selectedYear.toString()} onValueChange={(value) => {
            setSelectedYear(parseInt(value));
            setSelectedMonth('all');
          }}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Month:</label>
          <Select value={selectedMonth.toString()} onValueChange={(value) => {
            setSelectedMonth(value === 'all' ? 'all' : parseInt(value));
          }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {availableMonths.map(monthIndex => (
                <SelectItem key={monthIndex} value={monthIndex.toString()}>
                  {monthNames[monthIndex]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {monthEntries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No published series found
        </div>
      ) : (
        <div className="space-y-6">
          {monthEntries.map(([monthKey, { monthName, series }]: [string, any]) => (
            <div key={monthKey} className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <h4 className="font-medium">{monthName}</h4>
                <Badge variant="secondary" className="text-xs">{series.length}</Badge>
              </div>
              
              <div className="grid gap-3">
                {series.map((seriesItem: any) => (
                  <Card key={seriesItem.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Book className="h-4 w-4 text-purple-600" />
                          <h5 className="font-medium">{seriesItem.title}</h5>
                          <Badge variant="outline" className="text-xs">{seriesItem.category}</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {seriesItem.description?.substring(0, 120)}...
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(seriesItem.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {seriesItem.frequency}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSeries(seriesItem)}
                          disabled={deleteSeriesMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Published sermon media viewer
function PublishedSermonMedia() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  
  const { data: media, isLoading } = useQuery({
    queryKey: ['/api/sermon-media'],
    staleTime: 5 * 60 * 1000,
  });

  const { toast } = useToast();

  const deleteMediaMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/sermon-media/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sermon media deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sermon-media"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete sermon media. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteMedia = (mediaItem: any) => {
    if (window.confirm(`Are you sure you want to delete "${mediaItem.title}"? This action cannot be undone.`)) {
      deleteMediaMutation.mutate(mediaItem.id);
    }
  };

  if (isLoading) return <div className="text-center py-4">Loading published sermon media...</div>;

  const mediaList = Array.isArray(media) ? media : [];
  const publishedMedia = mediaList.filter(m => m.isPublished && m.publishedAt);

  // Filter by selected year and month
  const filteredMedia = publishedMedia.filter(m => {
    const publishedDate = new Date(m.publishedAt);
    const matchesYear = publishedDate.getFullYear() === selectedYear;
    const matchesMonth = selectedMonth === 'all' || publishedDate.getMonth() === selectedMonth;
    return matchesYear && matchesMonth;
  });

  // Get available years and months for filters
  const yearsList = publishedMedia.map(m => new Date(m.publishedAt).getFullYear());
  const uniqueYears = new Set(yearsList);
  const availableYears = Array.from(uniqueYears).sort((a, b) => b - a);
  
  const monthsList = selectedYear ? 
    publishedMedia
      .filter(m => new Date(m.publishedAt).getFullYear() === selectedYear)
      .map(m => new Date(m.publishedAt).getMonth()) : [];
  const uniqueMonths = new Set(monthsList);
  const availableMonths = Array.from(uniqueMonths).sort((a, b) => a - b);

  // Group filtered media by month and year
  const groupedByMonth = filteredMedia.reduce((acc: any, mediaItem: any) => {
    const publishedDate = new Date(mediaItem.publishedAt);
    const monthKey = `${publishedDate.getFullYear()}-${publishedDate.getMonth()}`;
    const monthName = publishedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        monthName,
        media: []
      };
    }
    acc[monthKey].media.push(mediaItem);
    return acc;
  }, {});

  // Sort each month's media by date (newest first)
  Object.values(groupedByMonth).forEach((month: any) => {
    month.media.sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  });

  const monthEntries = Object.entries(groupedByMonth).sort(([a], [b]) => b.localeCompare(a));
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Published Sermon Media</h3>
        <Badge variant="outline">{filteredMedia.length} media files</Badge>
      </div>
      
      {/* Year and Month Filters */}
      <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Year:</label>
          <Select value={selectedYear.toString()} onValueChange={(value) => {
            setSelectedYear(parseInt(value));
            setSelectedMonth('all');
          }}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Month:</label>
          <Select value={selectedMonth.toString()} onValueChange={(value) => {
            setSelectedMonth(value === 'all' ? 'all' : parseInt(value));
          }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {availableMonths.map(monthIndex => (
                <SelectItem key={monthIndex} value={monthIndex.toString()}>
                  {monthNames[monthIndex]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {monthEntries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No published sermon media found
        </div>
      ) : (
        <div className="space-y-6">
          {monthEntries.map(([monthKey, { monthName, media }]: [string, any]) => (
            <div key={monthKey} className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <h4 className="font-medium">{monthName}</h4>
                <Badge variant="secondary" className="text-xs">{media.length}</Badge>
              </div>
              
              <div className="grid gap-3">
                {media.map((mediaItem: any) => (
                  <Card key={mediaItem.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {mediaItem.mediaType === 'video' ? (
                            <Video className="h-4 w-4 text-red-600" />
                          ) : (
                            <Music className="h-4 w-4 text-green-600" />
                          )}
                          <h5 className="font-medium">{mediaItem.title}</h5>
                          <Badge variant="outline" className="text-xs">{mediaItem.mediaType}</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {mediaItem.description?.substring(0, 120)}...
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(mediaItem.publishedAt).toLocaleDateString()}
                          </span>
                          {mediaItem.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {mediaItem.duration}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMedia(mediaItem)}
                          disabled={deleteMediaMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Published devotionals viewer
// Comprehensive Prayer Management System
function PrayerManagementSystem() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPrayer, setSelectedPrayer] = useState<any>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);

  const { data: prayers, isLoading } = useQuery({
    queryKey: ['/api/prayers'],
    staleTime: 30 * 1000, // 30 seconds for real-time updates
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
    staleTime: 5 * 60 * 1000,
  });

  const { toast } = useToast();

  // Prayer status update mutation
  const updatePrayerStatusMutation = useMutation({
    mutationFn: async ({ id, status, moderationNotes }: { id: number; status: string; moderationNotes?: string }) => {
      return await apiRequest("PATCH", `/api/prayers/${id}/status`, { status, moderationNotes });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Prayer status updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update prayer status.",
        variant: "destructive",
      });
    },
  });

  // Prayer assignment mutation
  const assignPrayerMutation = useMutation({
    mutationFn: async (data: PrayerAssignmentFormData) => {
      return await apiRequest("POST", "/api/prayer-assignments", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Prayer assigned successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      setShowAssignDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign prayer.",
        variant: "destructive",
      });
    },
  });

  // Follow-up creation mutation
  const createFollowUpMutation = useMutation({
    mutationFn: async (data: PrayerFollowUpFormData) => {
      return await apiRequest("POST", "/api/prayer-follow-ups", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Follow-up scheduled successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      setShowFollowUpDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule follow-up.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) return <div className="text-center py-4">Loading prayers...</div>;

  const prayerList = Array.isArray(prayers) ? prayers : [];
  const userList = Array.isArray(users) ? users : [];

  // Filter prayers based on criteria
  const filteredPrayers = prayerList.filter(prayer => {
    const matchesStatus = filterStatus === 'all' || prayer.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || prayer.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || prayer.priority === filterPriority;
    const matchesSearch = searchQuery === '' || 
      prayer.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prayer.content?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
  });

  // Get prayer statistics
  const stats = {
    total: prayerList.length,
    pending: prayerList.filter(p => p.status === 'pending').length,
    approved: prayerList.filter(p => p.status === 'approved').length,
    flagged: prayerList.filter(p => p.status === 'flagged').length,
    urgent: prayerList.filter(p => p.isUrgent).length,
    needsFollowUp: prayerList.filter(p => p.followUpDate && new Date(p.followUpDate) <= new Date()).length,
  };

  const handleStatusUpdate = (prayer: any, status: string) => {
    const moderationNotes = status === 'flagged' ? 
      prompt('Please provide moderation notes:') : undefined;
    
    if (status === 'flagged' && !moderationNotes) return;
    
    updatePrayerStatusMutation.mutate({ 
      id: prayer.id, 
      status, 
      moderationNotes 
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      flagged: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      normal: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return variants[priority as keyof typeof variants] || variants.normal;
  };

  return (
    <div className="space-y-6">
      {/* Prayer Management Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Prayers</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Flagged</p>
              <p className="text-2xl font-bold">{stats.flagged}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Urgent</p>
              <p className="text-2xl font-bold">{stats.urgent}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Follow-ups Due</p>
              <p className="text-2xl font-bold">{stats.needsFollowUp}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prayers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="guidance">Guidance</SelectItem>
              <SelectItem value="gratitude">Gratitude</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => {
              setFilterStatus('all');
              setFilterCategory('all');
              setFilterPriority('all');
              setSearchQuery('');
            }}
            variant="outline"
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Prayer List */}
      {filteredPrayers.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No prayers found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPrayers.map((prayer: any) => (
            <Card key={prayer.id} className="p-6">
              <div className="space-y-4">
                {/* Prayer Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {prayer.isUrgent && (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <h4 className="font-medium">{prayer.title || 'Prayer Request'}</h4>
                      <Badge className={getStatusBadge(prayer.status)}>
                        {prayer.status}
                      </Badge>
                      <Badge className={getPriorityBadge(prayer.priority)}>
                        {prayer.priority}
                      </Badge>
                      {prayer.category && (
                        <Badge variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {prayer.category}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {prayer.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {prayer.prayerCount || 0} prayers
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(prayer.createdAt).toLocaleDateString()}
                      </span>
                      {prayer.assignedTo && (
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />
                          Assigned
                        </span>
                      )}
                      {prayer.followUpDate && (
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          Follow-up: {new Date(prayer.followUpDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {prayer.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(prayer, 'approved')}
                          disabled={updatePrayerStatusMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(prayer, 'flagged')}
                          disabled={updatePrayerStatusMutation.isPending}
                        >
                          <Flag className="h-4 w-4 mr-1" />
                          Flag
                        </Button>
                      </>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPrayer(prayer);
                        setShowAssignDialog(true);
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Assign
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPrayer(prayer);
                        setShowFollowUpDialog(true);
                      }}
                    >
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Follow-up
                    </Button>
                    
                    {prayer.status !== 'archived' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(prayer, 'archived')}
                        disabled={updatePrayerStatusMutation.isPending}
                      >
                        Archive
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Moderation Notes */}
                {prayer.moderationNotes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Moderation Notes:</p>
                    <p className="text-sm text-yellow-700">{prayer.moderationNotes}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Prayer Request</DialogTitle>
            <DialogDescription>
              Assign "{selectedPrayer?.title || 'Prayer Request'}" to a team member for pastoral care.
            </DialogDescription>
          </DialogHeader>
          <AssignmentForm
            prayer={selectedPrayer}
            users={userList}
            onSubmit={(data) => assignPrayerMutation.mutate(data)}
            isLoading={assignPrayerMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Follow-up Dialog */}
      <Dialog open={showFollowUpDialog} onOpenChange={setShowFollowUpDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Follow-up</DialogTitle>
            <DialogDescription>
              Create a follow-up reminder for "{selectedPrayer?.title || 'Prayer Request'}".
            </DialogDescription>
          </DialogHeader>
          <FollowUpForm
            prayer={selectedPrayer}
            onSubmit={(data) => createFollowUpMutation.mutate(data)}
            isLoading={createFollowUpMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Assignment Form Component
function AssignmentForm({ prayer, users, onSubmit, isLoading }: {
  prayer: any;
  users: any[];
  onSubmit: (data: PrayerAssignmentFormData) => void;
  isLoading: boolean;
}) {
  const form = useForm<PrayerAssignmentFormData>({
    resolver: zodResolver(prayerAssignmentFormSchema),
    defaultValues: {
      prayerRequestId: prayer?.id,
      assignedBy: '', // Will be set by backend to current user
      assignedTo: '',
      role: 'pastor',
      notes: '',
    },
  });

  const handleSubmit = (data: PrayerAssignmentFormData) => {
    onSubmit({
      ...data,
      prayerRequestId: prayer.id,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign To *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pastor">Pastor</SelectItem>
                  <SelectItem value="prayer_team">Prayer Team</SelectItem>
                  <SelectItem value="counselor">Counselor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignment Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Special instructions or context for the assignee..."
                  {...field}
                  className="min-h-[80px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Assigning..." : "Assign Prayer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Follow-up Form Component
function FollowUpForm({ prayer, onSubmit, isLoading }: {
  prayer: any;
  onSubmit: (data: PrayerFollowUpFormData) => void;
  isLoading: boolean;
}) {
  const { user } = useAuth();
  const form = useForm<PrayerFollowUpFormData>({
    resolver: zodResolver(prayerFollowUpFormSchema),
    defaultValues: {
      prayerRequestId: prayer?.id,
      adminId: user?.id || '',
      followUpType: 'check_in',
      notes: '',
      nextFollowUpDate: '',
    },
  });

  const handleSubmit = (data: PrayerFollowUpFormData) => {
    const submitData = {
      ...data,
      prayerRequestId: prayer.id,
      adminId: user?.id || '',
      nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate).toISOString() : undefined,
    };
    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="followUpType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Follow-up Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select follow-up type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="check_in">Check-in</SelectItem>
                  <SelectItem value="update">Update Request</SelectItem>
                  <SelectItem value="encouragement">Encouragement</SelectItem>
                  <SelectItem value="resolved">Mark Resolved</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Follow-up Notes *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notes about this follow-up and what needs to be done..."
                  {...field}
                  className="min-h-[80px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextFollowUpDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next Follow-up Date</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? "Scheduling..." : "Schedule Follow-up"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function PublishedDevotionals() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  
  const { data: devotionals, isLoading } = useQuery({
    queryKey: ['/api/devotionals'],
    staleTime: 5 * 60 * 1000,
  });

  const { toast } = useToast();

  const deleteDevotionalMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/devotionals/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Devotional deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/devotionals"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete devotional. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteDevotional = (devotional: any) => {
    if (window.confirm(`Are you sure you want to delete "${devotional.title}"? This action cannot be undone.`)) {
      deleteDevotionalMutation.mutate(devotional.id);
    }
  };

  if (isLoading) return <div className="text-center py-4">Loading published devotionals...</div>;

  const devotionalList = Array.isArray(devotionals) ? devotionals : [];
  const publishedDevotionals = devotionalList.filter(d => d.isPublished && d.publishedAt);

  // Filter by selected year and month
  const filteredDevotionals = publishedDevotionals.filter(d => {
    const publishedDate = new Date(d.publishedAt);
    const matchesYear = publishedDate.getFullYear() === selectedYear;
    const matchesMonth = selectedMonth === 'all' || publishedDate.getMonth() === selectedMonth;
    return matchesYear && matchesMonth;
  });

  // Get available years and months for filters
  const yearsList = publishedDevotionals.map(d => new Date(d.publishedAt).getFullYear());
  const uniqueYears = new Set(yearsList);
  const availableYears = Array.from(uniqueYears).sort((a, b) => b - a);
  
  const monthsList = selectedYear ? 
    publishedDevotionals
      .filter(d => new Date(d.publishedAt).getFullYear() === selectedYear)
      .map(d => new Date(d.publishedAt).getMonth()) : [];
  const uniqueMonths = new Set(monthsList);
  const availableMonths = Array.from(uniqueMonths).sort((a, b) => a - b);

  // Group filtered devotionals by month and year
  const groupedByMonth = filteredDevotionals.reduce((acc: any, devotional: any) => {
    const publishedDate = new Date(devotional.publishedAt);
    const monthKey = `${publishedDate.getFullYear()}-${publishedDate.getMonth()}`;
    const monthName = publishedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        monthName,
        devotionals: []
      };
    }
    acc[monthKey].devotionals.push(devotional);
    return acc;
  }, {});

  // Sort each month's devotionals by date (newest first)
  Object.values(groupedByMonth).forEach((month: any) => {
    month.devotionals.sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  });

  const monthEntries = Object.entries(groupedByMonth).sort(([a], [b]) => b.localeCompare(a));
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Published Devotionals</h3>
        <Badge variant="outline">{filteredDevotionals.length} devotionals</Badge>
      </div>
      
      {/* Year and Month Filters */}
      <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Year:</label>
          <Select value={selectedYear.toString()} onValueChange={(value) => {
            setSelectedYear(parseInt(value));
            setSelectedMonth('all'); // Reset month when year changes
          }}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Month:</label>
          <Select value={selectedMonth.toString()} onValueChange={(value) => {
            setSelectedMonth(value === 'all' ? 'all' : parseInt(value));
          }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {availableMonths.map(monthIndex => (
                <SelectItem key={monthIndex} value={monthIndex.toString()}>
                  {monthNames[monthIndex]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {monthEntries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No published devotionals found
        </div>
      ) : (
        <div className="space-y-6">
          {monthEntries.map(([monthKey, { monthName, devotionals }]: [string, any]) => (
            <div key={monthKey} className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <h4 className="font-medium">{monthName}</h4>
                <Badge variant="secondary" className="text-xs">{devotionals.length}</Badge>
              </div>
              
              <div className="grid gap-3">
                {devotionals.map((devotional) => (
                  <Card key={devotional.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <h5 className="font-medium">{devotional.title}</h5>
                          <Badge variant="outline" className="text-xs">{devotional.category}</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {devotional.content.substring(0, 120)}...
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            Published: {new Date(devotional.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {devotional.verseReference && (
                            <span className="flex items-center gap-1">
                              <Book className="h-3 w-3" />
                              {devotional.verseReference}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDevotional(devotional)}
                          disabled={deleteDevotionalMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
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
  
  // Dialog state management
  const [isChurchDialogOpen, setIsChurchDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isDevotionalDialogOpen, setIsDevotionalDialogOpen] = useState(false);
  const [isSeriesDialogOpen, setIsSeriesDialogOpen] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
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
      setIsChurchDialogOpen(false);
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
      setDevotionalForm({ title: '', category: '', verseReference: '', content: '', churchId: selectedChurch });
      setIsDevotionalDialogOpen(false);
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
      return await apiRequest("POST", "/api/weekly-series", {
        ...data,
        isPublished: true
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Weekly series created successfully!",
      });
      setWeeklySeriesForm({ title: '', description: '', startDate: '', endDate: '', frequency: '', churchId: selectedChurch });
      setIsSeriesDialogOpen(false);
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
      setSermonMediaForm({ title: '', speaker: '', mediaType: '', date: '', description: '', churchId: selectedChurch });
      setSermonMediaErrors({ title: false, speaker: false, date: false });
      setIsMediaDialogOpen(false);
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
      setDevotionalForm({ title: '', category: '', verseReference: '', content: '', churchId: selectedChurch });
      setIsDevotionalDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/drafts/devotionals"] });
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
      setWeeklySeriesForm({ title: '', description: '', startDate: '', endDate: '', frequency: '', churchId: selectedChurch });
      setIsSeriesDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/drafts/weekly-series"] });
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
      setSermonMediaForm({ title: '', speaker: '', mediaType: '', date: '', description: '', churchId: selectedChurch });
      setSermonMediaErrors({ title: false, speaker: false, date: false });
      setIsMediaDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/drafts/sermon-media"] });
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

  // Form validation errors
  const [sermonMediaErrors, setSermonMediaErrors] = useState({
    title: false,
    speaker: false,
    date: false,
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
    // Reset previous errors
    setSermonMediaErrors({
      title: false,
      speaker: false,
      date: false,
    });

    // Check for missing required fields
    const missingFields = [];
    const newErrors = {
      title: !sermonMediaForm.title,
      speaker: !sermonMediaForm.speaker,
      date: !sermonMediaForm.date,
    };

    if (newErrors.title) missingFields.push("Title");
    if (newErrors.speaker) missingFields.push("Speaker");
    if (newErrors.date) missingFields.push("Date");

    if (missingFields.length > 0) {
      setSermonMediaErrors(newErrors);
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    createSermonMediaMutation.mutate({
      ...sermonMediaForm,
      churchId: selectedChurch,
      date: new Date(sermonMediaForm.date).toISOString(),
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
              <Dialog open={isChurchDialogOpen} onOpenChange={setIsChurchDialogOpen}>
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
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="dashboard">
                  <Building className="h-4 w-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="people">
                  <Users className="h-4 w-4 mr-2" />
                  People
                </TabsTrigger>
                <TabsTrigger value="ministry">
                  <Heart className="h-4 w-4 mr-2" />
                  Ministry
                </TabsTrigger>
                <TabsTrigger value="media">
                  <Video className="h-4 w-4 mr-2" />
                  Media
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
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

              <TabsContent value="people" className="space-y-6">
                <MemberManagementSystem selectedChurch={selectedChurch} />
              </TabsContent>

              <TabsContent value="ministry" className="space-y-6">
                <Tabs defaultValue="events" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="events">
                      <Calendar className="h-4 w-4 mr-2" />
                      Events
                    </TabsTrigger>
                    <TabsTrigger value="content">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Content
                    </TabsTrigger>
                    <TabsTrigger value="discussions">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Discussions
                    </TabsTrigger>
                    <TabsTrigger value="prayers">
                      <Heart className="h-4 w-4 mr-2" />
                      Prayers
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="events" className="space-y-6">
                    <EventManagement />
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
                      <Dialog open={isDevotionalDialogOpen} onOpenChange={setIsDevotionalDialogOpen}>
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
                      <Dialog open={isSeriesDialogOpen} onOpenChange={setIsSeriesDialogOpen}>
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
                      <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
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
                              <Label htmlFor="media-title" className={sermonMediaErrors.title ? "text-red-600" : ""}>
                                Title {sermonMediaErrors.title && <span className="text-red-600">*</span>}
                              </Label>
                              <Input 
                                id="media-title" 
                                placeholder="Sunday Service - Finding Hope"
                                value={sermonMediaForm.title}
                                onChange={(e) => {
                                  setSermonMediaForm({...sermonMediaForm, title: e.target.value});
                                  if (sermonMediaErrors.title) {
                                    setSermonMediaErrors({...sermonMediaErrors, title: false});
                                  }
                                }}
                                className={sermonMediaErrors.title ? "border-red-500 focus:border-red-500" : ""}
                              />
                              {sermonMediaErrors.title && (
                                <p className="text-sm text-red-600 mt-1">Title is required</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="media-speaker" className={sermonMediaErrors.speaker ? "text-red-600" : ""}>
                                Speaker {sermonMediaErrors.speaker && <span className="text-red-600">*</span>}
                              </Label>
                              <Input 
                                id="media-speaker" 
                                placeholder="Pastor John Smith"
                                value={sermonMediaForm.speaker}
                                onChange={(e) => {
                                  setSermonMediaForm({...sermonMediaForm, speaker: e.target.value});
                                  if (sermonMediaErrors.speaker) {
                                    setSermonMediaErrors({...sermonMediaErrors, speaker: false});
                                  }
                                }}
                                className={sermonMediaErrors.speaker ? "border-red-500 focus:border-red-500" : ""}
                              />
                              {sermonMediaErrors.speaker && (
                                <p className="text-sm text-red-600 mt-1">Speaker is required</p>
                              )}
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
                              <Label htmlFor="media-date" className={sermonMediaErrors.date ? "text-red-600" : ""}>
                                Date {sermonMediaErrors.date && <span className="text-red-600">*</span>}
                              </Label>
                              <Input 
                                id="media-date" 
                                type="date"
                                value={sermonMediaForm.date}
                                onChange={(e) => {
                                  setSermonMediaForm({...sermonMediaForm, date: e.target.value});
                                  if (sermonMediaErrors.date) {
                                    setSermonMediaErrors({...sermonMediaErrors, date: false});
                                  }
                                }}
                                className={sermonMediaErrors.date ? "border-red-500 focus:border-red-500" : ""}
                              />
                              {sermonMediaErrors.date && (
                                <p className="text-sm text-red-600 mt-1">Date is required</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="media-file">File Upload</Label>
                              <Input 
                                id="media-file" 
                                type="file" 
                                accept={
                                  sermonMediaForm.mediaType === 'audio' ? 'audio/*' :
                                  sermonMediaForm.mediaType === 'video' ? 'video/*' :
                                  sermonMediaForm.mediaType === 'document' ? '.pdf,.doc,.docx,.txt' :
                                  'audio/*,video/*,.pdf,.doc,.docx,.txt'
                                }
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file && sermonMediaForm.mediaType) {
                                    const isValidFileType = validateFileType(file, sermonMediaForm.mediaType);
                                    if (!isValidFileType) {
                                      alert(`Invalid file type for ${sermonMediaForm.mediaType}. Please select an appropriate file.`);
                                      e.target.value = '';
                                      return;
                                    }
                                  }
                                }}
                              />
                              {sermonMediaForm.mediaType && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {sermonMediaForm.mediaType === 'audio' && 'Accepted: MP3, WAV, M4A, AAC'}
                                  {sermonMediaForm.mediaType === 'video' && 'Accepted: MP4, MOV, AVI, MKV'}
                                  {sermonMediaForm.mediaType === 'document' && 'Accepted: PDF, DOC, DOCX, TXT'}
                                </div>
                              )}
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
                      <MediaLibraryStats />
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

              <TabsContent value="published" className="space-y-6">
                <Tabs defaultValue="devotionals" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="devotionals">Devotionals</TabsTrigger>
                    <TabsTrigger value="series">Series</TabsTrigger>
                    <TabsTrigger value="media">Sermon Media</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="devotionals" className="space-y-4">
                    <PublishedDevotionals />
                  </TabsContent>
                  
                  <TabsContent value="series" className="space-y-4">
                    <PublishedSeries />
                  </TabsContent>
                  
                  <TabsContent value="media" className="space-y-4">
                    <PublishedSermonMedia />
                  </TabsContent>
                </Tabs>
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
                    <PrayerManagementSystem />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="media" className="space-y-6">
                <MediaManagementSystem />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <ChurchProfileManager churchId={selectedChurch} />
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