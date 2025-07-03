import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { useToast } from "../hooks/use-toast";
import { 
  Crown, 
  Shield, 
  Settings, 
  BookOpen, 
  Heart, 
  Users, 
  Megaphone, 
  UserCheck, 
  User,
  Plus,
  Edit,
  Eye,
  Calendar,
  MessageSquare,
  PrayerHands,
  Activity
} from "lucide-react";

interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  level: number;
  scope: string;
  permissions: string[];
  icon: string;
  color: string;
  canManageRoles: string[];
  isActive: boolean;
}

interface Permission {
  id: number;
  name: string;
  displayName: string;
  description: string;
  category: string;
  resource: string;
  action: string;
  scope: string;
  isActive: boolean;
}

interface UserRole {
  roleId: number;
  roleName: string;
  roleDisplayName: string;
  roleLevel: number;
  permissions: string[];
  additionalPermissions?: string[];
  restrictedPermissions?: string[];
  title?: string;
  department?: string;
}

const roleIcons = {
  crown: Crown,
  "shield-check": Shield,
  settings: Settings,
  "book-open": BookOpen,
  heart: Heart,
  users: Users,
  megaphone: Megaphone,
  "user-check": UserCheck,
  user: User
};

export default function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [assignRoleDialog, setAssignRoleDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedChurchId, setSelectedChurchId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["/api/roles"],
  });

  // Fetch permissions
  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ["/api/permissions"],
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      churchId: number;
      roleName: string;
      title?: string;
      department?: string;
    }) => {
      const response = await fetch(`/api/users/${data.userId}/assign-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to assign role");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role assigned successfully",
      });
      setAssignRoleDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
    },
  });

  const groupedPermissions = permissions.reduce((acc: Record<string, Permission[]>, permission: Permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  const getRoleIcon = (iconName: string) => {
    const IconComponent = roleIcons[iconName as keyof typeof roleIcons] || User;
    return IconComponent;
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case "system": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "church": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "ministry": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleAssignRole = (data: any) => {
    assignRoleMutation.mutate({
      userId: selectedUserId,
      churchId: parseInt(selectedChurchId),
      roleName: data.roleName,
      title: data.title,
      department: data.department,
    });
  };

  if (rolesLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions across the SoapBox Super App
          </p>
        </div>
        <Dialog open={assignRoleDialog} onOpenChange={setAssignRoleDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Assign Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Assign Role to User</DialogTitle>
              <DialogDescription>
                Assign a role to a user within a specific church context
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
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
                <Select onValueChange={(value) => handleAssignRole({ roleName: value })}>
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
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role: Role) => {
              const IconComponent = getRoleIcon(role.icon);
              return (
                <Card
                  key={role.id}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg border-2 hover:border-primary/20"
                  onClick={() => setSelectedRole(role)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: role.color + "20", color: role.color }}
                        >
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{role.displayName}</CardTitle>
                          <Badge variant="outline" className={getScopeColor(role.scope)}>
                            {role.scope.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="secondary">Level {role.level}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-3">
                      {role.description}
                    </CardDescription>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        <strong>{role.permissions.length}</strong> permissions
                      </div>
                      {role.canManageRoles.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Can manage <strong>{role.canManageRoles.length}</strong> roles
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedRole && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: selectedRole.color + "20", color: selectedRole.color }}
                  >
                    {(() => {
                      const IconComponent = getRoleIcon(selectedRole.icon);
                      return <IconComponent className="h-6 w-6" />;
                    })()}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{selectedRole.displayName}</CardTitle>
                    <CardDescription>{selectedRole.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Role Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Level:</span>
                        <span>{selectedRole.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Scope:</span>
                        <Badge variant="outline" className={getScopeColor(selectedRole.scope)}>
                          {selectedRole.scope.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Permissions:</span>
                        <span>{selectedRole.permissions.length}</span>
                      </div>
                    </div>
                  </div>

                  {selectedRole.canManageRoles.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Can Manage Roles</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRole.canManageRoles.map((roleName) => {
                          const managedRole = roles.find((r: Role) => r.name === roleName);
                          return (
                            <Badge key={roleName} variant="secondary">
                              {managedRole?.displayName || roleName}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Permissions ({selectedRole.permissions.length})</h4>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
                        const rolePermissions = categoryPermissions.filter(p => 
                          selectedRole.permissions.includes(p.name)
                        );
                        
                        if (rolePermissions.length === 0) return null;

                        return (
                          <div key={category}>
                            <h5 className="font-medium text-sm text-muted-foreground mb-2 uppercase tracking-wide">
                              {category}
                            </h5>
                            <div className="grid grid-cols-1 gap-2">
                              {rolePermissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                                >
                                  <div>
                                    <div className="font-medium text-sm">
                                      {permission.displayName}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {permission.description}
                                    </div>
                                  </div>
                                  <Badge variant="outline" className={getScopeColor(permission.scope)}>
                                    {permission.scope}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>{category.charAt(0).toUpperCase() + category.slice(1)} Permissions</span>
                    <Badge variant="secondary">{categoryPermissions.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryPermissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="p-4 rounded-lg border bg-muted/50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">
                            {permission.displayName}
                          </div>
                          <Badge variant="outline" className={getScopeColor(permission.scope)}>
                            {permission.scope}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {permission.description}
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <Badge variant="outline">{permission.resource}</Badge>
                          <Badge variant="outline">{permission.action}</Badge>
                        </div>
                      </div>
                    ))}
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