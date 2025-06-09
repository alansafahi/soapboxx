import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Video, Users } from "lucide-react";
import { motion } from "framer-motion";
import type { Event } from "@shared/schema";

export default function EventsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rsvpStatus, setRsvpStatus] = useState<Map<number, string>>(new Map());
  const [animatingButtons, setAnimatingButtons] = useState<Set<number>>(new Set());

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

  const formatEventDate = (date: string) => {
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

  const formatDateRange = (start: string, end?: string) => {
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upcoming Events</CardTitle>
          <Button variant="ghost" size="sm">
            View Calendar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
            <p className="text-gray-600">Check back soon for community events and activities!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {events.map((event) => {
              const dateInfo = formatEventDate(event.eventDate);
              return (
                <div key={event.id} className="py-6 first:pt-0 hover:bg-gray-50 transition-colors cursor-pointer rounded-lg px-4 -mx-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-light-blue rounded-xl flex flex-col items-center justify-center">
                        <span className="text-xs text-faith-blue font-medium">
                          {dateInfo.month}
                        </span>
                        <span className="text-lg font-bold text-faith-blue">
                          {dateInfo.day}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                          {event.category && (
                            <Badge className={getCategoryColor(event.category)}>
                              {event.category.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDateRange(event.eventDate, event.endDate || undefined)}
                        </span>
                        <span className="flex items-center">
                          {event.isOnline ? (
                            <>
                              <Video className="w-4 h-4 mr-1" />
                              Online
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4 mr-1" />
                              {event.location || "Location TBD"}
                            </>
                          )}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {event.maxAttendees ? `${Math.floor(Math.random() * event.maxAttendees)} / ${event.maxAttendees}` : `${Math.floor(Math.random() * 50)} attending`}
                        </span>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Button 
                            size="sm"
                            onClick={() => handleRSVP(event.id, "attending")}
                            disabled={rsvpMutation.isPending}
                            className={`transition-all duration-300 ${
                              rsvpStatus.get(event.id) === "attending"
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-faith-blue hover:bg-blue-600 text-white'
                            }`}
                          >
                            <motion.span
                              animate={animatingButtons.has(event.id) ? {
                                scale: [1, 1.1, 1]
                              } : {}}
                              transition={{ duration: 0.4 }}
                            >
                              {rsvpMutation.isPending ? "RSVPing..." : 
                               rsvpStatus.get(event.id) === "attending" ? "Attending ✓" : "RSVP"}
                            </motion.span>
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
