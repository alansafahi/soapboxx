import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CalendarIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const counselingSessionSchema = z.object({
  memberId: z.string().min(1, "Please select a member"),
  sessionType: z.string().min(1, "Please select a session type"),
  scheduledTime: z.string().min(1, "Please select date and time"),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  location: z.string().min(1, "Please enter a location"),
  notes: z.string().optional(),
});

type CounselingSessionForm = z.infer<typeof counselingSessionSchema>;

interface CounselingSession {
  id: string;
  memberId: string;
  sessionType: string;
  scheduledTime: string;
  duration: number;
  location: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  memberName?: string;
}

interface Member {
  id: string;
  name: string;
  fullName: string;
  email?: string;
}

const sessionTypes = [
  "Individual Counseling",
  "Couples Counseling", 
  "Family Counseling",
  "Grief Counseling",
  "Marriage Preparation",
  "Crisis Intervention",
  "Spiritual Direction",
  "Addiction Support",
  "Youth Counseling",
  "Other"
];

const statusTypes = [
  { value: "scheduled", label: "Scheduled", color: "blue" },
  { value: "in_progress", label: "In Progress", color: "yellow" },
  { value: "completed", label: "Completed", color: "green" },
  { value: "cancelled", label: "Cancelled", color: "red" },
  { value: "no_show", label: "No Show", color: "gray" },
  { value: "rescheduled", label: "Rescheduled", color: "orange" },
];

interface CounselingManagementProps {
  selectedChurch?: number | null;
}

