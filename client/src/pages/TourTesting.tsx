import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PersonalizedTour from "@/components/PersonalizedTour";
import { Users, Church, Heart, Settings, UserCheck } from "lucide-react";

const roleOptions = [
  {
    id: "member",
    name: "Church Member",
    description: "Regular church member exploring community features",
    icon: Users,
    color: "bg-green-100 text-green-800"
  },
  {
    id: "pastor",
    name: "Pastor",
    description: "Church leader with full administrative access",
    icon: Church,
    color: "bg-purple-100 text-purple-800"
  },
  {
    id: "ministry_leader",
    name: "Ministry Leader",
    description: "Leader of a specific ministry or department",
    icon: Settings,
    color: "bg-blue-100 text-blue-800"
  },
  {
    id: "volunteer",
    name: "Volunteer",
    description: "Active volunteer serving in church ministries",
    icon: Heart,
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    id: "youth_leader",
    name: "Youth Leader",
    description: "Leader focused on youth ministry and programs",
    icon: UserCheck,
    color: "bg-orange-100 text-orange-800"
  }
];

export default function TourTesting() {
  const [showTour, setShowTour] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const startTour = (role: string) => {
    setSelectedRole(role);
    setShowTour(true);
  };

  const completeTour = () => {
    setShowTour(false);
    setSelectedRole("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Personalized Tour Testing
          </h1>
          <p className="text-gray-600">
            Test the personalized welcome tour experience for different user roles.
            Each role receives tailored content and feature highlights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roleOptions.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card key={role.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-gradient-to-r from-[#5A2671] to-[#7B3F8C] rounded-2xl">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{role.name}</CardTitle>
                  <Badge className={role.color}>
                    {role.id.replace('_', ' ').toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4 text-sm">
                    {role.description}
                  </p>
                  <Button
                    onClick={() => startTour(role.id)}
                    className="w-full bg-[#5A2671] hover:bg-[#4A1F5A] text-white"
                    disabled={showTour}
                  >
                    Start {role.name} Tour
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {showTour && (
          <div className="mt-8">
            <Card className="border-[#5A2671] border-2">
              <CardHeader className="bg-gradient-to-r from-[#5A2671] to-[#7B3F8C] text-white">
                <CardTitle>Tour Active</CardTitle>
                <p className="text-purple-100">
                  Currently showing tour for: <strong>{roleOptions.find(r => r.id === selectedRole)?.name}</strong>
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  The personalized tour modal is now active. You can interact with the tour navigation,
                  view role-specific content, and test the completion flow.
                </p>
                <Button
                  onClick={completeTour}
                  variant="outline"
                  className="border-[#5A2671] text-[#5A2671] hover:bg-[#5A2671] hover:text-white"
                >
                  Close Tour Manually
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <PersonalizedTour
        isOpen={showTour}
        onComplete={completeTour}
        userRole={selectedRole}
      />
    </div>
  );
}