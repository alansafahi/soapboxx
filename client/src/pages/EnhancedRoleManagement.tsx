import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { Crown, Shield, Map, Building, BookOpen, Heart, Users, Megaphone, Briefcase, User, CheckCircle, Settings } from "lucide-react";
import { apiRequest } from "../lib/queryClient";

interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  level: number;
  color: string;
  permissions: string[];
  canManageRoles: string[];
}

interface Permission {
  id: number;
  name: string;
  displayName: string;
  category: string;
  description: string;
}

interface RoleTemplate {
  name: string;
  description: string;
  recommendedRoles: string[];
  autoAssignPermissions: Record<string, string[]>;
}

const ROLE_TEMPLATES: Record<string, RoleTemplate> = {
  "small_church": {
    name: "Small Church (Under 50)",
    description: "Simplified roles for smaller congregations",
    recommendedRoles: ["church_admin", "lead_pastor", "staff", "member"],
    autoAssignPermissions: {
      "staff": ["events.create.optional", "comments.moderate.optional"]
    }
  },
  "mid_size_church": {
    name: "Mid-size Church",
    description: "Balanced structure for growing churches",
    recommendedRoles: ["church_admin", "lead_pastor", "pastor", "minister", "staff", "member"],
    autoAssignPermissions: {
      "minister": ["prayers.moderate.ministry_scope", "discussions.moderate.ministry_scope"],
      "staff": ["events.create.optional"]
    }
  },
  "large_church": {
    name: "Large Church with Ministries",
    description: "Full role structure for complex organizations",
    recommendedRoles: ["church_admin", "lead_pastor", "pastor", "minister", "social_manager", "staff", "member"],
    autoAssignPermissions: {
      "minister": ["prayers.moderate.ministry_scope", "discussions.moderate.ministry_scope", "comments.moderate.ministry_scope"],
      "staff": ["events.create.optional", "comments.moderate.optional", "volunteer.coordinate"]
    }
  },
  "multi_church_network": {
    name: "Multi-Church Network",
    description: "Regional or denominational oversight structure",
    recommendedRoles: ["regional_admin", "church_admin", "lead_pastor", "pastor", "minister", "social_manager", "staff", "member"],
    autoAssignPermissions: {
      "regional_admin": ["audit.logs.access.regional"],
      "minister": ["prayers.moderate.ministry_scope", "discussions.moderate.ministry_scope"],
      "staff": ["events.create.optional", "comments.moderate.optional"]
    }
  }
};

const getRoleIcon = (roleName: string) => {
  const icons = {
    owner: Crown,
    regional_admin: Map,
    super_admin: Shield,
    church_admin: Building,
    lead_pastor: BookOpen,
    pastor: Heart,
    minister: Users,
    social_manager: Megaphone,
    staff: Briefcase,
    member: User
  };
  return icons[roleName as keyof typeof icons] || User;
};

export default function EnhancedRoleManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [assignRoleDialog, setAssignRoleDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedChurchId, setSelectedChurchId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  const { data: permissions = [] } = useQuery<Permission[]>({
    queryKey: ["/api/permissions"],
  });

  const assignRoleMutation = useMutation({
    mutationFn: async (data: { userId: string; churchId: number; roleName: string }) => {
      return apiRequest(`/api/roles/assign`, {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role assigned successfully!",
      });
      setAssignRoleDialog(false);
      setSelectedUserId("");
      setSelectedChurchId("");
      setSelectedRole("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const applyTemplateMutation = useMutation({
    mutationFn: async (data: { churchId: number; templateName: string }) => {
      return apiRequest(`/api/roles/apply-template`, {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role template applied successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAssignRole = () => {
    if (!selectedUserId || !selectedChurchId || !selectedRole) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    assignRoleMutation.mutate({
      userId: selectedUserId,
      churchId: parseInt(selectedChurchId),
      roleName: selectedRole,
    });
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate || !selectedChurchId) {
      toast({
        title: "Error",
        description: "Please select a template and church ID",
        variant: "destructive",
      });
      return;
    }

    applyTemplateMutation.mutate({
      churchId: parseInt(selectedChurchId),
      templateName: selectedTemplate,
    });
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Role Management</h1>
          <p className="text-gray-600 mt-2">
            Manage roles, permissions, and apply templates for different church structures
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Dialog open={assignRoleDialog} onOpenChange={setAssignRoleDialog}>
            <DialogTrigger asChild>
              <Button>Assign Role</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Role to User</DialogTitle>
                <DialogDescription>
                  Assign a role to a user for a specific church
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    placeholder="Enter user ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="churchId">Church ID</Label>
                  <Input
                    id="churchId"
                    value={selectedChurchId}
                    onChange={(e) => setSelectedChurchId(e.target.value)}
                    placeholder="Enter church ID"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role: Role) => (
                        <SelectItem key={role.id} value={role.name}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: role.color }}
                            />
                            <span>{role.displayName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAssignRole} disabled={assignRoleMutation.isPending}>
                  {assignRoleMutation.isPending ? "Assigning..." : "Assign Role"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => {
              const IconComponent = getRoleIcon(role.name);
              return (
                <Card key={role.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${role.color}20`, color: role.color }}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.displayName}</CardTitle>
                        <Badge variant="outline">Level {role.level}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {role.description}
                    </CardDescription>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Permissions ({role.permissions?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions?.slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission.split('.').pop()}
                          </Badge>
                        ))}
                        {(role.permissions?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(role.permissions?.length || 0) - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize">{category} Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryPermissions.map((permission) => (
                    <div 
                      key={permission.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-medium text-sm">{permission.displayName}</p>
                        <p className="text-xs text-gray-500">{permission.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Templates</CardTitle>
              <CardDescription>
                Quick setup templates for different church sizes and structures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(ROLE_TEMPLATES).map(([key, template]) => (
                  <Card 
                    key={key} 
                    className={`cursor-pointer border-2 transition-colors ${
                      selectedTemplate === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedTemplate(key)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Recommended Roles:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.recommendedRoles.map((roleName) => {
                            const role = roles.find(r => r.name === roleName);
                            return (
                              <Badge 
                                key={roleName} 
                                variant="outline"
                                style={{ borderColor: role?.color, color: role?.color }}
                              >
                                {role?.displayName || roleName}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {selectedTemplate && (
                <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <Label htmlFor="templateChurchId">Church ID</Label>
                    <Input
                      id="templateChurchId"
                      value={selectedChurchId}
                      onChange={(e) => setSelectedChurchId(e.target.value)}
                      placeholder="Enter church ID to apply template"
                      type="number"
                    />
                  </div>
                  <Button 
                    onClick={handleApplyTemplate} 
                    disabled={applyTemplateMutation.isPending}
                    className="mt-6"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {applyTemplateMutation.isPending ? "Applying..." : "Apply Template"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                Complete overview of role permissions and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Enhanced Features:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Regional Admin:</strong> New role for managing multiple churches</li>
                  <li><strong>Minister Enhancements:</strong> Ministry-scoped moderation and prayer flagging</li>
                  <li><strong>Staff Flexibility:</strong> Optional permissions for events and comment moderation</li>
                  <li><strong>Member Directory:</strong> Defined access rules - staff, pastors, group leaders, public bios only</li>
                  <li><strong>Audit Logs:</strong> Access control for compliance and security tracking</li>
                </ul>
                <p className="mt-4">
                  <strong>Download Matrices:</strong> Enhanced role-permission matrices are available as CSV files 
                  for detailed analysis and planning.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}