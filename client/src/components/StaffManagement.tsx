import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Crown,
  Heart,
  Calendar,
  MessageCircle,
  Settings,
  BookOpen,
  Music,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  AlertTriangle,
  DollarSign,
  MapPin,
  ChevronDown,
  ChevronRight,
  Info,
  Star,
  Filter,
  Search,
  Wrench,
  Calculator,
  Church,
  Building2
} from "lucide-react";

interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  title: string;
  department: string;
  status: 'pending' | 'active' | 'inactive';
  invitedAt: string;
  joinedAt?: string;
  lastActive?: string;
  permissions: string[];
}

interface Role {
  name: string;
  displayName: string;
  description: string;
  level: number;
  permissions: string[];
  color: string;
  icon: any;
}

// Community-specific role configurations
const getCommunityRoles = (communityType: string = "church") => {
  const baseRoles = [
    {
      name: "ministry_leader",
      displayName: "Ministry Leader",
      description: "Leader of specific ministry departments",
      level: 1,
      color: "bg-indigo-100 text-indigo-800",
      icon: Heart,
      communityTypes: ["church", "ministry"],
      permissions: [
        "manage_events", "create_content", "moderate_prayers",
        "send_communications", "manage_volunteers", "event_budget_submission"
      ]
    },
    {
      name: "worship_leader",
      displayName: "Worship Leader",
      description: "Oversees music ministry and worship services",
      level: 2,
      color: "bg-orange-100 text-orange-800",
      icon: Music,
      communityTypes: ["church"],
      permissions: [
        "manage_events", "upload_music", "create_content",
        "manage_volunteers", "access_analytics"
      ]
    },
    {
      name: "youth_pastor",
      displayName: "Youth Pastor",
      description: "Leader of youth ministry programs and activities",
      level: 3,
      color: "bg-green-100 text-green-800",
      icon: Users,
      communityTypes: ["church"],
      permissions: [
        "manage_events", "moderate_prayers", "create_content", 
        "send_communications", "access_analytics", "manage_volunteers",
        "volunteer_hours_tracking", "event_budget_submission"
      ]
    },
    {
      name: "associate_pastor",
      displayName: "Associate Pastor",
      description: "Assistant pastoral role with ministry leadership responsibilities",
      level: 4,
      color: "bg-blue-100 text-blue-800",
      icon: Shield,
      communityTypes: ["church"],
      permissions: [
        "approve_content", "moderate_prayers", "manage_events", 
        "access_analytics", "send_communications", "manage_members"
      ]
    },
    {
      name: "lead_pastor",
      displayName: "Lead Pastor",
      description: "Primary spiritual leader with full ministry access",
      level: 5,
      color: "bg-purple-100 text-purple-800",
      icon: Crown,
      communityTypes: ["church"],
      permissions: [
        "manage_staff", "approve_content", "moderate_prayers", "manage_events", 
        "access_analytics", "send_communications", "manage_settings", "manage_members",
        "pre_approval_posts", "church_directory_updates"
      ]
    },
    {
      name: "church_admin",
      displayName: "Church Administrator", 
      description: "Highest administrative authority with full access",
      level: 6,
      color: "bg-red-100 text-red-800",
      icon: Crown,
      communityTypes: ["church"],
      permissions: [
        "manage_staff", "assign_roles", "approve_content", "moderate_prayers", 
        "manage_events", "access_analytics", "manage_finances", "send_communications", 
        "manage_settings", "manage_members", "manage_facilities", "access_finances",
        "pre_approval_posts", "church_directory_updates", "assign_campus_affiliation"
      ]
    },
    {
      name: "technical_admin",
      displayName: "Technical Admin",
      description: "Handles technical and administrative support tasks",
      level: 2,
      color: "bg-gray-100 text-gray-800",
      icon: Wrench,
      communityTypes: ["church"],
      permissions: [
        "manage_settings", "access_analytics", "manage_facilities", "church_directory_updates"
      ]
    },
    {
      name: "super_volunteer",
      displayName: "Super Volunteer",
      description: "Coordinates volunteers and events without financial access",
      level: 1.5,
      color: "bg-cyan-100 text-cyan-800",
      icon: Users,
      communityTypes: ["church"],
      permissions: [
        "manage_volunteers", "manage_events"
      ]
    },
    {
      name: "finance_admin",
      displayName: "Finance Admin",
      description: "Specialized role for donations and financial reporting",
      level: 3.5,
      color: "bg-emerald-100 text-emerald-800",
      icon: Calculator,
      communityTypes: ["church"],
      permissions: [
        "access_finances", "manage_finances"
      ]
    },
    {
      name: "campus_pastor",
      displayName: "Campus Pastor",
      description: "Oversees one campus in a multi-campus church",
      level: 4.5,
      color: "bg-teal-100 text-teal-800",
      icon: Church,
      communityTypes: ["church"],
      permissions: [
        "manage_staff", "approve_content", "moderate_prayers", "manage_events", 
        "access_analytics", "send_communications", "manage_settings", "manage_members", "manage_volunteers",
        "submit_campus_reports", "manage_local_events", "view_local_donations"
      ]
    },
    {
      name: "parent_church_admin",
      displayName: "Parent Church Admin",
      description: "Mega-church administrator overseeing multiple campuses",
      level: 6.5,
      color: "bg-violet-100 text-violet-800",
      icon: Building2,
      communityTypes: ["church"],
      permissions: [
        "manage_staff", "assign_roles", "approve_content", "moderate_prayers", 
        "manage_events", "access_analytics", "manage_finances", "send_communications", 
        "manage_settings", "manage_members", "manage_facilities", "access_finances",
        "cross_campus_reporting", "assign_campus_affiliation", "manage_child_communities",
        "cross_campus_analytics", "approve_sub_campus_leaders", "override_local_settings"
      ]
    },
    {
      name: "moderator",
      displayName: "Moderator",
      description: "Moderates discussions and maintains community standards",
      level: 5,
      color: "bg-yellow-100 text-yellow-800",
      icon: Shield,
      communityTypes: ["group", "ministry"],
      permissions: [
        "moderate_prayers", "approve_content", "manage_members"
      ]
    }
  ];

  // Filter roles based on community type and sort by level
  return baseRoles
    .filter(role => role.communityTypes.includes(communityType))
    .sort((a, b) => a.level - b.level);
};

