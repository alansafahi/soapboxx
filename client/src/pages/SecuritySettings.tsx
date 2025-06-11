import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

export default function SecuritySettings() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account security and two-factor authentication
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-[#5A2671]" />
            <span>Two-Factor Authentication</span>
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by enabling two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication is managed by your church administrators. 
              Contact your church admin if you need 2FA enabled for your role.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6">
            <Button disabled className="bg-gray-300 text-gray-500 cursor-not-allowed">
              Enable Two-Factor Authentication
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              This feature is controlled by church administrators
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}