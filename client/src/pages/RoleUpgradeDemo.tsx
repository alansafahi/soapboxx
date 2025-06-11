import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Crown, Users, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import TwoFactorOnboarding from "@/components/TwoFactorOnboarding";
import { useToast } from "@/hooks/use-toast";

export default function RoleUpgradeDemo() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [show2FAOnboarding, setShow2FAOnboarding] = useState(false);
  const [upgradeComplete, setUpgradeComplete] = useState(false);

  const privilegedRoles = [
    { value: "admin", label: "Administrator", description: "Full church management access" },
    { value: "lead_pastor", label: "Lead Pastor", description: "Senior pastoral leadership" },
    { value: "pastor", label: "Pastor", description: "Pastoral care and oversight" },
    { value: "minister", label: "Minister", description: "Ministry leadership" },
  ];

  const simulateRoleUpgrade = () => {
    if (!selectedRole) {
      toast({
        title: "Select a Role",
        description: "Please choose a role to upgrade to",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep(2);
    // Simulate checking 2FA requirements
    setTimeout(() => {
      setCurrentStep(3);
      setShow2FAOnboarding(true);
    }, 1500);
  };

  const handle2FAComplete = () => {
    setShow2FAOnboarding(false);
    setCurrentStep(4);
    setUpgradeComplete(true);
    toast({
      title: "Role Upgrade Complete",
      description: `You are now a ${privilegedRoles.find(r => r.value === selectedRole)?.label}`,
    });
  };

  const resetDemo = () => {
    setCurrentStep(1);
    setSelectedRole("");
    setShow2FAOnboarding(false);
    setUpgradeComplete(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-8 w-8 text-[#5A2671]" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              2FA Role Upgrade Demo
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Experience the complete security flow when members are upgraded to privileged roles 
            requiring two-factor authentication in the SoapBox Super App.
          </p>
        </div>

        {/* Progress Indicator */}
        <Card className="border-[#5A2671]/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowRight className="h-5 w-5 text-[#5A2671]" />
              <span>Upgrade Process</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {[
                { step: 1, label: "Role Selection", active: currentStep >= 1 },
                { step: 2, label: "Security Check", active: currentStep >= 2 },
                { step: 3, label: "2FA Setup", active: currentStep >= 3 },
                { step: 4, label: "Complete", active: currentStep >= 4 },
              ].map((item, index) => (
                <div key={item.step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    item.active 
                      ? "bg-[#5A2671] text-white" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  }`}>
                    {item.active && currentStep > item.step ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      item.step
                    )}
                  </div>
                  <span className={`ml-2 text-sm ${
                    item.active ? "text-gray-900 dark:text-white" : "text-gray-500"
                  }`}>
                    {item.label}
                  </span>
                  {index < 3 && (
                    <div className={`w-16 h-1 mx-4 ${
                      currentStep > item.step ? "bg-[#5A2671]" : "bg-gray-200 dark:bg-gray-700"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Role Selection */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-[#5A2671]" />
                <span>Step 1: Select Role for Upgrade</span>
              </CardTitle>
              <CardDescription>
                Choose a privileged role that requires enhanced security measures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <strong>Security Notice:</strong> The following roles require two-factor authentication 
                  for enhanced protection of church data and member privacy.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Role to Upgrade To:
                </label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a privileged role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {privilegedRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{role.label}</span>
                          <span className="text-xs text-gray-500">{role.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedRole && (
                  <div className="p-4 bg-[#5A2671]/5 border border-[#5A2671]/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-4 w-4 text-[#5A2671]" />
                      <span className="font-medium">Security Requirements</span>
                    </div>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Two-factor authentication required</li>
                      <li>• Access to sensitive member data</li>
                      <li>• Financial and donation oversight</li>
                      <li>• Administrative privileges</li>
                    </ul>
                  </div>
                )}
              </div>

              <Button
                onClick={simulateRoleUpgrade}
                disabled={!selectedRole}
                className="w-full bg-[#5A2671] hover:bg-[#4A1F61] text-white"
              >
                Begin Role Upgrade Process
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Security Check */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-[#5A2671]" />
                <span>Step 2: Security Verification</span>
              </CardTitle>
              <CardDescription>
                Checking current security status and 2FA requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A2671] mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Verifying security requirements for {privilegedRoles.find(r => r.value === selectedRole)?.label} role...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: 2FA Setup */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-[#5A2671]" />
                <span>Step 3: Two-Factor Authentication Required</span>
              </CardTitle>
              <CardDescription>
                Enhanced security setup is required for your new role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <strong>Security Setup Required:</strong> Two-factor authentication must be enabled 
                  before accessing {privilegedRoles.find(r => r.value === selectedRole)?.label} features.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Complete */}
        {currentStep === 4 && upgradeComplete && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                <CheckCircle className="h-5 w-5" />
                <span>Role Upgrade Complete!</span>
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                You now have {privilegedRoles.find(r => r.value === selectedRole)?.label} access with 2FA protection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="border-green-500 text-green-700">
                  2FA Enabled
                </Badge>
                <Badge variant="outline" className="border-[#5A2671] text-[#5A2671]">
                  {privilegedRoles.find(r => r.value === selectedRole)?.label}
                </Badge>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                  New Capabilities Unlocked:
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Access to administrative dashboard</li>
                  <li>• Member management capabilities</li>
                  <li>• Financial and donation oversight</li>
                  <li>• Event and content management</li>
                  <li>• Security-protected data access</li>
                </ul>
              </div>

              <Button
                onClick={resetDemo}
                variant="outline"
                className="w-full"
              >
                Try Another Role Upgrade
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-[#5A2671]" />
                <span>Security Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#5A2671] rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">TOTP Authentication</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Support for Google Authenticator, Authy, and other TOTP apps
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#5A2671] rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Email Verification</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Alternative authentication via secure email codes
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#5A2671] rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Backup Codes</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Recovery codes for emergency access
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-[#5A2671]" />
                <span>Protected Roles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {privilegedRoles.map((role) => (
                <div key={role.value} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{role.label}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
                  </div>
                  <Badge variant="outline" className="border-[#5A2671] text-[#5A2671]">
                    2FA Required
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2FA Onboarding Modal */}
      <TwoFactorOnboarding
        isOpen={show2FAOnboarding}
        onComplete={handle2FAComplete}
        userRole={selectedRole}
        churchName="Christ the King Lutheran Church"
      />
    </div>
  );
}