import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { CalendarIcon, MapPinIcon, ArrowLeftIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import MobileNav from "../components/mobile-nav";

interface EventForm {
  title: string;
  description: string;
  churchId: number;
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
}

const categories = [
  { value: "service", label: "Service" },
  { value: "bible_study", label: "Bible Study" },
  { value: "community_service", label: "Community Service" },
  { value: "social", label: "Social" },
  { value: "youth", label: "Youth" },
  { value: "prayer", label: "Prayer" },
  { value: "worship", label: "Worship" },
  { value: "outreach", label: "Outreach" },
  { value: "education", label: "Education" },
  { value: "meeting", label: "Meeting" },
  { value: "other", label: "Other" }
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
];

const statuses = [
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "cancelled", label: "Cancelled" }
];

export default function CreateEventPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EventForm>({
    defaultValues: {
      title: "",
      description: "",
      churchId: 0,
      eventDate: "",
      endDate: "",
      location: "",
      address: "",
      category: "service",
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

  // Fetch user's communities
  const { data: userChurchesData = [] } = useQuery({
    queryKey: ["/api/user-churches"],
    enabled: isAuthenticated,
  });

  // Set default church if available
  useEffect(() => {
    if (Array.isArray(userChurchesData) && userChurchesData.length > 0) {
      setValue("churchId", (userChurchesData as any[])[0].id);
    }
  }, [userChurchesData, setValue]);

  const createEventMutation = useMutation({
    mutationFn: async (data: EventForm) => {
      return await apiRequest("POST", "/api/events", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ 
        title: "Success", 
        description: "Event created successfully!" 
      });
      setLocation("/events");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to create event", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: EventForm) => {
    const formattedData = {
      ...data,
      eventDate: new Date(data.eventDate).toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
    };
    createEventMutation.mutate(formattedData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-violet-900 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:border-purple-800">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <Link href="/events">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Events
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:bg-gradient-to-r dark:from-purple-400 dark:to-blue-400 dark:bg-clip-text dark:text-transparent">
                Create New Event
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Add a new event to your community calendar
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    {...register("title", { required: "Title is required" })}
                    placeholder="Enter event title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Event description..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Start Date & Time *</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    {...register("eventDate", { required: "Start date is required" })}
                  />
                  {errors.eventDate && (
                    <p className="text-sm text-red-500">{errors.eventDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    {...register("endDate")}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register("location")}
                    placeholder="Event location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="Full address"
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select onValueChange={(value) => setValue("priority", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(value) => setValue("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("cost", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    {...register("isPublic")}
                    defaultChecked={true}
                  />
                  <Label htmlFor="isPublic">Public Event</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isOnline"
                    {...register("isOnline")}
                  />
                  <Label htmlFor="isOnline">Online Event</Label>
                </div>

                {watch("isOnline") && (
                  <div className="space-y-2">
                    <Label htmlFor="onlineLink">Online Meeting Link</Label>
                    <Input
                      id="onlineLink"
                      {...register("onlineLink")}
                      placeholder="https://..."
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiresApproval"
                    {...register("requiresApproval")}
                  />
                  <Label htmlFor="requiresApproval">Requires RSVP Approval</Label>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="publicNotes">Public Notes</Label>
                <Textarea
                  id="publicNotes"
                  {...register("publicNotes")}
                  placeholder="Additional information visible to attendees..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Link href="/events">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={createEventMutation.isPending}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  {createEventMutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
}