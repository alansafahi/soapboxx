import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Link } from 'wouter';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

interface Event {
  id: number;
  title: string;
  eventDate: string;
  location?: string;
  isOnline?: boolean;
  description?: string;
}

export default function UpcomingEventsPreview() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await fetch('/api/events/upcoming?limit=3', {
          credentials: 'include',
        });
        if (response.ok) {
          const data: Event[] = await response.json();
          setUpcomingEvents(data);
        }
      } catch (error) {
        // Could not fetch upcoming events - using fallback
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  const formatEventDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) {
      return `Today, ${format(date, "h:mm a")}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow, ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
            📅 Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-2 animate-pulse">
                <div className="w-10 h-10 bg-blue-200 dark:bg-blue-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-blue-200 dark:bg-blue-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
            📅 Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-blue-300" />
            <p className="text-sm text-muted-foreground mb-3">
              No upcoming events scheduled
            </p>
            <Link href="/events">
              <Button variant="outline" size="sm" className="mr-2">
                View All Events
              </Button>
            </Link>
            <Link href="/events/create">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-1" />
                Create Event
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-blue-600" />
          📅 Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingEvents.map((event) => (
          <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-blue-800/30 transition-colors">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {event.title}
              </h4>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatEventDate(event.eventDate)}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">
                    {event.location}
                  </span>
                </div>
              )}
              {event.isOnline && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  Online
                </Badge>
              )}
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
          <Link href="/events">
            <Button variant="ghost" size="sm" className="w-full justify-between text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              ➕ View All Events
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}