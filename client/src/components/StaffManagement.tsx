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
  AlertTriangle
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
      name: "church_admin",
      displayName: "Church Administrator", 
      description: "Highest administrative authority with full access",
      level: 1,
      color: "bg-red-100 text-red-800",
      icon: Crown,
      communityTypes: ["church"],
      permissions: [
        "manage_staff", "assign_roles", "approve_content", "moderate_prayers", 
        "manage_events", "access_analytics", "manage_finances", "send_communications", 
        "manage_settings", "manage_members", "manage_facilities", "access_finances"
      ]
    },
    {
      name: "lead_pastor",
      displayName: "Lead Pastor",
      description: "Primary spiritual leader with full ministry access",
      level: 2,
      color: "bg-purple-100 text-purple-800",
      icon: Crown,
      communityTypes: ["church"],
      permissions: [
        "manage_staff", "approve_content", "moderate_prayers", "manage_events", 
        "access_analytics", "send_communications", "manage_settings", "manage_members"
      ]
    },
    {
      name: "associate_pastor",
      displayName: "Associate Pastor",
      description: "Assistant pastoral role with ministry leadership responsibilities",
      level: 3,
      color: "bg-blue-100 text-blue-800",
      icon: Shield,
      communityTypes: ["church"],
      permissions: [
        "approve_content", "moderate_prayers", "manage_events", 
        "access_analytics", "send_communications", "manage_members"
      ]
    },
    {
      name: "youth_pastor",
      displayName: "Youth Pastor",
      description: "Leader of youth ministry programs and activities",
      level: 4,
      color: "bg-green-100 text-green-800",
      icon: Users,
      communityTypes: ["church"],
      permissions: [
        "manage_events", "moderate_prayers", "create_content", 
        "send_communications", "access_analytics", "manage_volunteers"
      ]
    },
    {
      name: "worship_leader",
      displayName: "Worship Leader",
      description: "Oversees music ministry and worship services",
      level: 4,
      color: "bg-orange-100 text-orange-800",
      icon: Music,
      communityTypes: ["church"],
      permissions: [
        "manage_events", "upload_music", "create_content",
        "manage_volunteers", "access_analytics"
      ]
    },
    {
      name: "ministry_leader",
      displayName: "Ministry Leader",
      description: "Leader of specific ministry departments",
      level: 5,
      color: "bg-indigo-100 text-indigo-800",
      icon: Heart,
      communityTypes: ["church", "ministry"],
      permissions: [
        "manage_events", "create_content", "moderate_prayers",
        "send_communications", "manage_volunteers"
      ]
    },
    {
      name: "administrator",
      displayName: "Administrator",
      description: "Handles administrative tasks and operations",
      level: 6,
      color: "bg-gray-100 text-gray-800",
      icon: Settings,
      communityTypes: ["church", "ministry", "group"],
      permissions: [
        "manage_members", "manage_events", "access_analytics",
        "send_communications", "manage_facilities"
      ]
    },
    {
      name: "group_leader",
      displayName: "Group Leader",
      description: "Leader of small groups and community circles",
      level: 3,
      color: "bg-teal-100 text-teal-800",
      icon: Users,
      communityTypes: ["group"],
      permissions: [
        "manage_events", "create_content", "moderate_prayers",
        "send_communications", "manage_volunteers"
      ]
    },
    {
      name: "coordinator",
      displayName: "Coordinator",
      description: "Coordinates activities and member engagement",
      level: 4,
      color: "bg-cyan-100 text-cyan-800",
      icon: Calendar,
      communityTypes: ["group", "ministry"],
      permissions: [
        "manage_events", "create_content", "manage_volunteers"
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

  // Filter roles based on community type
  return baseRoles.filter(role => role.communityTypes.includes(communityType));
};

const AVAILABLE_ROLES = getCommunityRoles();

const PERMISSION_CATEGORIES = {
  "Staff Management": [
    { key: "manage_staff", label: "Invite & manage staff members", critical: true },
    { key: "assign_roles", label: "Assign roles to members", critical: true }
  ],
  "Content & Communication": [
    { key: "approve_content", label: "Approve user-generated content", critical: false },
    { key: "create_content", label: "Create announcements & posts", critical: false },
    { key: "send_communications", label: "Send emails & notifications", critical: false },
    { key: "moderate_prayers", label: "Moderate prayer requests", critical: false }
  ],
  "Events & Ministry": [
    { key: "manage_events", label: "Create & manage events", critical: false },
    { key: "manage_volunteers", label: "Coordinate volunteers", critical: false },
    { key: "upload_music", label: "Upload worship music", critical: false }
  ],
  "Analytics & Reports": [
    { key: "access_analytics", label: "View engagement analytics", critical: false },
    { key: "access_finances", label: "View financial reports", critical: true },
    { key: "manage_finances", label: "Manage donations & finances", critical: true }
  ],
  "Settings & Security": [
    { key: "manage_settings", label: "Modify church settings", critical: true },
    { key: "manage_members", label: "Add/remove members", critical: false },
    { key: "manage_facilities", label: "Manage facilities & resources", critical: false }
  ]
};

export function StaffManagement({ communityId, communityType = "church" }: { communityId: number; communityType?: string }) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteDepartment, setInviteDepartment] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPermissionsMatrix, setShowPermissionsMatrix] = useState(false);
  const [selectedMatrixRole, setSelectedMatrixRole] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get roles for this community type  
  const COMMUNITY_ROLES = getCommunityRoles(communityType);
  
  // Debug: Check if roles are properly loaded
  console.log('Community Type:', communityType);
  console.log('Community Roles:', COMMUNITY_ROLES);

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
                          {COMMUNITY_ROLES.map((role) => (
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
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {communityType.charAt(0).toUpperCase() + communityType.slice(1)} Role Permissions Matrix
            </DialogTitle>
            <DialogDescription>
              Click on any column header to highlight that role's permissions. This matrix shows roles available for {communityType} communities.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Enhanced Permissions Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left p-4 font-semibold min-w-[300px] sticky left-0 bg-gray-50 dark:bg-gray-800 z-10">
                        Permission
                      </th>
                      {COMMUNITY_ROLES.map((role) => {
                        const Icon = role.icon;
                        const isHighlighted = selectedMatrixRole === role.name;
                        return (
                          <th 
                            key={role.name}
                            onClick={() => setSelectedMatrixRole(isHighlighted ? null : role.name)}
                            className={`text-center p-3 font-medium min-w-[120px] cursor-pointer transition-all duration-200 border-l-2 ${
                              isHighlighted 
                                ? `${role.color} border-l-4 border-purple-500 shadow-lg transform scale-105` 
                                : `hover:${role.color} hover:shadow-md border-gray-200`
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className={`p-2 rounded-full ${isHighlighted ? 'bg-white shadow-md' : 'bg-white/50'}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="text-sm font-semibold leading-tight">
                                {role.displayName}
                              </div>
                              <div className="text-xs opacity-75 bg-white/80 px-2 py-1 rounded-full">
                                Level {role.level}
                              </div>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
                      <React.Fragment key={category}>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          <td colSpan={COMMUNITY_ROLES.length + 1} className="p-3 font-semibold text-sm border-t-2 sticky left-0 bg-gray-100 dark:bg-gray-800 z-10">
                            📋 {category}
                          </td>
                        </tr>
                        {permissions.map((permission) => (
                          <tr 
                            key={permission.key} 
                            className="border-t hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="p-4 sticky left-0 bg-white dark:bg-gray-900 z-10 border-r">
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="font-medium text-sm">{permission.label}</div>
                                  {permission.critical && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <AlertTriangle className="h-3 w-3 text-red-500" />
                                      <span className="text-xs text-red-600 font-medium">Critical Permission</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            {COMMUNITY_ROLES.map((role) => {
                              const hasPermission = role.permissions.includes(permission.key);
                              const isHighlighted = selectedMatrixRole === role.name;
                              return (
                                <td 
                                  key={role.name} 
                                  className={`text-center p-3 transition-all duration-200 border-l-2 ${
                                    isHighlighted 
                                      ? 'bg-purple-50 dark:bg-purple-900/20 border-l-purple-500 shadow-inner' 
                                      : 'border-gray-200 hover:bg-gray-50'
                                  }`}
                                >
                                  {hasPermission ? (
                                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                                      isHighlighted 
                                        ? 'bg-green-200 text-green-800 border-2 border-green-400 shadow-lg' 
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}>
                                      <Check className="h-5 w-5 font-bold" />
                                    </div>
                                  ) : (
                                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                                      isHighlighted 
                                        ? 'bg-red-200 text-red-800 border-2 border-red-400 shadow-lg' 
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}>
                                      <X className="h-5 w-5" />
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Community Type Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    {communityType.charAt(0).toUpperCase() + communityType.slice(1)} Community Matrix
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                    This matrix shows {COMMUNITY_ROLES.length} roles specifically designed for {communityType} communities. 
                    Different community types (Churches, Groups, Ministries) have different role structures and permissions.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {COMMUNITY_ROLES.map((role) => (
                      <div key={role.name} className={`px-3 py-1 rounded-full text-xs font-medium ${role.color}`}>
                        Level {role.level}: {role.displayName}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Role Summary */}
            {selectedMatrixRole && (
              <div className="border rounded-lg p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                {(() => {
                  const role = COMMUNITY_ROLES.find(r => r.name === selectedMatrixRole);
                  if (!role) return null;
                  const Icon = role.icon;
                  const rolePermissions = Object.entries(PERMISSION_CATEGORIES)
                    .flatMap(([category, permissions]) => 
                      permissions.filter(p => role.permissions.includes(p.key))
                        .map(p => ({ ...p, category }))
                    );
                  
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full shadow-lg ${role.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xl">{role.displayName}</h4>
                          <p className="text-gray-600 dark:text-gray-300">{role.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium">Authority Level: {role.level}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">{rolePermissions.length} permissions</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-semibold mb-3 text-lg">Role Permissions:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {rolePermissions.map((permission) => (
                            <div key={permission.key} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium">{permission.label}</span>
                                {permission.critical && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                    <span className="text-xs text-red-600 font-medium">Critical</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>
                <strong>Usage:</strong> Click column headers to highlight roles. Critical permissions marked with ⚠️ require careful consideration.
                Church Administrator (Level 1) has the highest authority with full access to all features.
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}