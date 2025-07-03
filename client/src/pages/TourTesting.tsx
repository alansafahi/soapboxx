import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import PersonalizedTour from "../components/PersonalizedTour";
import InteractiveTour from "../components/InteractiveTour";
import { Users, Church, Heart, Settings, UserCheck, ShieldCheck, Settings2, Headphones } from "lucide-react";

const roleOptions = [
  {
    id: "soapbox_owner",
    name: "SoapBox Owner",
    description: "Ultimate platform authority with governance over all policies and security",
    icon: ShieldCheck,
    color: "bg-purple-100 text-purple-800"
  },
  {
    id: "system_admin",
    name: "System Admin", 
    description: "Full platform access across all churches, users, logs and billing",
    icon: Settings2,
    color: "bg-red-100 text-red-800"
  },
  {
    id: "support_agent",
    name: "Support Agent",
    description: "Platform-wide support for user assistance and troubleshooting",
    icon: Headphones,
    color: "bg-green-100 text-green-800"
  },
  {
    id: "church_owner",
    name: "Church Owner",
    description: "Full church ownership with financial and strategic oversight",
    icon: Church,
    color: "bg-purple-100 text-purple-800"
  },
  {
    id: "church_admin",
    name: "Church Admin",
    description: "Administrative control and member management",
    icon: Settings,
    color: "bg-indigo-100 text-indigo-800"
  },
  {
    id: "pastor",
    name: "Lead Pastor",
    description: "Spiritual leadership and pastoral care",
    icon: Church,
    color: "bg-purple-100 text-purple-800"
  },
  {
    id: "social_manager",
    name: "Social Manager",
    description: "Community engagement and media management",
    icon: Users,
    color: "bg-pink-100 text-pink-800"
  },
  {
    id: "ministry_leader",
    name: "Ministry Leader",
    description: "Team coordination and ministry focus",
    icon: Settings,
    color: "bg-blue-100 text-blue-800"
  },
  {
    id: "member",
    name: "Church Member",
    description: "Community participation and spiritual growth",
    icon: Users,
    color: "bg-green-100 text-green-800"
  },
  {
    id: "volunteer",
    name: "Volunteer",
    description: "Service opportunities and community involvement",
    icon: Heart,
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    id: "youth_leader",
    name: "Youth Leader",
    description: "Youth ministry and next generation impact",
    icon: UserCheck,
    color: "bg-orange-100 text-orange-800"
  }
];

export default function TourTesting() {
  const [showTour, setShowTour] = useState(false);
  const [showInteractiveTour, setShowInteractiveTour] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const startTour = (role: string, type: "original" | "interactive" = "interactive") => {
    setSelectedRole(role);
    if (type === "interactive") {
      setShowInteractiveTour(true);
    } else {
      setShowTour(true);
    }
  };

  const completeTour = () => {
    setShowTour(false);
    setShowInteractiveTour(false);
    setSelectedRole("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interactive Tour Testing
          </h1>
          <p className="text-gray-600 mb-4">
            Experience guided walkthroughs that showcase real app features with role-specific content.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">🎯 New Interactive Tour Experience</h3>
            <p className="text-sm text-blue-800">
              Each tour navigates through actual app pages, highlights key features, and provides contextual tips. 
              Tours include auto-play mode and step-by-step navigation through real functionality.
            </p>
          </div>
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
                  <div className="space-y-2">
                    <Button
                      onClick={() => startTour(role.id, "interactive")}
                      className="w-full bg-[#5A2671] hover:bg-[#4A1F5A] text-white"
                      disabled={showTour || showInteractiveTour}
                    >
                      Start Interactive Tour
                    </Button>
                    <Button
                      onClick={() => startTour(role.id, "original")}
                      variant="outline"
                      className="w-full"
                      size="sm"
                      disabled={showTour || showInteractiveTour}
                    >
                      Original Tour (Legacy)
                    </Button>
                  </div>
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
      
      <InteractiveTour 
        isOpen={showInteractiveTour}
        onClose={completeTour}
        role={selectedRole}
      />
    </div>
  );
}