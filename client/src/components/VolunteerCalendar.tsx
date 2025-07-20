import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, CheckCircle, AlertCircle, Hourglass } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// D.I.V.I.N.E. Calendar Integration - View All Volunteer Commitments & Church Events

interface VolunteerRegistration {
  id: number;
  opportunityId: number;
  status: string;
  registeredAt: string;
  notes?: string;
  opportunityTitle: string;
  opportunityDescription: string;
  location: string;
  startDate: string;
  endDate: string;
}

interface ChurchEvent {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  eventType: string;
}

const VolunteerCalendar = () => {
  const [viewMode, setViewMode] = useState<'upcoming' | 'all'>('upcoming');

  // Get volunteer registrations
  const { data: registrations, isLoading: loadingRegistrations } = useQuery({
    queryKey: ['/api/volunteers/my-registrations'],
    queryFn: () => apiRequest('/api/volunteers/my-registrations', 'GET')
  });

  // Get church events
  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ['/api/events'],
    queryFn: () => apiRequest('/api/events', 'GET')
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending_approval':
        return <Hourglass className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'approved': 'bg-green-100 text-green-800',
      'confirmed': 'bg-green-100 text-green-800',
      'pending_approval': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800',
      'registered': 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={`${variants[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loadingRegistrations || loadingEvents) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-purple-500" />
          <h2 className="text-2xl font-bold">My Volunteer Calendar</h2>
        </div>
        
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const upcomingRegistrations = registrations?.filter((reg: VolunteerRegistration) => {
    const startDate = new Date(reg.startDate);
    return startDate >= new Date();
  }) || [];

  const upcomingEvents = events?.filter((event: ChurchEvent) => {
    const startTime = new Date(event.startTime);
    return startTime >= new Date();
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-purple-500" />
          <h2 className="text-2xl font-bold">My Volunteer Calendar</h2>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setViewMode('upcoming')}
            size="sm"
          >
            Upcoming
          </Button>
          <Button
            variant={viewMode === 'all' ? 'default' : 'outline'}
            onClick={() => setViewMode('all')}
            size="sm"
          >
            All Events
          </Button>
        </div>
      </div>

      {/* Volunteer Commitments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Users className="w-4 h-4 mr-2 text-purple-500" />
          My Volunteer Commitments ({(viewMode === 'upcoming' ? upcomingRegistrations : registrations)?.length || 0})
        </h3>

        {(viewMode === 'upcoming' ? upcomingRegistrations : registrations)?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {viewMode === 'upcoming' 
                  ? "No upcoming volunteer commitments. Ready to serve?"
                  : "No volunteer registrations yet. Explore opportunities to get started!"
                }
              </p>
              <Button className="mt-4" onClick={() => window.location.href = '/divine'}>
                Browse Opportunities
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {(viewMode === 'upcoming' ? upcomingRegistrations : registrations)?.map((registration: VolunteerRegistration) => (
              <Card key={registration.id} className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{registration.opportunityTitle}</CardTitle>
                      <CardDescription className="mt-1">
                        {registration.opportunityDescription}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(registration.status)}
                      {getStatusBadge(registration.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(registration.startDate)}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {registration.location}
                    </div>
                  </div>
                  
                  {registration.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Your Notes:</strong> {registration.notes}
                      </p>
                    </div>
                  )}

                  {registration.status === 'pending_approval' && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⏳ <strong>Awaiting Approval:</strong> Your application is being reviewed by the ministry team. 
                        You'll receive a notification once it's approved!
                      </p>
                    </div>
                  )}

                  {registration.status === 'approved' && (
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✅ <strong>Approved & Confirmed:</strong> You're all set! Contact the ministry leader if you have questions.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Church Events */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
          Church Events ({(viewMode === 'upcoming' ? upcomingEvents : events)?.length || 0})
        </h3>

        {(viewMode === 'upcoming' ? upcomingEvents : events)?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-6">
              <p className="text-gray-500">No church events scheduled.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {(viewMode === 'upcoming' ? upcomingEvents : events)?.slice(0, 5).map((event: ChurchEvent) => (
              <Card key={event.id} className="border-l-4 border-l-blue-500">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(event.startTime)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(event.startTime)}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="ml-4">
                      {event.eventType}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerCalendar;