import * as React from "react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useForm } from "react-hook-form";
// import { zodResolver } // Simplified validation from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { 
  Users, UserCheck2, Calendar, MapPin, Phone, Mail, 
  Heart, Building, Clock, Plus, Edit, Trash2, Search, 
  Filter, UserPlus, HeartHandshake, ClipboardList, 
  Archive, PlayCircle, Video, Headphones, User,
  Home, Star, UserCog, BookOpen, Radio, CheckCircle,
  Clock3, AlertCircle
} from "lucide-react";
import { SessionsManagement } from "./SessionsManagement";

// Member Directory Component
function MemberDirectory({ selectedChurch: propSelectedChurch }: { selectedChurch?: number | null }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedChurch, setSelectedChurch] = useState("all");
  const { toast } = useToast();

  // Get only churches where user has admin permissions
  const { data: userChurches = [] } = useQuery({
    queryKey: ["/api/user/churches"],
  }) as { data: any[] };

  // Filter to only admin churches
  const adminChurches = userChurches.filter((uc: any) => {
    const adminRoles = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'system_admin', 'super_admin', 'soapbox_owner'];
    return adminRoles.includes(uc.role);
  });

  // Auto-select first admin church if user has only one admin church
  React.useEffect(() => {
    if (adminChurches.length === 1 && selectedChurch === "all") {
      setSelectedChurch(adminChurches[0].churchId.toString());
    }
  }, [adminChurches, selectedChurch]);

  // Use the prop selectedChurch if provided, otherwise fall back to internal state
  const effectiveSelectedChurch = propSelectedChurch ? propSelectedChurch.toString() : selectedChurch;

  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ["/api/members", effectiveSelectedChurch],
    queryFn: async () => {
      // Use apiRequest instead of direct fetch for proper authentication
      const url = effectiveSelectedChurch === "all" 
        ? "/api/members" 
        : `/api/members?churchId=${effectiveSelectedChurch}`;
      return await apiRequest("GET", url);
    },
    staleTime: 0, // Always refetch to avoid cache issues
    gcTime: 30000, // Keep cache for 30 seconds only
  });



  const filteredMembers = members.filter((member: any) => {
    const matchesSearch = member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.membershipStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateMemberMutation = useMutation({
    mutationFn: async (data: { id: string; updates: any }) => {
      const response = await apiRequest(`/api/members/${data.id}`, {
        method: "PUT",
        body: data.updates,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({ title: "Member updated successfully" });
      setSelectedMember(null);
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-blue-600 mb-4">
          <Users className="h-8 w-8 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Having trouble loading members</h3>
        </div>
        <p className="text-gray-600 mb-4">We're working to get your member directory back up and running.</p>
        <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Member Directory</h3>
        <Badge variant="outline">{isNaN(filteredMembers?.length) ? 0 : filteredMembers?.length || 0} members</Badge>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedChurch} onValueChange={setSelectedChurch}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by church" />
          </SelectTrigger>
          <SelectContent>
            {adminChurches.length > 1 && (
              <SelectItem value="all">All My Churches</SelectItem>
            )}
            {adminChurches.map((userChurch: any) => (
              <SelectItem key={userChurch.churchId} value={userChurch.churchId.toString()}>
                {userChurch.churchName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="visitor">Visitors</SelectItem>
            <SelectItem value="new_member">New Members</SelectItem>
            <SelectItem value="active">Active Members</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Debug Information */}
      {filteredMembers.length === 0 && !isLoading && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Members Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== "all" 
              ? "No members match your current filters." 
              : effectiveSelectedChurch === "all" 
                ? "No members found in the system."
                : "No members found for the selected church."
            }
          </p>
          <div className="text-xs text-gray-500 mb-4">
            <p>Church Filter: {effectiveSelectedChurch}</p>
            <p>Total members loaded: {members.length}</p>
            <p>Search term: "{searchTerm}"</p>
            <p>Status filter: {statusFilter}</p>
          </div>
        </div>
      )}

      {/* Member Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member: any) => (
          <Card key={member.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedMember(member)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{member.fullName}</h4>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <Badge variant={member.membershipStatus === 'active' ? 'default' : 'secondary'}>
                  {member.membershipStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {member.churchAffiliation && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{member.churchAffiliation}</span>
                </div>
              )}
              {member.denomination && (
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{member.denomination}</span>
                </div>
              )}
              {member.interests && (
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{member.interests}</span>
                </div>
              )}
              {member.joinedDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(member.joinedDate).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Member Detail Dialog */}
      {selectedMember && (
        <MemberDetailDialog 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)}
          onUpdate={(updates) => updateMemberMutation.mutate({ id: selectedMember.id, updates })}
        />
      )}
    </div>
  );
}

// Member Detail Dialog Component
function MemberDetailDialog({ member, onClose, onUpdate }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      fullName: member.fullName || "",
      email: member.email || "",
      phoneNumber: member.phoneNumber || "",
      address: member.address || "",
      membershipStatus: member.membershipStatus || "visitor",
      notes: member.notes || "",
    },
  });

  const handleSave = (data: any) => {
    onUpdate(data);
    setIsEditing(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Member Profile</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="membershipStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Membership Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="visitor">Visitor</SelectItem>
                        <SelectItem value="new_member">New Member</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
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
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                <p className="text-sm">{member.fullName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="text-sm">{member.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                <p className="text-sm">{member.phoneNumber || "N/A"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <Badge variant={member.membershipStatus === 'active' ? 'default' : 'secondary'}>
                  {member.membershipStatus}
                </Badge>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <p className="text-sm">{member.address || "N/A"}</p>
              </div>
              {member.joinedDate && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Joined Date</Label>
                  <p className="text-sm">{new Date(member.joinedDate).toLocaleDateString()}</p>
                </div>
              )}
              {member.notes && (
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p className="text-sm">{member.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Counseling Scheduling Component
function CounselingScheduling({ selectedChurch }: { selectedChurch?: number | null }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { toast } = useToast();



  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["/api/counseling-sessions", selectedChurch],
    queryFn: () => {
      const url = selectedChurch 
        ? `/api/counseling-sessions?churchId=${selectedChurch}`
        : "/api/counseling-sessions";
      return apiRequest(url);
    },
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["/api/members", selectedChurch],
    queryFn: async () => {
      const url = selectedChurch 
        ? `/api/members?churchId=${selectedChurch}`
        : "/api/members";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result;
    },
    enabled: !!selectedChurch,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await apiRequest("POST", "/api/counseling-sessions", sessionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/counseling-sessions"] });
      toast({ title: "Session created successfully" });
      setIsCreating(false);
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async (data: { id: string; updates: any }) => {
      const response = await apiRequest("PUT", `/api/counseling-sessions/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/counseling-sessions"] });
      toast({ title: "Session updated successfully" });
      setSelectedSession(null);
      setIsEditing(false);
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/counseling-sessions/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/counseling-sessions"] });
      toast({ title: "Session deleted successfully" });
      setDeleteConfirmId(null);
    },
  });

  const confirmSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("PATCH", `/api/counseling-sessions/${sessionId}/confirm`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/counseling-sessions"] });
      toast({ title: "Session confirmed successfully" });
    },
    onError: () => {
      toast({
        title: "Failed to confirm session",
        variant: "destructive",
      });
    },
  });

  const sessionForm = useForm({
    defaultValues: {
      memberId: "",
      sessionType: "counseling",
      scheduledTime: "",
      duration: 60,
      location: "",
      isVirtual: false,
      notes: "",
    },
  });

  const editForm = useForm({
    defaultValues: {
      memberId: "",
      sessionType: "",
      scheduledTime: "",
      duration: 60,
      location: "",
      isVirtual: false,
      notes: "",
    },
  });

  const handleCreateSession = (data: any) => {
    createSessionMutation.mutate(data);
    sessionForm.reset();
  };

  const handleEditSession = (data: any) => {
    if (selectedSession) {
      updateSessionMutation.mutate({
        id: selectedSession.id,
        updates: data
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-yellow-300 text-yellow-800"><Clock3 className="h-3 w-3 mr-1" />Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case "counseling":
        return "Counseling";
      case "pastoral_care":
        return "Pastoral Care";
      case "prayer":
        return "Prayer Session";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Counseling & Confession Scheduling</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Counseling Session</DialogTitle>
              <DialogDescription>
                Book a confidential session for spiritual guidance
              </DialogDescription>
            </DialogHeader>
            <Form {...sessionForm}>
              <form onSubmit={sessionForm.handleSubmit(handleCreateSession)} className="space-y-4">
                <FormField
                  control={sessionForm.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {membersLoading ? (
                            <SelectItem value="loading" disabled>Loading members...</SelectItem>
                          ) : members && Array.isArray(members) && members.length > 0 ? (
                            members.map((member: any) => (
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
                  control={sessionForm.control}
                  name="sessionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Individual Counseling">Individual Counseling</SelectItem>
                          <SelectItem value="Couples Counseling">Couples Counseling</SelectItem>
                          <SelectItem value="Family Counseling">Family Counseling</SelectItem>
                          <SelectItem value="Grief Counseling">Grief Counseling</SelectItem>
                          <SelectItem value="Marriage Preparation">Marriage Preparation</SelectItem>
                          <SelectItem value="Crisis Intervention">Crisis Intervention</SelectItem>
                          <SelectItem value="Spiritual Direction">Spiritual Direction</SelectItem>
                          <SelectItem value="Addiction Support">Addiction Support</SelectItem>
                          <SelectItem value="Youth Counseling">Youth Counseling</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={sessionForm.control}
                    name="scheduledTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date & Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={sessionForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={sessionForm.control}
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
                  control={sessionForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Private Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Confidential session notes..." rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createSessionMutation.isPending}>
                  {createSessionMutation.isPending ? "Scheduling..." : "Schedule Session"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sessions Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">
              All scheduled sessions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sessions.filter((s: any) => s.status === "confirmed").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready to proceed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock3 className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {sessions.filter((s: any) => s.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Sessions</CardTitle>
          <CardDescription>
            View and manage all counseling and pastoral care sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session: any) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{session.memberName || "Unknown Member"}</div>
                        <div className="text-sm text-muted-foreground">{session.memberEmail || ""}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getSessionTypeLabel(session.sessionType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div>{new Date(session.scheduledTime).toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(session.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.duration}min)
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {session.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(session.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {session.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmSessionMutation.mutate(session.id)}
                          disabled={confirmSessionMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSession(session);
                          editForm.reset({
                            memberId: session.memberId,
                            sessionType: session.sessionType,
                            scheduledTime: session.scheduledTime,
                            duration: session.duration,
                            location: session.location,
                            isVirtual: session.isVirtual || false,
                            notes: session.notes || "",
                          });
                          setIsEditing(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(session.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Session Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
            <DialogDescription>
              Update session details and preferences
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSession)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members.map((member: any) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="sessionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Individual Counseling">Individual Counseling</SelectItem>
                        <SelectItem value="Couples Counseling">Couples Counseling</SelectItem>
                        <SelectItem value="Family Counseling">Family Counseling</SelectItem>
                        <SelectItem value="Grief Counseling">Grief Counseling</SelectItem>
                        <SelectItem value="Marriage Preparation">Marriage Preparation</SelectItem>
                        <SelectItem value="Crisis Intervention">Crisis Intervention</SelectItem>
                        <SelectItem value="Spiritual Direction">Spiritual Direction</SelectItem>
                        <SelectItem value="Addiction Support">Addiction Support</SelectItem>
                        <SelectItem value="Youth Counseling">Youth Counseling</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="scheduledTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Meeting room, online link..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Session notes or special requirements..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateSessionMutation.isPending}>
                  {updateSessionMutation.isPending ? "Updating..." : "Update Session"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && deleteSessionMutation.mutate(deleteConfirmId)}
              disabled={deleteSessionMutation.isPending}
            >
              {deleteSessionMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Volunteer Management Component
function VolunteerManagement() {
  const { toast } = useToast();

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["/api/volunteer-opportunities"],
    queryFn: () => apiRequest("/api/volunteer-opportunities"),
  });

  const createOpportunityMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/volunteer-opportunities", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteer-opportunities"] });
      toast({ title: "Volunteer opportunity created successfully" });
    },
  });

  const opportunityForm = useForm({
    defaultValues: {
      title: "",
      description: "",
      maxVolunteers: 5,
      startTime: "",
      endTime: "",
      location: "",
      requiredSkills: [],
    },
  });

  const handleCreateOpportunity = (data: any) => {
    createOpportunityMutation.mutate(data);
    opportunityForm.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Volunteer & Event Sign-Ups</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Volunteer Opportunity</DialogTitle>
              <DialogDescription>
                Set up a new volunteer position for church events
              </DialogDescription>
            </DialogHeader>
            <Form {...opportunityForm}>
              <form onSubmit={opportunityForm.handleSubmit(handleCreateOpportunity)} className="space-y-4">
                <FormField
                  control={opportunityForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opportunity Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Sunday Greeter, Food Drive Helper..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={opportunityForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the volunteer role and responsibilities..." rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={opportunityForm.control}
                    name="maxVolunteers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Volunteers</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={opportunityForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Main entrance, kitchen..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={opportunityForm.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={opportunityForm.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createOpportunityMutation.isPending}>
                  {createOpportunityMutation.isPending ? "Creating..." : "Create Opportunity"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Opportunities Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {opportunities.map((opportunity: any) => (
          <Card key={opportunity.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{opportunity.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {opportunity.currentSignUps || 0}/{opportunity.maxVolunteers} signed up
                    </p>
                  </div>
                </div>
                <Badge variant={opportunity.isActive ? 'default' : 'secondary'}>
                  {opportunity.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">{opportunity.description}</p>
              {opportunity.startTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(opportunity.startTime).toLocaleString()}</span>
                </div>
              )}
              {opportunity.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{opportunity.location}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Media & Livestream Component
function MediaLivestream() {
  const { toast } = useToast();

  const { data: livestreams = [], isLoading: livestreamsLoading } = useQuery({
    queryKey: ["/api/livestreams"],
    queryFn: () => apiRequest("/api/livestreams"),
  });

  const { data: sermons = [], isLoading: sermonsLoading } = useQuery({
    queryKey: ["/api/sermon-archive"],
    queryFn: () => apiRequest("/api/sermon-archive"),
  });

  const createLivestreamMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/livestreams", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/livestreams"] });
      toast({ title: "Livestream created successfully" });
    },
  });

  const livestreamForm = useForm({
    defaultValues: {
      title: "",
      description: "",
      scheduledStart: "",
      streamUrl: "",
      chatEnabled: true,
      recordingEnabled: true,
    },
  });

  const handleCreateLivestream = (data: any) => {
    createLivestreamMutation.mutate(data);
    livestreamForm.reset();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="livestreams" className="space-y-6">
        <TabsList>
          <TabsTrigger value="livestreams">Live Streams</TabsTrigger>
          <TabsTrigger value="archive">Sermon Archive</TabsTrigger>
        </TabsList>

        <TabsContent value="livestreams" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Live Streaming</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Stream
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Livestream</DialogTitle>
                  <DialogDescription>
                    Set up a new live streaming session
                  </DialogDescription>
                </DialogHeader>
                <Form {...livestreamForm}>
                  <form onSubmit={livestreamForm.handleSubmit(handleCreateLivestream)} className="space-y-4">
                    <FormField
                      control={livestreamForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stream Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Sunday Service, Bible Study..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={livestreamForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Stream description..." rows={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={livestreamForm.control}
                      name="scheduledStart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scheduled Start</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={livestreamForm.control}
                      name="streamUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stream URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="chatEnabled"
                          {...livestreamForm.register("chatEnabled")}
                        />
                        <Label htmlFor="chatEnabled">Enable Chat</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="recordingEnabled"
                          {...livestreamForm.register("recordingEnabled")}
                        />
                        <Label htmlFor="recordingEnabled">Enable Recording</Label>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={createLivestreamMutation.isPending}>
                      {createLivestreamMutation.isPending ? "Creating..." : "Schedule Stream"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Livestreams Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {livestreams.map((stream: any) => (
              <Card key={stream.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <Radio className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{stream.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(stream.scheduledStart).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={stream.status === 'live' ? 'destructive' : 'secondary'}>
                      {stream.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{stream.description}</p>
                  {stream.viewerCount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{stream.viewerCount} viewers</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="archive" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sermon Archive</h3>
            <Badge variant="outline">{sermons.length} sermons</Badge>
          </div>

          {/* Sermons Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sermons.map((sermon: any) => (
              <Card key={sermon.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Archive className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{sermon.title}</h4>
                        <p className="text-sm text-muted-foreground">{sermon.speaker}</p>
                      </div>
                    </div>
                    {sermon.featured && (
                      <Badge variant="default">Featured</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sermon.series && (
                    <Badge variant="outline" className="text-xs">{sermon.series}</Badge>
                  )}
                  <p className="text-sm">{sermon.scripture}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(sermon.sermonDate).toLocaleDateString()}
                    </span>
                    {sermon.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.floor(sermon.duration / 60)}min
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <PlayCircle className="h-3 w-3" />
                      {sermon.viewCount || 0} views
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Main Component
export function MemberManagementSystem({ selectedChurch }: { selectedChurch?: number | null }) {
  return (
    <div className="space-y-6">
      <MemberDirectory selectedChurch={selectedChurch} />
    </div>
  );
}