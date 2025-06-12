import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InteractiveTour from "@/components/InteractiveTour";
import { useAuth } from "@/hooks/useAuth";
import { useRoleBasedTour } from "@/hooks/useRoleBasedTour";
import { useQuery } from "@tanstack/react-query";

export default function TourTestPage() {
  const { user, isAuthenticated } = useAuth();
  const [showTour, setShowTour] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  
  // Get current tour status
  const { shouldShowTour, userRole, isNewUser, hasNewRoleAssignment, completeTour, isLoading } = useRoleBasedTour();
  
  // Get user data for display
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
    retry: false,
  });

  const allRoles = [
    { 
      id: "platform_admin", 
      name: "Platform Administrator", 
      description: "Complete platform oversight and management",
      color: "bg-red-500 text-white",
      category: "Platform"
    },
    { 
      id: "church_admin", 
      name: "Church Administrator", 
      description: "Central hub for church management",
      color: "bg-blue-500 text-white",
      category: "Church Leadership"
    },
    { 
      id: "staff", 
      name: "Church Staff Member", 
      description: "Ministry leadership and member support",
      color: "bg-purple-500 text-white",
      category: "Church Leadership"
    },
    { 
      id: "volunteer", 
      name: "Church Volunteer", 
      description: "Active volunteer in church activities",
      color: "bg-orange-500 text-white",
      category: "Church Members"
    },
    { 
      id: "member", 
      name: "Church Member", 
      description: "Regular church member exploring the platform",
      color: "bg-green-500 text-white",
      category: "Church Members"
    }
  ];

  const startTourForRole = (roleId: string) => {
    setSelectedRole(roleId);
    setShowTour(true);
  };

  const handleTourComplete = () => {
    setShowTour(false);
    setSelectedRole("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to test the guided tour system</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full"
            >
              Login with Replit
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group roles by category
  const rolesByCategory = allRoles.reduce((acc, role) => {
    if (!acc[role.category]) acc[role.category] = [];
    acc[role.category].push(role);
    return acc;
  }, {} as Record<string, typeof allRoles>);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Comprehensive Role-Based Tour System</CardTitle>
            <CardDescription>
              Test the complete tour system for all platform and member roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Current User</h3>
                <div className="text-sm text-blue-800">
                  <p><strong>Email:</strong> {(userData as any)?.email || 'Not available'}</p>
                  <p><strong>Name:</strong> {(userData as any)?.firstName} {(userData as any)?.lastName}</p>
                  <p><strong>Onboarding Complete:</strong> {(userData as any)?.has_completed_onboarding ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Current Tour Status</h3>
                <div className="text-sm text-purple-800 space-y-1">
                  <p><strong>Should Show Tour:</strong> {shouldShowTour ? 'Yes' : 'No'}</p>
                  <p><strong>Detected Role:</strong> {userRole || 'None'}</p>
                  <p><strong>Is New User:</strong> {isNewUser ? 'Yes' : 'No'}</p>
                  <p><strong>Has New Role Assignment:</strong> {hasNewRoleAssignment ? 'Yes' : 'No'}</p>
                  <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
                </div>
                {shouldShowTour && userRole && (
                  <div className="mt-3">
                    <Button 
                      onClick={() => startTourForRole(userRole)}
                      className="bg-purple-600 hover:bg-purple-700"
                      size="sm"
                    >
                      Start Your {userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Tour
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {Object.entries(rolesByCategory).map(([category, roles]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="font-semibold text-gray-900">{category} Tours</h3>
                    <p className="text-sm text-gray-600">
                      Experience role-specific welcome tours designed for {category.toLowerCase()} users.
                    </p>
                    
                    <div className="grid gap-3">
                      {roles.map((role) => (
                        <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={role.color}>{role.name}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{role.description}</p>
                          </div>
                          <Button 
                            onClick={() => startTourForRole(role.id)}
                            variant="outline"
                            size="sm"
                          >
                            Start Tour
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Tour System Features</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Role-specific welcome messages and guidance</li>
                  <li>• Interactive step-by-step platform navigation</li>
                  <li>• Contextual tips for role-specific responsibilities</li>
                  <li>• Progress tracking and completion persistence</li>
                  <li>• New role assignment detection and triggering</li>
                  <li>• Responsive design with smooth animations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {showTour && selectedRole && (
          <InteractiveTour
            isOpen={showTour}
            onClose={handleTourComplete}
            role={selectedRole}
          />
        )}
      </div>
    </div>
  );
}