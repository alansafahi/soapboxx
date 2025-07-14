import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, addDays } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { useLanguage } from "../contexts/LanguageContext";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// Icons
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  Filter,
  ThumbsUp,
  CalendarPlus,
  ChevronDown,
  Download,
  Video,
  Search,
  Grid,
  List,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Send,
  Link,
  Mail,
} from "lucide-react";

interface Event {
  id: number;
  title: string;
  description: string | null;
  eventDate: string;
  endDate: string | null;
  location: string | null;
  category: string | null;
  priority: string | null;
  isOnline: boolean | null;
}

export default function EventsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [favorites, setFavorites] = useState(new Set<number>());
  const [reminders, setReminders] = useState(new Set<number>());
  const [watchedEvents, setWatchedEvents] = useState(new Set<number>());
  const [userLikes, setUserLikes] = useState(new Set<number>());
  const [eventLikes, setEventLikes] = useState<Record<number, number>>({});
  const [rsvpStatus, setRsvpStatus] = useState(new Map<number, string>());
  const [animatingButtons, setAnimatingButtons] = useState(new Set<number>());
  const [showComments, setShowComments] = useState<Record<number, boolean>>({});
  const [eventComments, setEventComments] = useState<Record<number, any[]>>({});
  const [newComment, setNewComment] = useState("");

  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: number; status: string }) => {
      return apiRequest("PUT", `/api/events/${eventId}/rsvp`, { status });
    },
    onSuccess: (_, { eventId, status }) => {
      setRsvpStatus(prev => new Map(prev).set(eventId, status));
      setAnimatingButtons(prev => new Set(prev).add(eventId));
      setTimeout(() => {
        setAnimatingButtons(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
      }, 400);
      
      // Auto-add to calendar and set reminder for positive RSVPs
      if (status === 'attending' || status === 'maybe') {
        const event = (events as Event[]).find((e: Event) => e.id === eventId);
        if (event) {
          // Automatically set reminder
          setReminders(prev => new Set(prev).add(eventId));
          
          // Show toast with calendar option
          toast({
            title: "RSVP Updated",
            description: `You are now ${status.replace('_', ' ')} this event.`,
            action: (
              <div className="flex gap-2">
                <button
                  onClick={() => addToGoogleCalendar(event)}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Add to Calendar
                </button>
              </div>
            ),
          });
        }
      } else {
        toast({
          title: "RSVP Updated",
          description: `You are now ${status.replace('_', ' ')} this event.`,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
  });

  // Helper functions
  const addToGoogleCalendar = (event: Event) => {
    const startDate = new Date(event.eventDate);
    const endDate = event.endDate ? new Date(event.endDate) : addDays(startDate, 1);
    
    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;
    window.open(googleUrl, '_blank');
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: format(date, "MMM"),
      day: format(date, "d"),
      year: format(date, "yyyy"),
    };
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    if (!end || format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd")) {
      return format(start, "h:mm a");
    }
    
    return `${format(start, "MMM d, h:mm a")} - ${format(end, "MMM d, h:mm a")}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      service: "bg-blue-100 text-blue-800",
      bible_study: "bg-green-100 text-green-800",
      community_service: "bg-yellow-100 text-yellow-800",
      social: "bg-purple-100 text-purple-800",
      youth: "bg-pink-100 text-pink-800",
      music: "bg-indigo-100 text-indigo-800",
      outreach: "bg-orange-100 text-orange-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (format(date, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd")) return "Tomorrow";
    return format(date, "EEE");
  };

  const getWeatherInfo = (event: Event) => {
    if (event.isOnline) return null;
    // Mock weather data - in production, integrate with weather API
    const conditions = ["sunny", "cloudy", "rainy", "snowy"];
    const temps = [65, 72, 58, 45];
    const randomIndex = event.id % conditions.length;
    return {
      condition: conditions[randomIndex],
      temp: temps[randomIndex],
    };
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny": return <Sun className="w-3 h-3" />;
      case "cloudy": return <Cloud className="w-3 h-3" />;
      case "rainy": return <CloudRain className="w-3 h-3" />;
      case "snowy": return <Snowflake className="w-3 h-3" />;
      default: return <Sun className="w-3 h-3" />;
    }
  };

  // Event handlers
  const handleRSVP = (eventId: number, status: string) => {
    rsvpMutation.mutate({ eventId, status });
  };

  const toggleFavorite = (eventId: number) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
        toast({ title: "Removed from favorites" });
      } else {
        newSet.add(eventId);
        toast({ title: "Added to favorites" });
      }
      return newSet;
    });
  };

  const toggleReminder = (eventId: number) => {
    setReminders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
        toast({ title: "Reminder removed" });
      } else {
        newSet.add(eventId);
        toast({ title: "Reminder set" });
      }
      return newSet;
    });
  };

  const toggleWatchEvent = (eventId: number) => {
    setWatchedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
        toast({ title: "Stopped watching event" });
      } else {
        newSet.add(eventId);
        toast({ title: "Now watching event" });
      }
      return newSet;
    });
  };

  const likeEvent = (eventId: number) => {
    setUserLikes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
        setEventLikes(prev => ({ ...prev, [eventId]: (prev[eventId] || 1) - 1 }));
      } else {
        newSet.add(eventId);
        setEventLikes(prev => ({ ...prev, [eventId]: (prev[eventId] || 0) + 1 }));
      }
      return newSet;
    });
  };

  const shareEvent = async (event: Event) => {
    // Create proper event URL
    const eventUrl = `${window.location.origin}/events?event=${event.id}`;
    const shareText = `${event.title} 🙏 #SoapBoxApp`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description || "Join us for this event!",
          url: eventUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        toast({ title: "Event details copied to clipboard" });
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({ title: "Event details copied to clipboard" });
    }
  };

  const copyEventLink = async (event: Event) => {
    const eventUrl = `${window.location.origin}/events?event=${event.id}`;
    try {
      await navigator.clipboard.writeText(eventUrl);
      toast({ title: "Event link copied to clipboard" });
    } catch (error) {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  const shareToSocial = (event: Event, platform: string) => {
    const eventUrl = `${window.location.origin}/events?event=${event.id}`;
    const shareText = `Check out this event: ${event.title}`;
    
    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${eventUrl}`)}`;
        break;
      case "email":
        const subject = `Event: ${event.title}`;
        const body = `I wanted to share this event with you:\n\n${event.title}\n\n${event.description || ""}\n\nDate: ${format(new Date(event.eventDate), "PPP")}\n${event.location ? `Location: ${event.location}\n` : ""}\nMore details: ${eventUrl}`;
        shareUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const addComment = (eventId: number) => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      author: user?.firstName || "Anonymous",
      avatar: user?.profileImageUrl,
      text: newComment,
      timestamp: new Date().toISOString(),
    };

    setEventComments(prev => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), comment],
    }));
    setNewComment("");
    toast({ title: "Comment added" });
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event: Event) => {
      const matchesSearch = !searchTerm || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;

      const eventDate = new Date(event.eventDate);
      const now = new Date();
      const matchesTime = timeFilter === "all" ||
        (timeFilter === "today" && isToday(eventDate)) ||
        (timeFilter === "this_week" && eventDate <= addDays(now, 7)) ||
        (timeFilter === "this_month" && eventDate <= addDays(now, 30));

      return matchesSearch && matchesCategory && matchesTime;
    });
  }, [events, searchTerm, categoryFilter, timeFilter]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading events...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header and Filters */}
<Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {t('events.upcomingEvents')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enhanced Search and Filters */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/50 dark:to-blue-900/50 p-6 rounded-xl space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <Input
                  placeholder="Search events by name, location, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-white/80 dark:bg-gray-700/80 border-purple-200 dark:border-purple-600 focus:border-purple-400 focus:ring-purple-200 rounded-lg shadow-sm dark:text-white"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48 h-12 bg-white/80 dark:bg-gray-700/80 border-purple-200 dark:border-purple-600 focus:border-purple-400 rounded-lg shadow-sm dark:text-white">
                    <Filter className="w-4 h-4 mr-2 text-purple-400" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('events.allCategories')}</SelectItem>
                    <SelectItem value="service">🙏 Service</SelectItem>
                    <SelectItem value="bible_study">📖 Bible Study</SelectItem>
                    <SelectItem value="community_service">🤝 Community Service</SelectItem>
                    <SelectItem value="social">🎉 Social</SelectItem>
                    <SelectItem value="youth">👨‍👩‍👧‍👦 Youth</SelectItem>
                    <SelectItem value="music">🎵 Music</SelectItem>
                    <SelectItem value="outreach">🌍 Outreach</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-full sm:w-48 h-12 bg-white/80 dark:bg-gray-700/80 border-purple-200 dark:border-purple-600 focus:border-purple-400 rounded-lg shadow-sm dark:text-white">
                    <Clock className="w-4 h-4 mr-2 text-purple-400" />
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('events.allTime')}</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg" : "bg-white/80 hover:bg-white border-purple-200"}
                >
                  <List className="w-4 h-4 mr-2" />
                  {t('events.list')}
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className={viewMode === "calendar" ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg" : "bg-white/80 hover:bg-white border-purple-200"}
                >
                  <Grid className="w-4 h-4 mr-2" />
                  {t('events.calendar')}
                </Button>
              </div>
              {(searchTerm || categoryFilter !== "all" || timeFilter !== "all") && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setTimeFilter("all");
                  }}
                  className="text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                >
                  {t('common.clearFilters')}
                </Button>
              )}
            </div>
          </div>

          {/* Enhanced Quick Stats */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{filteredEvents.length} events found</span>
              </div>
              {searchTerm && (
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-600 dark:text-gray-400">Searching for "{searchTerm}"</span>
                </div>
              )}
              {categoryFilter !== "all" && (
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-600 dark:text-gray-400">{categoryFilter.replace('_', ' ')} category</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Events Display */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-0">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 px-8">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {searchTerm || categoryFilter !== "all" || timeFilter !== "all" 
                  ? "No Events Match Your Filters" 
                  : "No Upcoming Events"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto text-lg">
                {searchTerm || categoryFilter !== "all" || timeFilter !== "all"
                  ? "Try adjusting your search criteria or filters to find more events"
                  : "Check back soon for exciting community events and spiritual activities!"}
              </p>
              {(searchTerm || categoryFilter !== "all" || timeFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setTimeFilter("all");
                  }}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600 shadow-lg px-8 py-3"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4 p-6">
              <AnimatePresence>
                {filteredEvents.map((event: Event, index: number) => {
                  const dateInfo = formatEventDate(event.eventDate);
                  const eventDate = new Date(event.eventDate);
                  const isFavorite = favorites.has(event.id);
                  const userRsvp = rsvpStatus.get(event.id);
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-gradient-to-r from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/30 border border-purple-100 dark:border-purple-800 rounded-xl p-6 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-700 transition-all duration-300 group"
                    >
                      <div className="flex items-start space-x-6">
                        {/* Enhanced Date Display */}
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg relative">
                            <span className="text-xs font-medium uppercase tracking-wide opacity-90">
                              {dateInfo.month}
                            </span>
                            <span className="text-2xl font-bold">
                              {dateInfo.day}
                            </span>
                            <span className="text-xs opacity-90">
                              {getDateLabel(eventDate)}
                            </span>
                            {isToday(eventDate) && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Enhanced Event Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="font-bold text-gray-900 text-xl group-hover:text-purple-700 transition-colors">{event.title}</h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleFavorite(event.id)}
                                  className="p-2 h-auto opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-100"
                                >
                                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-current text-red-500" : "text-gray-400 hover:text-red-400"}`} />
                                </Button>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                {event.category && (
                                  <Badge className={`${getCategoryColor(event.category)} shadow-sm`}>
                                    {event.category.replace('_', ' ')}
                                  </Badge>
                                )}
                                {event.priority === 'high' && (
                                  <Badge variant="destructive" className="shadow-sm">High Priority</Badge>
                                )}
                                {userRsvp && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    ✓ {userRsvp}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Event Details */}
                          <div className="text-sm text-gray-600 space-y-2 mb-4">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="font-medium">
                                {formatDateRange(event.eventDate, event.endDate || undefined)}
                              </span>
                            </div>
                            
                            {event.location && (
                              <div className="flex items-center">
                                {event.isOnline ? (
                                  <Video className="w-4 h-4 mr-2 text-gray-400" />
                                ) : (
                                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                )}
                                <span>{event.location}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2 text-gray-400" />
                              <span>RSVP Available</span>
                            </div>
                          </div>
                          
                          {/* Event Description */}
                          {event.description && (
                            <p className="text-sm text-gray-700 mb-4 line-clamp-2 leading-relaxed">
                              {event.description}
                            </p>
                          )}
                          
                          {/* Enhanced Event Info */}
                          <div className="flex items-center gap-4 mb-3">
                            {/* Weather Info for Outdoor Events */}
                            {(() => {
                              const weather = getWeatherInfo(event);
                              return weather ? (
                                <div className="flex items-center gap-1 text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-md">
                                  {getWeatherIcon(weather.condition)}
                                  <span>{weather.temp}°F</span>
                                  <span className="capitalize">{weather.condition}</span>
                                </div>
                              ) : null;
                            })()}
                            
                            {/* Engagement Stats */}
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                <span>{eventLikes[event.id] || 0}</span>
                              </div>
                              {watchedEvents.has(event.id) && (
                                <div className="flex items-center gap-1 text-blue-600">
                                  <Eye className="w-3 h-3" />
                                  <span>Watching</span>
                                </div>
                              )}
                              {reminders.has(event.id) && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <Bell className="w-3 h-3" />
                                  <span>Reminder set</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-3">
                            {/* Primary Action Row */}
                            <div className="flex flex-wrap gap-2">
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                animate={animatingButtons.has(event.id) ? { 
                                  scale: [1, 1.05, 1], 
                                  backgroundColor: ["#f0f9ff", "#dbeafe", "#f0f9ff"] 
                                } : {}}
                                transition={{ duration: 0.4 }}
                              >
                                <Button 
                                  onClick={() => handleRSVP(event.id, userRsvp === "attending" ? "not_attending" : "attending")}
                                  variant={userRsvp === "attending" ? "default" : "outline"}
                                  size="sm"
                                  disabled={rsvpMutation.isPending}
                                  className="flex items-center gap-2"
                                >
                                  {rsvpMutation.isPending ? (
                                    "Processing..."
                                  ) : userRsvp === "attending" ? (
                                    <>✓ Attending</>
                                  ) : (
                                    <>RSVP</>
                                  )}
                                </Button>
                              </motion.div>

                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toggleFavorite(event.id)}
                                className={`flex items-center gap-1 ${favorites.has(event.id) ? 'text-red-500' : 'text-gray-500'}`}
                              >
                                <Heart className={`w-4 h-4 ${favorites.has(event.id) ? 'fill-current' : ''}`} />
                                {favorites.has(event.id) ? 'Saved' : 'Save'}
                              </Button>

                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toggleReminder(event.id)}
                                className={`flex items-center gap-1 ${reminders.has(event.id) ? 'text-green-600' : 'text-gray-500'}`}
                              >
                                {reminders.has(event.id) ? (
                                  <Bell className="w-4 h-4 fill-current" />
                                ) : (
                                  <BellOff className="w-4 h-4" />
                                )}
                                {reminders.has(event.id) ? 'Reminder On' : 'Set Reminder'}
                              </Button>

                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => likeEvent(event.id)}
                                className={`flex items-center gap-1 ${userLikes.has(event.id) ? 'text-blue-600' : 'text-gray-500'}`}
                              >
                                <ThumbsUp className={`w-4 h-4 ${userLikes.has(event.id) ? 'fill-current' : ''}`} />
                                Like
                              </Button>
                            </div>

                            {/* Secondary Action Row */}
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toggleWatchEvent(event.id)}
                                className={`flex items-center gap-1 ${watchedEvents.has(event.id) ? 'text-blue-600' : 'text-gray-500'}`}
                              >
                                {watchedEvents.has(event.id) ? (
                                  <Eye className="w-4 h-4" />
                                ) : (
                                  <EyeOff className="w-4 h-4" />
                                )}
                                {watchedEvents.has(event.id) ? 'Watching' : 'Watch'}
                              </Button>

                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setShowComments(prev => ({
                                  ...prev,
                                  [event.id]: !prev[event.id]
                                }))}
                                className="flex items-center gap-1"
                              >
                                <MessageCircle className="w-4 h-4" />
                                Comments ({(eventComments[event.id] || []).length})
                              </Button>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MessageCircle className="w-4 h-4 mr-1" />
                                    Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <Calendar className="w-5 h-5" />
                                      {event.title}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <strong>Date:</strong> {format(new Date(event.eventDate), "PPP")}
                                      </div>
                                      <div>
                                        <strong>Time:</strong> {formatDateRange(event.eventDate, event.endDate || undefined)}
                                      </div>
                                      {event.location && (
                                        <div className="col-span-2">
                                          <strong>Location:</strong> {event.location}
                                        </div>
                                      )}
                                    </div>
                                    {event.description && (
                                      <div>
                                        <strong>Description:</strong>
                                        <p className="mt-2 text-gray-700">{event.description}</p>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="flex items-center gap-1"
                                  >
                                    <Share2 className="w-4 h-4" />
                                    Share
                                    <ChevronDown className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    onClick={() => copyEventLink(event)}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Link className="w-4 h-4" />
                                      Copy Event Link
                                    </div>
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem
                                    onClick={() => shareEvent(event)}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Share2 className="w-4 h-4" />
                                      Native Share
                                    </div>
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuSeparator />
                                  
                                  <DropdownMenuItem
                                    onClick={() => shareToSocial(event, 'facebook')}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
                                      Facebook
                                    </div>
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem
                                    onClick={() => shareToSocial(event, 'twitter')}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 bg-sky-500 rounded-sm"></div>
                                      Twitter
                                    </div>
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem
                                    onClick={() => shareToSocial(event, 'whatsapp')}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                                      WhatsApp
                                    </div>
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem
                                    onClick={() => shareToSocial(event, 'email')}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Mail className="w-4 h-4" />
                                      Email
                                    </div>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="flex items-center gap-1"
                                  >
                                    <CalendarPlus className="w-4 h-4" />
                                    Add to Calendar
                                    <ChevronDown className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const startDate = new Date(event.eventDate);
                                      const endDate = event.endDate ? new Date(event.endDate) : addDays(startDate, 1);
                                      
                                      const formatGoogleDate = (date: Date) => {
                                        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
                                      };
                                      
                                      const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;
                                      window.open(googleUrl, '_blank');
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-sm"></div>
                                      Google Calendar
                                    </div>
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const startDate = new Date(event.eventDate);
                                      const endDate = event.endDate ? new Date(event.endDate) : addDays(startDate, 1);
                                      
                                      const formatOutlookDate = (date: Date) => {
                                        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
                                      };
                                      
                                      const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${formatOutlookDate(startDate)}&enddt=${formatOutlookDate(endDate)}&body=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;
                                      window.open(outlookUrl, '_blank');
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
                                      Outlook Calendar
                                    </div>
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const startDate = new Date(event.eventDate);
                                      const endDate = event.endDate ? new Date(event.endDate) : addDays(startDate, 1);
                                      
                                      const yahooUrl = `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(event.title)}&st=${Math.floor(startDate.getTime()/1000)}&dur=${Math.floor((endDate.getTime() - startDate.getTime())/1000/3600)}&desc=${encodeURIComponent(event.description || '')}&in_loc=${encodeURIComponent(event.location || '')}`;
                                      window.open(yahooUrl, '_blank');
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 bg-purple-600 rounded-sm"></div>
                                      Yahoo Calendar
                                    </div>
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuSeparator />
                                  
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const startDate = new Date(event.eventDate);
                                      const endDate = event.endDate ? new Date(event.endDate) : addDays(startDate, 1);
                                      
                                      const formatDate = (date: Date) => {
                                        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
                                      };
                                      
                                      const icsContent = [
                                        'BEGIN:VCALENDAR',
                                        'VERSION:2.0',
                                        'PRODID:-//Church Events//EN',
                                        'BEGIN:VEVENT',
                                        `DTSTART:${formatDate(startDate)}`,
                                        `DTEND:${formatDate(endDate)}`,
                                        `SUMMARY:${event.title.replace(/,/g, '\\,')}`,
                                        `DESCRIPTION:${(event.description || '').replace(/,/g, '\\,').replace(/\n/g, '\\n')}`,
                                        `LOCATION:${(event.location || '').replace(/,/g, '\\,')}`,
                                        `UID:${event.id}@church-events`,
                                        'END:VEVENT',
                                        'END:VCALENDAR'
                                      ].join('\r\n');
                                      
                                      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                                      const link = document.createElement('a');
                                      link.href = URL.createObjectURL(blob);
                                      link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      URL.revokeObjectURL(link.href);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Download className="w-4 h-4" />
                                      Download ICS File
                                    </div>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Comments Section */}
                          {showComments[event.id] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 border-t pt-4"
                            >
                              <div className="space-y-3">
                                {/* Existing Comments */}
                                {eventComments[event.id]?.map((comment: any) => (
                                  <div key={comment.id} className="flex gap-3">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={comment.avatar} />
                                      <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">{comment.author}</span>
                                        <span className="text-xs text-gray-500">
                                          {format(new Date(comment.timestamp), 'MMM d, h:mm a')}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700">{comment.text}</p>
                                    </div>
                                  </div>
                                ))}
                                
                                {/* Add Comment */}
                                <div className="flex gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={user?.profileImageUrl} />
                                    <AvatarFallback>{user?.firstName?.charAt(0) || 'U'}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 flex gap-2">
                                    <Textarea
                                      placeholder="Add a comment..."
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                      className="min-h-[60px] resize-none"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => addComment(event.id)}
                                      disabled={!newComment.trim()}
                                    >
                                      <Send className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}