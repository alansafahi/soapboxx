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

const AVAILABLE_ROLES: Role[] = [
  {
    name: "lead_pastor",
    displayName: "Lead Pastor",
    description: "Primary spiritual leader with full administrative access",
    level: 2,
    color: "bg-purple-100 text-purple-800",
    icon: Crown,
    permissions: [
      "manage_staff", "approve_content", "moderate_prayers", "manage_events", 
      "access_analytics", "manage_finances", "send_communications", "manage_settings"
    ]
  },
  {
    name: "associate_pastor",
    displayName: "Associate Pastor",
    description: "Assistant pastoral role with ministry leadership responsibilities",
    level: 3,
    color: "bg-blue-100 text-blue-800",
    icon: Shield,
    permissions: [
      "approve_content", "moderate_prayers", "manage_events", 
      "access_analytics", "send_communications"
    ]
  },
  {
    name: "youth_pastor",
    displayName: "Youth Pastor",
    description: "Leader of youth ministry programs and activities",
    level: 4,
    color: "bg-green-100 text-green-800",
    icon: Users,
    permissions: [
      "manage_youth_events", "moderate_prayers", "create_content", 
      "send_youth_communications", "access_youth_analytics"
    ]
  },
  {
    name: "worship_leader",
    displayName: "Worship Leader",
    description: "Oversees music ministry and worship services",
    level: 4,
    color: "bg-orange-100 text-orange-800",
    icon: Music,
    permissions: [
      "manage_worship_events", "upload_music", "create_worship_content",
      "manage_worship_team", "access_worship_analytics"
    ]
  },
  {
    name: "ministry_leader",
    displayName: "Ministry Leader",
    description: "Leader of specific ministry departments",
    level: 5,
    color: "bg-indigo-100 text-indigo-800",
    icon: Heart,
    permissions: [
      "manage_ministry_events", "create_content", "moderate_ministry_prayers",
      "send_ministry_communications", "manage_volunteers"
    ]
  },
  {
    name: "administrator",
    displayName: "Church Administrator",
    description: "Handles administrative tasks and member management",
    level: 6,
    color: "bg-gray-100 text-gray-800",
    icon: Settings,
    permissions: [
      "manage_members", "manage_events", "access_analytics",
      "send_communications", "manage_facilities"
    ]
  }
];

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

export function StaffManagement({ communityId }: { communityId: number }) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteDepartment, setInviteDepartment] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPermissionsMatrix, setShowPermissionsMatrix] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    return AVAILABLE_ROLES.find(r => r.name === roleName) || AVAILABLE_ROLES[0];
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
                      {AVAILABLE_ROLES.map((role) => (
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
                          {AVAILABLE_ROLES.map((role) => (
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

      {/* Permissions Matrix Dialog */}
      <Dialog open={showPermissionsMatrix} onOpenChange={setShowPermissionsMatrix}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Role Permissions Matrix</DialogTitle>
            <DialogDescription>
              See what features and capabilities each role has access to in your community.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Role Legend */}
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ROLES.map((role) => {
                const Icon = role.icon;
                return (
                  <Badge key={role.name} variant="outline" className={role.color}>
                    <Icon className="h-3 w-3 mr-1" />
                    {role.displayName}
                  </Badge>
                );
              })}
            </div>

            {/* Permissions Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium">Permission</th>
                    {AVAILABLE_ROLES.map((role) => (
                      <th key={role.name} className="text-center p-2 font-medium text-xs">
                        {role.displayName.split(' ')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
                    <React.Fragment key={category}>
                      <tr className="bg-gray-100">
                        <td colSpan={AVAILABLE_ROLES.length + 1} className="p-2 font-medium text-sm">
                          {category}
                        </td>
                      </tr>
                      {permissions.map((permission) => (
                        <tr key={permission.key} className="border-t">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {permission.label}
                              {permission.critical && (
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                          </td>
                          {AVAILABLE_ROLES.map((role) => (
                            <td key={role.name} className="text-center p-2">
                              {role.permissions.includes(permission.key) ? (
                                <Check className="h-4 w-4 text-green-600 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-gray-300 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-xs text-gray-500 flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              Critical permissions require careful consideration before assignment
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}