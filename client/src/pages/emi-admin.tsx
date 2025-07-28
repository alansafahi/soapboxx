import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EnhancedMoodIndicatorManager from "@/components/emi/EnhancedMoodIndicatorManager";
import { Settings, BarChart3, Users, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function EMIAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Enhanced Mood Indicators Administration
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Centralized management for mood indicators used across Reading Plans, Social Feed, and Daily Checkins
              </p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              Admin Portal
            </Badge>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">System Status</p>
                  <p className="text-2xl font-bold text-green-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Indicators</p>
                  <p className="text-2xl font-bold">26+</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Integration Points</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                  <p className="text-2xl font-bold">6</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Points */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Integration Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">📖 Bible Reading Plans</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Emotional reactions to daily scripture readings with EMI integration
                </p>
                <Link href="/reading-plans">
                  <Button variant="outline" size="sm" className="w-full">
                    View Reading Plans
                  </Button>
                </Link>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">💬 Social Feed Posts</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Mood indicators for discussions, SOAP entries, and prayer requests
                </p>
                <Link href="/social-feed">
                  <Button variant="outline" size="sm" className="w-full">
                    View Social Feed
                  </Button>
                </Link>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">✅ Daily Checkins</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Comprehensive mood tracking with multiple EMI selections
                </p>
                <Link href="/checkin-system">
                  <Button variant="outline" size="sm" className="w-full">
                    View Check-ins
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main EMI Manager */}
        <Card>
          <CardContent className="p-6">
            <EnhancedMoodIndicatorManager showAdminControls={true} />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Enhanced Mood Indicators System - Centralized management for consistent user experience</p>
        </div>
      </div>
    </div>
  );
}