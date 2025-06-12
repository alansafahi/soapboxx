import { AdminAnalyticsDashboard } from "@/components/AdminAnalyticsDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";

export default function AdminAnalytics() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: userRole, isLoading: roleLoading } = useQuery({
    queryKey: ['/api/user/role'],
    enabled: !!user
  });

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A2671]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if user has admin/pastor permissions
  const hasAdminAccess = userRole === 'admin' || userRole === 'pastor' || userRole === 'super_admin';

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <Card className="border-amber-200 dark:border-amber-700">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                Access Restricted
              </CardTitle>
              <CardDescription>
                This area is reserved for church administrators and pastoral staff
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
                  <span className="font-medium text-amber-800 dark:text-amber-200">
                    Administrator Privileges Required
                  </span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  To access member engagement analytics and pastoral care tools, you need admin or pastoral permissions.
                </p>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                If you believe you should have access to this area, please contact your church administrator for assistance with role permissions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminAnalyticsDashboard />
    </div>
  );
}