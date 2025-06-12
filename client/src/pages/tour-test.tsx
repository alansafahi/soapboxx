import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InteractiveTour from "@/components/InteractiveTour";
import { useAuth } from "@/hooks/useAuth";

export default function TourTestPage() {
  const { user, isAuthenticated } = useAuth();
  const [showTour, setShowTour] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const platformRoles = [
    { 
      id: "soapbox_owner", 
      name: "SoapBox Owner", 
      description: "Ultimate platform authority with full system control",
      color: "bg-purple-600 text-white"
    },
    { 
      id: "system_admin", 
      name: "System Admin", 
      description: "Platform-wide administrative capabilities",
      color: "bg-blue-600 text-white"
    },
    { 
      id: "support_agent", 
      name: "Support Agent", 
      description: "Customer support and user assistance role",
      color: "bg-green-600 text-white"
    }
  ];

  const memberRoles = [
    { 
      id: "member", 
      name: "Church Member", 
      description: "Regular church member exploring the platform",
      color: "bg-indigo-500 text-white"
    },
    { 
      id: "new_member", 
      name: "New Member", 
      description: "First-time user just joined the platform",
      color: "bg-emerald-500 text-white"
    },
    { 
      id: "volunteer", 
      name: "Volunteer", 
      description: "Active volunteer in church activities",
      color: "bg-orange-500 text-white"
    },
    { 
      id: "small_group_leader", 
      name: "Small Group Leader", 
      description: "Leads small groups and Bible studies",
      color: "bg-teal-500 text-white"
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Guided Tour Testing</CardTitle>
            <CardDescription>
              Test the role-based personalized tour system for platform administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Current User</h3>
                <div className="text-sm text-blue-800">
                  <p><strong>Email:</strong> {(user as any)?.email || 'Not available'}</p>
                  <p><strong>Name:</strong> {(user as any)?.firstName} {(user as any)?.lastName}</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Platform Administrator Roles */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Platform Administrator Tours</h3>
                  <p className="text-sm text-gray-600">
                    Experience contextual welcome tours designed for platform administrators.
                  </p>
                  
                  <div className="grid gap-3">
                    {platformRoles.map((role) => (
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

                {/* Church Member Roles */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Church Member Tours</h3>
                  <p className="text-sm text-gray-600">
                    Experience personalized welcome tours designed for different types of church members.
                  </p>
                  
                  <div className="grid gap-3">
                    {memberRoles.map((role) => (
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
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Tour System Features</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Role-specific welcome messages and guidance</li>
                  <li>• Interactive step-by-step platform navigation</li>
                  <li>• Contextual tips for administrative responsibilities</li>
                  <li>• Progress tracking and completion persistence</li>
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