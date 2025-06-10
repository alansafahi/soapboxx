import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Video, Users, Search, Filter, Share2, CalendarPlus, Heart, MessageCircle, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isTomorrow, isThisWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, getDay } from "date-fns";
import type { Event } from "@shared/schema";

export default function EventsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rsvpStatus, setRsvpStatus] = useState<Map<number, string>>(new Map());
  const [animatingButtons, setAnimatingButtons] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch events
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: number; status: string }) => {
      await apiRequest("POST", `/api/events/${eventId}/rsvp`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "RSVP Confirmed",
        description: "Your RSVP has been recorded successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to RSVP. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("event-favorites");
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (eventId: number) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      localStorage.setItem("event-favorites", JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  // Filter and search logic
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;
    
    const eventDate = new Date(event.eventDate);
    const now = new Date();
    const matchesTime = (() => {
      switch (timeFilter) {
        case "favorites": return favorites.has(event.id);
        case "today": return isToday(eventDate);
        case "tomorrow": return isTomorrow(eventDate);
        case "this-week": return isThisWeek(eventDate);
        case "upcoming": return eventDate >= now;
        case "past": return eventDate < now;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesCategory && matchesTime;
  });

  // Get smart date label
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isThisWeek(date)) return format(date, "EEEE");
    return format(date, "MMM d");
  };

  // Share event function
  const shareEvent = async (event: Event) => {
    const shareData = {
      title: event.title,
      text: `Join us for ${event.title} at ${event.location || 'our church'}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareData.title} - ${shareData.text} ${shareData.url}`);
        toast({
          title: "Link Copied",
          description: "Event details copied to clipboard",
        });
      }
    } else {
      navigator.clipboard.writeText(`${shareData.title} - ${shareData.text} ${shareData.url}`);
      toast({
        title: "Link Copied",
        description: "Event details copied to clipboard",
      });
    }
  };

  const handleRSVP = (eventId: number, status: string) => {
    // Add animation state
    setAnimatingButtons(prev => new Set([...Array.from(prev), eventId]));
    
    // Update RSVP status optimistically
    setRsvpStatus(prev => new Map(prev).set(eventId, status));

    // Remove animation state after animation completes
    setTimeout(() => {
      setAnimatingButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }, 400);

    rsvpMutation.mutate({ eventId, status });
  };

  const formatEventDate = (date: string | Date) => {
    const eventDate = new Date(date);
    return {
      month: eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: eventDate.getDate(),
      time: eventDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
    };
  };

  const formatDateRange = (start: string | Date, end?: string | Date) => {
    const startDate = new Date(start);
    const startTime = startDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    if (end) {
      const endDate = new Date(end);
      const endTime = endDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      return `${startTime} - ${endTime}`;
    }
    
    return startTime;
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'service':
        return 'bg-blue-100 text-blue-800';
      case 'bible_study':
        return 'bg-yellow-100 text-yellow-800';
      case 'community_service':
        return 'bg-green-100 text-green-800';
      case 'social':
        return 'bg-purple-100 text-purple-800';
      case 'youth':
        return 'bg-pink-100 text-pink-800';
      case 'music':
        return 'bg-indigo-100 text-indigo-800';
      case 'outreach':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calendar helper functions
  const nextMonth = () => {
    setCurrentMonth(prev => addDays(prev, 32));
  };

  const prevMonth = () => {
    setCurrentMonth(prev => addDays(prev, -32));
  };

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event => 
      isSameDay(new Date(event.eventDate), day)
    );
  };

  const renderCalendarView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevMonth}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextMonth}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] p-2 border border-gray-100 rounded-lg relative
                    ${!isCurrentMonth ? "bg-gray-50 text-gray-400" : "bg-white"}
                    ${isToday ? "bg-blue-50 border-blue-200" : ""}
                    hover:bg-gray-50 transition-colors
                  `}
                >
                  <div className={`
                    text-sm font-medium mb-1
                    ${isToday ? "text-blue-600" : ""}
                  `}>
                    {format(day, "d")}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <Dialog key={event.id}>
                        <DialogTrigger asChild>
                          <div
                            className={`
                              text-xs p-1 rounded cursor-pointer truncate
                              ${getCategoryColor(event.category || 'other')}
                              hover:opacity-80 transition-opacity
                            `}
                            title={event.title}
                          >
                            {event.title}
                          </div>
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
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleRSVP(event.id, rsvpStatus.get(event.id) === "attending" ? "not_attending" : "attending")}
                                variant={rsvpStatus.get(event.id) === "attending" ? "default" : "outline"}
                                size="sm"
                                disabled={rsvpMutation.isPending}
                              >
                                {rsvpMutation.isPending ? "Processing..." : 
                                 rsvpStatus.get(event.id) === "attending" ? "✓ Attending" : "RSVP"}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => shareEvent(event)}
                              >
                                <Share2 className="w-4 h-4 mr-1" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                    
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Church Events
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("calendar")}
              >
                Calendar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events by title, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="bible_study">Bible Study</SelectItem>
                <SelectItem value="community_service">Community Service</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="youth">Youth</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="outreach">Outreach</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-40">
                <Clock className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past Events</SelectItem>
              </SelectContent>
            </Select>

            {favorites.size > 0 && (
              <Button
                variant={timeFilter === "favorites" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter(timeFilter === "favorites" ? "all" : "favorites")}
                className="flex items-center gap-2"
              >
                <Heart className={`w-4 h-4 ${timeFilter === "favorites" ? "fill-current text-white" : "text-red-500"}`} />
                Favorites ({favorites.size})
              </Button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 text-sm text-gray-600">
            <span>{filteredEvents.length} events found</span>
            {searchTerm && <span>• Searching for "{searchTerm}"</span>}
            {categoryFilter !== "all" && <span>• {categoryFilter.replace('_', ' ')} category</span>}
          </div>
        </CardContent>
      </Card>

      {/* Events Display */}
      {viewMode === "calendar" ? (
        renderCalendarView()
      ) : (
        <Card>
          <CardContent className="p-0">
            {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchTerm || categoryFilter !== "all" || timeFilter !== "all" 
                  ? "No events match your filters" 
                  : "No upcoming events"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || categoryFilter !== "all" || timeFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Check back soon for community events and activities!"}
              </p>
              {(searchTerm || categoryFilter !== "all" || timeFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setTimeFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredEvents.map((event, index) => {
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
                      className="p-6 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-start space-x-4">
                        {/* Enhanced Date Display */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex flex-col items-center justify-center border border-blue-200 relative">
                            <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                              {dateInfo.month}
                            </span>
                            <span className="text-xl font-bold text-blue-800">
                              {dateInfo.day}
                            </span>
                            <span className="text-xs text-blue-600">
                              {getDateLabel(eventDate)}
                            </span>
                            {isToday(eventDate) && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Event Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleFavorite(event.id)}
                                  className="p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-current text-red-500" : "text-gray-400"}`} />
                                </Button>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                {event.category && (
                                  <Badge className={getCategoryColor(event.category)}>
                                    {event.category.replace('_', ' ')}
                                  </Badge>
                                )}
                                {event.priority === 'high' && (
                                  <Badge variant="destructive">High Priority</Badge>
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
                            
                            {event.attendeeCount !== undefined && (
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{event.attendeeCount} attending</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Event Description */}
                          {event.description && (
                            <p className="text-sm text-gray-700 mb-4 line-clamp-2 leading-relaxed">
                              {event.description}
                            </p>
                          )}
                          
                          {/* Action Buttons */}
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

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(event)}>
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
                                      <strong>Time:</strong> {formatDateRange(event.eventDate, event.endDate)}
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

                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => shareEvent(event)}
                              className="flex items-center gap-1"
                            >
                              <Share2 className="w-4 h-4" />
                              Share
                            </Button>

                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                const calendarUrl = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${new Date(event.eventDate).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(event.endDate || addDays(new Date(event.eventDate), 1)).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
END:VEVENT
END:VCALENDAR`;
                                const link = document.createElement('a');
                                link.href = calendarUrl;
                                link.download = `${event.title}.ics`;
                                link.click();
                              }}
                              className="flex items-center gap-1"
                            >
                              <CalendarPlus className="w-4 h-4" />
                              Add to Calendar
                            </Button>
                          </div>
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
      )}
    </div>
  );
}