const AVAILABLE_ROLES = getCommunityRoles();

const PERMISSION_CATEGORIES = {
  "📋 Admin & Management": {
    color: "bg-blue-50 border-blue-200 text-blue-900",
    headerColor: "bg-blue-100 text-blue-800",
    permissions: [
      { key: "manage_staff", label: "Invite & manage staff members", critical: true, tooltip: "Send invitations and manage staff member accounts and access" },
      { key: "assign_roles", label: "Assign roles to members", critical: true, tooltip: "Assign and modify user roles and permission levels" },
      { key: "assign_campus_affiliation", label: "Assign campus affiliation", critical: true, tooltip: "Associate staff members with specific campus locations" },
      { key: "manage_child_communities", label: "Manage child campus communities", critical: true, tooltip: "Oversee and manage subsidiary campus communities" },
      { key: "manage_members", label: "Add/remove members", critical: false, tooltip: "Add new members and remove existing members from the community" },
      { key: "church_directory_updates", label: "Update church directory info", critical: false, tooltip: "Modify community contact information and directory details" },
      { key: "manage_settings", label: "Modify church settings", critical: true, tooltip: "Access and modify core community configuration settings" }
    ]
  },
  "📣 Content & Communications": {
    color: "bg-green-50 border-green-200 text-green-900", 
    headerColor: "bg-green-100 text-green-800",
    permissions: [
      { key: "approve_content", label: "Approve user-generated content", critical: false, tooltip: "Review and approve posts, comments, and user-submitted content" },
      { key: "create_content", label: "Create announcements & posts", critical: false, tooltip: "Create and publish community announcements and social posts" },
      { key: "send_communications", label: "Send emails & notifications", critical: false, tooltip: "Send email newsletters and push notifications to members" },
      { key: "moderate_prayers", label: "Moderate prayer requests", critical: false, tooltip: "Review, approve, and manage prayer wall submissions" },
      { key: "pre_approval_posts", label: "Pre-approval of scheduled posts", critical: false, tooltip: "Review and approve content before scheduled publication" }
    ]
  },
  "🎉 Events & Volunteers": {
    color: "bg-orange-50 border-orange-200 text-orange-900",
    headerColor: "bg-orange-100 text-orange-800", 
    permissions: [
      { key: "manage_events", label: "Create & manage events", critical: false, tooltip: "Create, edit, and coordinate community events and activities" },
      { key: "manage_volunteers", label: "Coordinate volunteers", critical: false, tooltip: "Recruit, assign, and manage volunteer schedules and positions" },
      { key: "upload_music", label: "Upload worship music", critical: false, tooltip: "Upload and manage worship songs and audio content" },
      { key: "volunteer_hours_tracking", label: "Track volunteer hours & export", critical: false, tooltip: "Monitor volunteer participation and generate service hour reports" },
      { key: "event_budget_submission", label: "Submit event budget requests", critical: false, tooltip: "Submit budget proposals for events and ministry activities" },
      { key: "manage_local_events", label: "Manage local campus events", critical: false, tooltip: "Coordinate events specific to individual campus locations" }
    ]
  },
  "📊 Reports & Finance": {
    color: "bg-purple-50 border-purple-200 text-purple-900",
    headerColor: "bg-purple-100 text-purple-800",
    permissions: [
      { key: "access_analytics", label: "View engagement analytics", critical: false, tooltip: "Access member engagement metrics and community analytics" },
      { key: "access_finances", label: "View financial reports", critical: true, tooltip: "View donation summaries and financial dashboard data" },
      { key: "manage_finances", label: "Manage donations & finances", critical: true, tooltip: "Process donations, manage funds, and handle financial operations" },
      { key: "cross_campus_reporting", label: "Cross-campus reporting access", critical: true, tooltip: "Generate reports across multiple campus locations" },
      { key: "cross_campus_analytics", label: "Cross-campus analytics dashboard", critical: true, tooltip: "Access unified analytics across all campus communities" },
      { key: "view_user_engagement_by_campus", label: "View user engagement by campus", critical: false, tooltip: "Monitor member activity and engagement per campus location" },
      { key: "submit_campus_reports", label: "Submit campus reports", critical: false, tooltip: "Generate and submit periodic campus performance reports" },
      { key: "view_local_donations", label: "View local campus donations", critical: false, tooltip: "Access donation data specific to individual campus locations" }
    ]
  },
  "🔒 Settings & Security": {
    color: "bg-red-50 border-red-200 text-red-900",
    headerColor: "bg-red-100 text-red-800",
    permissions: [
      { key: "manage_facilities", label: "Manage facilities & resources", critical: false, tooltip: "Coordinate facility bookings and resource allocation" },
      { key: "approve_child_campus_requests", label: "Approve or reject child campus requests", critical: true, tooltip: "Review and approve requests for new subsidiary campus locations" },
      { key: "control_campus_feature_toggles", label: "Control campus-specific feature toggles", critical: true, tooltip: "Enable or disable features for individual campus locations" },
      { key: "audit_trail_access", label: "Audit trail / action history", critical: true, tooltip: "View complete log of administrative actions and system changes" },
      { key: "approve_sub_campus_leaders", label: "Approve sub-campus leaders", critical: true, tooltip: "Review and approve leadership appointments for subsidiary campuses" },
      { key: "override_local_settings", label: "Override local campus settings", critical: true, tooltip: "Modify or override configuration settings for individual campuses" }
    ]
  }
};

