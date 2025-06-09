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
import { Church, Calendar, Users, MessageSquare, Heart, Building, MapPin, Phone, Mail, Globe, Clock, Plus } from "lucide-react";
import { insertChurchSchema, insertEventSchema } from "@shared/schema";

const churchFormSchema = insertChurchSchema.extend({
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

const eventFormSchema = insertEventSchema.extend({
  churchId: z.coerce.number(),
});

type ChurchFormData = z.infer<typeof churchFormSchema>;
type EventFormData = z.infer<typeof eventFormSchema>;

export default function AdminPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedChurch, setSelectedChurch] = useState<number | null>(null);

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

  const createChurchMutation = useMutation({
    mutationFn: async (data: ChurchFormData) => {
      return await apiRequest("POST", "/api/churches", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Church created successfully!",
      });
      churchForm.reset();
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

  const handleCreateChurch = (data: ChurchFormData) => {
    createChurchMutation.mutate(data);
  };

  const handleCreateEvent = (data: EventFormData) => {
    createEventMutation.mutate({
      ...data,
      churchId: selectedChurch!,
    });
  };

  if (churchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Church Admin Portal</h1>
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
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={createChurchMutation.isPending}
                      >
                        {createChurchMutation.isPending ? "Creating..." : "Create Church"}
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
                  {church.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedChurch ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
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
  );
}