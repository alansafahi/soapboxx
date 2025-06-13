import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Settings, Crown, Shield, Users, ChevronDown } from "lucide-react";

interface RoleData {
  currentRole: string;
  availableRoles: string[];
  canSwitch: boolean;
}

const roleDisplayNames: { [key: string]: string } = {
  soapbox_owner: "SoapBox Owner",
  super_admin: "Super Admin",
  admin: "Admin",
  pastor: "Pastor",
  lead_pastor: "Lead Pastor",
  church_admin: "Church Admin",
  minister: "Minister",
  associate_pastor: "Associate Pastor",
  youth_pastor: "Youth Pastor",
  worship_leader: "Worship Leader",
  deacon: "Deacon",
  elder: "Elder",
  member: "Member",
  new_member: "New Member"
};

const roleIcons: { [key: string]: any } = {
  soapbox_owner: Crown,
  super_admin: Shield,
  admin: Shield,
  pastor: Users,
  lead_pastor: Users,
  church_admin: Settings,
  minister: Users,
  associate_pastor: Users,
  youth_pastor: Users,
  worship_leader: Users,
  deacon: Users,
  elder: Users,
  member: Users,
  new_member: Users
};

const roleColors: { [key: string]: string } = {
  soapbox_owner: "bg-purple-600 text-white",
  super_admin: "bg-red-600 text-white",
  admin: "bg-blue-600 text-white",
  pastor: "bg-green-600 text-white",
  lead_pastor: "bg-green-700 text-white",
  church_admin: "bg-indigo-600 text-white",
  minister: "bg-emerald-600 text-white",
  associate_pastor: "bg-teal-600 text-white",
  youth_pastor: "bg-cyan-600 text-white",
  worship_leader: "bg-orange-600 text-white",
  deacon: "bg-amber-600 text-white",
  elder: "bg-stone-600 text-white",
  member: "bg-gray-600 text-white",
  new_member: "bg-slate-500 text-white"
};

export default function RoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if this is demo environment (localhost/dev domains)
  const isDemoSite = window.location.hostname.includes('localhost') || 
                     window.location.hostname.includes('127.0.0.1') ||
                     window.location.hostname.includes('replit.dev');

  console.log('RoleSwitcher Debug:', { 
    isDemoSite, 
    hostname: window.location.hostname,
    roleData,
    isLoading 
  });

  const { data: roleData, isLoading } = useQuery<RoleData>({
    queryKey: ["/api/auth/available-roles"],
    refetchOnWindowFocus: false,
  });

  const switchRoleMutation = useMutation({
    mutationFn: async (newRole: string) => {
      return apiRequest('/api/auth/switch-role', {
        method: 'POST',
        body: { newRole }
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Role Switched",
        description: data.message,
      });
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/available-roles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user-role"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Refresh the page to apply new permissions
      setTimeout(() => window.location.reload(), 500);
    },
    onError: (error) => {
      toast({
        title: "Role Switch Failed",
        description: error.message || "Failed to switch role",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 text-sm">
        <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
        Loading roles...
      </div>
    );
  }

  if (!roleData) {
    return (
      <div className="flex items-center gap-2 p-2 text-sm text-gray-500">
        <Settings className="h-4 w-4" />
        Role switching unavailable
      </div>
    );
  }

  // On production sites, only show role switcher to SoapBox Owner
  if (!isDemoSite && roleData.currentRole !== 'soapbox_owner') {
    return null;
  }

  if (!roleData.canSwitch) {
    return (
      <div className="flex items-center gap-2 p-2 text-sm text-gray-500">
        <Shield className="h-4 w-4" />
        Current: {roleDisplayNames[roleData.currentRole] || roleData.currentRole}
      </div>
    );
  }

  const currentRoleDisplay = roleDisplayNames[roleData.currentRole] || roleData.currentRole;
  const CurrentRoleIcon = roleIcons[roleData.currentRole] || Users;
  const currentRoleColor = roleColors[roleData.currentRole] || "bg-gray-600 text-white";

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border-purple-200 hover:bg-purple-50"
        disabled={switchRoleMutation.isPending}
      >
        <CurrentRoleIcon className="h-4 w-4" />
        <Badge className={`${currentRoleColor} text-xs px-2 py-1`}>
          {currentRoleDisplay}
        </Badge>
        <ChevronDown className="h-3 w-3" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-gray-900 mb-1">Switch Role</h3>
            <p className="text-xs text-gray-600">
              Testing mode - switch between available roles
            </p>
          </div>
          
          <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
            {roleData.availableRoles.map((role) => {
              const RoleIcon = roleIcons[role] || Users;
              const roleDisplay = roleDisplayNames[role] || role;
              const roleColor = roleColors[role] || "bg-gray-600 text-white";
              const isCurrent = role === roleData.currentRole;
              
              return (
                <button
                  key={role}
                  onClick={() => {
                    if (!isCurrent) {
                      switchRoleMutation.mutate(role);
                    }
                    setIsOpen(false);
                  }}
                  disabled={isCurrent || switchRoleMutation.isPending}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                    isCurrent 
                      ? 'bg-purple-100 text-purple-900 cursor-default' 
                      : 'hover:bg-gray-50 text-gray-700'
                  } ${switchRoleMutation.isPending ? 'opacity-50' : ''}`}
                >
                  <RoleIcon className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{roleDisplay}</span>
                      <Badge className={`${roleColor} text-xs px-1.5 py-0.5`}>
                        {role.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-xs text-purple-600 font-medium">Current</span>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="p-2 border-t border-gray-100">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}