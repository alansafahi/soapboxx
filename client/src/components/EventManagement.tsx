import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, MapPin, Users, Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  churchId: z.number().min(1, "Church is required"),
  eventDate: z.string().min(1, "Event date is required"),
  endDate: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  priority: z.string().default("normal"),
  status: z.string().default("scheduled"),
  isPublic: z.boolean().default(true),
  requiresApproval: z.boolean().default(false),
  maxAttendees: z.number().optional(),
  minAttendees: z.number().optional(),
  cost: z.number().default(0),
  currency: z.string().default("USD"),
  isOnline: z.boolean().default(false),
  onlineLink: z.string().optional(),
  tags: z.array(z.string()).default([]),
  ageGroups: z.array(z.string()).default([]),
  isRecurring: z.boolean().default(false),
  notes: z.string().optional(),
  publicNotes: z.string().optional(),
});

type EventForm = z.infer<typeof eventFormSchema>;

interface Event {
  id: number;
  title: string;
  description: string;
  churchId: number;
  organizerId: string;
  eventDate: string;
  endDate?: string;
  location?: string;
  address?: string;
  category: string;
  subcategory?: string;
  priority: string;
  status: string;
  isPublic: boolean;
  requiresApproval: boolean;
  maxAttendees?: number;
  minAttendees?: number;
  cost: number;
  currency: string;
  isOnline: boolean;
  onlineLink?: string;
  tags?: string[];
  ageGroups?: string[];
  isRecurring: boolean;
  notes?: string;
  publicNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Church {
  id: number;
  name: string;
}

const categories = [
  { value: "worship", label: "Worship Service" },
  { value: "bible_study", label: "Bible Study" },
  { value: "community_service", label: "Community Service" },
  { value: "social", label: "Social Event" },
  { value: "youth", label: "Youth Ministry" },
  { value: "outreach", label: "Outreach" },
  { value: "prayer", label: "Prayer Meeting" },
  { value: "fellowship", label: "Fellowship" },
];

const priorities = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
  { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" },
];

const statuses = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800" },
  { value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-800" },
  { value: "ongoing", label: "Ongoing", color: "bg-green-100 text-green-800" },
  { value: "completed", label: "Completed", color: "bg-purple-100 text-purple-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

export function EventManagement() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const { data: churches = [] } = useQuery({
    queryKey: ["/api/churches"],
  });

  const { data: userChurches = [] } = useQuery({
    queryKey: ["/api/users/churches"],
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventForm) => {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Event created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create event", description: error.message, variant: "destructive" });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EventForm> }) => {
      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsEditDialogOpen(false);
      toast({ title: "Event updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update event", description: error.message, variant: "destructive" });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete event", description: error.message, variant: "destructive" });
    },
  });

  // Determine the default church for the admin
  const userChurchesData = Array.isArray(userChurches) ? userChurches as Church[] : [];
  const defaultChurchId = userChurchesData.length > 0 ? userChurchesData[0].id : 0;

  const form = useForm<EventForm>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      churchId: defaultChurchId,
      eventDate: "",
      endDate: "",
      location: "",
      address: "",
      category: "",
      subcategory: "",
      priority: "normal",
      status: "scheduled",
      isPublic: true,
      requiresApproval: false,
      maxAttendees: undefined,
      minAttendees: undefined,
      cost: 0,
      currency: "USD",
      isOnline: false,
      onlineLink: "",
      tags: [],
      ageGroups: [],
      isRecurring: false,
      notes: "",
      publicNotes: "",
    },
  });

  const editForm = useForm<EventForm>({
    resolver: zodResolver(eventFormSchema),
  });

  // Update form when user's church data becomes available
  useEffect(() => {
    if (userChurchesData.length > 0 && defaultChurchId > 0) {
      form.setValue("churchId", defaultChurchId);
    }
  }, [userChurchesData, defaultChurchId, form]);

  const onCreateSubmit = (data: EventForm) => {
    // Convert datetime-local strings to ISO strings
    const formattedData = {
      ...data,
      eventDate: new Date(data.eventDate).toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
    };
    createEventMutation.mutate(formattedData);
  };

  const onEditSubmit = (data: EventForm) => {
    if (selectedEvent) {
      const formattedData = {
        ...data,
        eventDate: new Date(data.eventDate).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      };
      updateEventMutation.mutate({ id: selectedEvent.id, data: formattedData });
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    editForm.reset({
      title: event.title,
      description: event.description,
      churchId: event.churchId,
      eventDate: event.eventDate.split('T')[0] + 'T' + event.eventDate.split('T')[1]?.slice(0, 5) || '',
      endDate: event.endDate ? event.endDate.split('T')[0] + 'T' + event.endDate.split('T')[1]?.slice(0, 5) : '',
      location: event.location || "",
      address: event.address || "",
      category: event.category,
      subcategory: event.subcategory || "",
      priority: event.priority,
      status: event.status,
      isPublic: event.isPublic,
      requiresApproval: event.requiresApproval,
      maxAttendees: event.maxAttendees,
      minAttendees: event.minAttendees,
      cost: event.cost,
      currency: event.currency,
      isOnline: event.isOnline,
      onlineLink: event.onlineLink || "",
      tags: event.tags || [],
      ageGroups: event.ageGroups || [],
      isRecurring: event.isRecurring,
      notes: event.notes || "",
      publicNotes: event.publicNotes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (event: Event) => {
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      deleteEventMutation.mutate(event.id);
    }
  };

  const getPriorityColor = (priority: string) => {
    return priorities.find(p => p.value === priority)?.color || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    return statuses.find(s => s.value === status)?.color || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading events...</div>;
  }

  const eventsData = Array.isArray(events) ? events as Event[] : [];
  const churchesData = Array.isArray(churches) ? churches as Church[] : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Event Management</h2>
          <p className="text-muted-foreground">Manage church events, services, and activities</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter event title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="churchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Church</FormLabel>
                        {userChurchesData.length <= 1 ? (
                          // Single church - display as read-only field
                          <FormControl>
                            <Input 
                              value={userChurchesData[0]?.name || "No church assigned"} 
                              disabled 
                              className="bg-muted"
                            />
                          </FormControl>
                        ) : (
                          // Multiple churches - show dropdown
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select church" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {userChurchesData.map((church) => (
                                <SelectItem key={church.id} value={church.id.toString()}>
                                  {church.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter event description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date & Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
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
                        <FormLabel>End Date & Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
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
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {priorities.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value}>
                                {priority.label}
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statuses.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createEventMutation.isPending}>
                    {createEventMutation.isPending ? "Creating..." : "Create Event"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Events Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventsData.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No events yet</h3>
                <p className="text-muted-foreground mb-4">Create your first event to get started</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {eventsData.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge className={getPriorityColor(event.priority)}>{event.priority}</Badge>
                          <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(event.eventDate), "PPp")}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                          )}
                          {event.maxAttendees && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Max {event.maxAttendees}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(event)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}