export function StaffManagement({ communityId, communityType = "church" }: { communityId: number; communityType?: string }) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteDepartment, setInviteDepartment] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPermissionsMatrix, setShowPermissionsMatrix] = useState(false);
  const [selectedMatrixRole, setSelectedMatrixRole] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['📋 Admin & Management']));
  const [searchFilter, setSearchFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get roles for this community type  
  const COMMUNITY_ROLES = getCommunityRoles(communityType);
  


  // Fetch current staff members
  const { data: staffMembers = [], isLoading } = useQuery({
    queryKey: [`/api/communities/${communityId}/staff`],
    enabled: !!communityId
  }) as { data: any[], isLoading: boolean };

  // Invite staff member mutation
  const inviteStaffMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      role: string;
      title: string;
      department: string;
    }) => {
      return apiRequest(`/api/communities/${communityId}/staff/invite`, "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent",
        description: "Staff invitation has been sent successfully",
      });
      setShowInviteDialog(false);
      setInviteEmail("");
      setSelectedRole("");
      setInviteTitle("");
      setInviteDepartment("");
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/staff`] });
    },
    onError: () => {
      toast({
        title: "Invitation Failed",
        description: "Could not send staff invitation. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update staff role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ staffId, role }: { staffId: string; role: string }) => {
      return apiRequest(`/api/communities/${communityId}/staff/${staffId}`, "PUT", { role });
    },
    onSuccess: () => {
      toast({
        title: "Role Updated",
        description: "Staff member role has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/staff`] });
    },
  });

  const getRoleInfo = (roleName: string) => {
    return COMMUNITY_ROLES.find(r => r.name === roleName) || COMMUNITY_ROLES[0];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <p className="text-gray-600">Manage pastors, ministry leaders, and staff members</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPermissionsMatrix(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Permissions
          </Button>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Staff Member</DialogTitle>
                <DialogDescription>
                  Send an email invitation to add a new staff member to your community.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="pastor@church.com"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMUNITY_ROLES.map((role) => (
                        <SelectItem key={role.name} value={role.name}>
                          <div className="flex items-center gap-2">
                            <role.icon className="h-4 w-4" />
                            {role.displayName}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={inviteTitle}
                    onChange={(e) => setInviteTitle(e.target.value)}
                    placeholder="Senior Pastor, Youth Director, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={inviteDepartment}
                    onChange={(e) => setInviteDepartment(e.target.value)}
                    placeholder="Youth Ministry, Music Ministry, etc."
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => inviteStaffMutation.mutate({
                    email: inviteEmail,
                    role: selectedRole,
                    title: inviteTitle,
                    department: inviteDepartment
                  })}
                  disabled={!inviteEmail || !selectedRole || inviteStaffMutation.isPending}
                >
                  {inviteStaffMutation.isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current Staff Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Staff Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading staff members...</div>
          ) : staffMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No staff members yet. Click "Invite Staff" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {staffMembers.map((member: StaffMember) => {
                const roleInfo = getRoleInfo(member.role);
                const Icon = roleInfo.icon;
                
                return (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${roleInfo.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-600">{member.email}</div>
                        <div className="text-sm text-gray-500">
                          {member.title} • {member.department}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(member.status)}
                      <Badge variant="outline" className={roleInfo.color}>
                        {roleInfo.displayName}
                      </Badge>
                      <Select
                        value={member.role}
                        onValueChange={(newRole) => 
                          updateRoleMutation.mutate({ staffId: member.id, role: newRole })
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMUNITY_ROLES.filter(role => role.communityTypes.includes(communityType)).map((role) => (
                            <SelectItem key={role.name} value={role.name}>
                              {role.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Redesigned Permissions Matrix Dialog */}
      <Dialog open={showPermissionsMatrix} onOpenChange={setShowPermissionsMatrix}>
        <DialogContent className="w-[95vw] max-w-[95vw] h-[90vh] max-h-[90vh] p-2 sm:p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg sm:text-xl">
              {communityType.charAt(0).toUpperCase() + communityType.slice(1)} Role Permissions Matrix
            </DialogTitle>
            <DialogDescription className="text-sm">
              Collapsible permission categories with filtering and tooltip guidance. Click role headers to highlight permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search permissions..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {COMMUNITY_ROLES.filter(role => role.communityTypes.includes(communityType)).map((role) => (
                    <SelectItem key={role.name} value={role.name}>
                      {role.displayName} (L{role.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Header Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {COMMUNITY_ROLES.filter(role => role.communityTypes.includes(communityType)).sort((a, b) => a.level - b.level).map((role) => {
                const Icon = role.icon;
                const isSelected = selectedMatrixRole === role.name;
                const isFiltered = roleFilter && roleFilter !== role.name;
                
                return (
                  <button
                    key={role.name}
                    onClick={() => setSelectedMatrixRole(isSelected ? null : role.name)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      isSelected 
                        ? `${role.color} border-purple-500 shadow-lg scale-105` 
                        : isFiltered
                        ? 'opacity-50 bg-gray-50 border-gray-200'
                        : `hover:${role.color} border-gray-200 hover:shadow-md`
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Icon className="h-5 w-5" />
                      <div className="text-xs font-medium">{role.displayName}</div>
                      <div className="text-xs opacity-75">L{role.level}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Original Single Table Design */}
            <TooltipProvider>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow max-h-[60vh] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white dark:bg-gray-800">
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-3 font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Permission</th>
                      {COMMUNITY_ROLES.filter(role => role.communityTypes.includes(communityType)).sort((a, b) => a.level - b.level).map((role) => {
                        const Icon = role.icon;
                        const isHighlighted = selectedMatrixRole === role.name;
                        return (
                          <th
                            key={role.name}
                            className={`text-center p-2 cursor-pointer transition-all min-w-[80px] bg-white dark:bg-gray-800 ${
                              isHighlighted 
                                ? 'bg-blue-100 dark:bg-blue-900' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => setSelectedMatrixRole(selectedMatrixRole === role.name ? null : role.name)}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <Icon className="h-4 w-4" />
                              <span className="text-xs font-medium leading-tight">{role.displayName}</span>
                              <span className="text-xs text-gray-500">L{role.level}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(PERMISSION_CATEGORIES).map(([categoryName, categoryData]) => {
                      const filteredPermissions = categoryData.permissions.filter(permission => {
                        const matchesSearch = !searchFilter || 
                          permission.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          permission.tooltip.toLowerCase().includes(searchFilter.toLowerCase());
                        const matchesRole = !roleFilter || roleFilter === "all" || 
                          COMMUNITY_ROLES.filter(role => role.communityTypes.includes(communityType)).find(r => r.name === roleFilter)?.permissions.includes(permission.key);
                        return matchesSearch && matchesRole;
                      });

                      if (filteredPermissions.length === 0 && (searchFilter || roleFilter)) return null;

                      return filteredPermissions.map((permission, index) => (
                        <tr key={permission.key} className={`border-b border-gray-100 dark:border-gray-700 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-gray-100">{permission.label}</span>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>{permission.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                              {permission.critical && (
                                <Badge variant="destructive" className="text-xs">Critical</Badge>
                              )}
                            </div>
                          </td>
                          {COMMUNITY_ROLES.filter(role => role.communityTypes.includes(communityType)).sort((a, b) => a.level - b.level).map((role) => {
                            const hasPermission = role.permissions.includes(permission.key);
                            const isHighlighted = selectedMatrixRole === role.name;
                            return (
                              <td
                                key={role.name}
                                className={`text-center p-3 ${
                                  isHighlighted 
                                    ? hasPermission 
                                      ? 'bg-green-100 dark:bg-green-900' 
                                      : 'bg-red-100 dark:bg-red-900'
                                    : ''
                                }`}
                              >
                                {hasPermission ? (
                                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                                ) : (
                                  <X className="h-5 w-5 text-gray-400 mx-auto" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ));
                    }).flat()}
                  </tbody>
                </table>
              </div>
            </TooltipProvider>

            {/* Usage Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>How to use:</strong> View all permissions in the single table. Hover over ⓘ icons for detailed descriptions. 
                  Click role headers to highlight their permissions. Use search and role filters to focus on specific areas.
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