export function CounselingManagement({ selectedChurch }: CounselingManagementProps) {
  const [selectedSession, setSelectedSession] = useState<CounselingSession | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch counseling sessions
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["/api/counseling-sessions", selectedChurch],
    queryFn: async () => {
      const url = selectedChurch 
        ? `/api/counseling-sessions?churchId=${selectedChurch}`
        : "/api/counseling-sessions";
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    },
    enabled: !!selectedChurch,
  });

  // Fetch members for dropdown
  const { data: members = [] } = useQuery({
    queryKey: ["/api/members", selectedChurch],
    queryFn: async () => {
      const url = selectedChurch 
        ? `/api/members?churchId=${selectedChurch}`
        : "/api/members";
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    },
    enabled: !!selectedChurch,
  });

  // Form setup
  const form = useForm<CounselingSessionForm>({
    resolver: zodResolver(counselingSessionSchema),
    defaultValues: {
      memberId: "",
      sessionType: "",
      scheduledTime: "",
      duration: 60,
      location: "",
      notes: "",
    },
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: CounselingSessionForm) => {
      const response = await fetch("/api/counseling-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sessionData,
          churchId: selectedChurch,
          status: "scheduled",
        }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Counseling session scheduled successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/counseling-sessions"] });
      setIsCreating(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to schedule session", variant: "destructive" });
    },
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CounselingSessionForm> }) => {
      const response = await fetch(`/api/counseling-sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Counseling session updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/counseling-sessions"] });
      setIsEditing(false);
      setSelectedSession(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update session", variant: "destructive" });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/counseling-sessions/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Session status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/counseling-sessions"] });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/counseling-sessions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Counseling session deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/counseling-sessions"] });
      setDeleteConfirmId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete session", variant: "destructive" });
    },
  });

  // Handle form submission
  const onSubmit = (data: CounselingSessionForm) => {
    if (isEditing && selectedSession) {
      updateSessionMutation.mutate({ id: selectedSession.id, data });
    } else {
      createSessionMutation.mutate(data);
    }
  };

  // Start editing
  const startEditing = (session: CounselingSession) => {
    setSelectedSession(session);
    setIsEditing(true);
    form.reset({
      memberId: session.memberId,
      sessionType: session.sessionType,
      scheduledTime: session.scheduledTime,
      duration: session.duration,
      location: session.location,
      notes: session.notes || "",
    });
  };

  // Filter sessions
  const filteredSessions = sessions.filter((session: CounselingSession) => {
    const matchesStatus = filterStatus === "all" || session.status === filterStatus;
    const matchesSearch = !searchTerm || 
      session.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.sessionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = statusTypes.find(s => s.value === status);
    if (!statusConfig) return <Badge variant="secondary">{status}</Badge>;
    
    return (
      <Badge 
        variant={statusConfig.color === "green" ? "default" : "secondary"}
        className={`
          ${statusConfig.color === "blue" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : ""}
          ${statusConfig.color === "yellow" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : ""}
          ${statusConfig.color === "red" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : ""}
          ${statusConfig.color === "gray" ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" : ""}
          ${statusConfig.color === "orange" ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" : ""}
        `}
      >
        {statusConfig.label}
      </Badge>
    );
  };

  if (!selectedChurch) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Select a Church
          </h3>
          <p className="text-gray-500">
            Choose a church from the sidebar to manage counseling sessions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Counseling Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage counseling sessions and appointments
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Counseling Session</DialogTitle>
              <DialogDescription>
                Book a new counseling session for spiritual guidance
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {members && Array.isArray(members) && members.length > 0 ? (
                            members.map((member: Member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.fullName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-members" disabled>
                              {selectedChurch ? "No members found for this church" : "Please select a church first"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sessionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sessionTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="scheduledTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date & Time</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "MMM d, yyyy 'at' h:mm a")
                                ) : (
                                  <span>Pick a date and time</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  // If we have an existing time, preserve it
                                  const existingTime = field.value ? new Date(field.value) : new Date();
                                  const newDateTime = new Date(date);
                                  newDateTime.setHours(existingTime.getHours());
                                  newDateTime.setMinutes(existingTime.getMinutes());
                                  field.onChange(newDateTime.toISOString().slice(0, 16));
                                }
                              }}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                            <div className="p-3 border-t">
                              <label className="text-sm font-medium">Time</label>
                              <Input
                                type="time"
                                value={field.value ? format(new Date(field.value), "HH:mm") : ""}
                                onChange={(e) => {
                                  if (field.value && e.target.value) {
                                    const date = new Date(field.value);
                                    const [hours, minutes] = e.target.value.split(':');
                                    date.setHours(parseInt(hours), parseInt(minutes));
                                    field.onChange(date.toISOString().slice(0, 16));
                                  } else if (e.target.value) {
                                    // If no date selected, use today
                                    const date = new Date();
                                    const [hours, minutes] = e.target.value.split(':');
                                    date.setHours(parseInt(hours), parseInt(minutes));
                                    field.onChange(date.toISOString().slice(0, 16));
                                  }
                                }}
                                className="mt-1"
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="15"
                            step="15"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Pastor's office, chapel, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Private Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Confidential session notes..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createSessionMutation.isPending}
                >
                  {createSessionMutation.isPending ? "Scheduling..." : "Schedule Session"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by member name, session type, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            {statusTypes.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="text-center py-8">Loading counseling sessions...</div>
      ) : filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No Sessions Found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== "all" 
                ? "No sessions match your current filters."
                : "No counseling sessions scheduled yet."}
            </p>
            {(!searchTerm && filterStatus === "all") && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule First Session
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSessions.map((session: CounselingSession) => (
            <Card key={session.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{session.memberName}</h3>
                      {getStatusBadge(session.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {session.sessionType}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(session.scheduledTime), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(session.scheduledTime), "h:mm a")} ({session.duration}m)
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {session.location}
                      </div>
                    </div>
                    {session.notes && (
                      <p className="text-sm text-gray-500 mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {session.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Update Dropdown */}
                    <Select
                      value={session.status}
                      onValueChange={(status) => 
                        updateStatusMutation.mutate({ id: session.id, status })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusTypes.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSession(session);
                        setIsViewing(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(session)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirmId(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Counseling Session</DialogTitle>
            <DialogDescription>
              Update the counseling session details
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members && Array.isArray(members) && members.length > 0 ? (
                          members.map((member: Member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.fullName}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-members" disabled>
                            No members found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sessionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sessionTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduledTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date & Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "MMM d, yyyy 'at' h:mm a")
                              ) : (
                                <span>Pick a date and time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                // If we have an existing time, preserve it
                                const existingTime = field.value ? new Date(field.value) : new Date();
                                const newDateTime = new Date(date);
                                newDateTime.setHours(existingTime.getHours());
                                newDateTime.setMinutes(existingTime.getMinutes());
                                field.onChange(newDateTime.toISOString().slice(0, 16));
                              }
                            }}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                          <div className="p-3 border-t">
                            <label className="text-sm font-medium">Time</label>
                            <Input
                              type="time"
                              value={field.value ? format(new Date(field.value), "HH:mm") : ""}
                              onChange={(e) => {
                                if (field.value && e.target.value) {
                                  const date = new Date(field.value);
                                  const [hours, minutes] = e.target.value.split(':');
                                  date.setHours(parseInt(hours), parseInt(minutes));
                                  field.onChange(date.toISOString().slice(0, 16));
                                } else if (e.target.value) {
                                  // If no date selected, use today
                                  const date = new Date();
                                  const [hours, minutes] = e.target.value.split(':');
                                  date.setHours(parseInt(hours), parseInt(minutes));
                                  field.onChange(date.toISOString().slice(0, 16));
                                }
                              }}
                              className="mt-1"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="15"
                          step="15"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Pastor's office, chapel, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Private Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Confidential session notes..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={updateSessionMutation.isPending}
                >
                  {updateSessionMutation.isPending ? "Updating..." : "Update Session"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewing} onOpenChange={setIsViewing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>
              View counseling session information
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Member</label>
                <p className="text-sm">{selectedSession.memberName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Session Type</label>
                <p className="text-sm">{selectedSession.sessionType}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-sm">{format(new Date(selectedSession.scheduledTime), "MMM d, yyyy")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Time</label>
                  <p className="text-sm">{format(new Date(selectedSession.scheduledTime), "h:mm a")}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Duration</label>
                  <p className="text-sm">{selectedSession.duration} minutes</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedSession.status)}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-sm">{selectedSession.location}</p>
              </div>
              {selectedSession.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">{selectedSession.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Counseling Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this counseling session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && deleteSessionMutation.mutate(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}