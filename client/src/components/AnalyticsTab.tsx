import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { TrendingUp, Eye, Heart, Share2, MessageSquare, BarChart3 } from "lucide-react";

export function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h2>
      
      {/* Growth Metrics Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Growth Metrics</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Member Growth</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-gradient-to-r from-green-500 to-green-300 rounded-full"></div>
              <span className="text-green-600 font-medium">+12%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Event Attendance</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"></div>
              <span className="text-blue-600 font-medium">+5%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Prayer Engagement</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-gradient-to-r from-purple-500 to-purple-300 rounded-full"></div>
              <span className="text-purple-600 font-medium">+8%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Social Media & Content Engagement Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Social Media & Content Engagement</h3>
          <Button
            onClick={() => window.location.href = '/engagement-analytics'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            View Full Analytics
          </Button>
        </div>
      
        {/* Engagement Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reach</p>
                  <p className="text-2xl font-bold">847.2K</p>
                  <p className="text-xs text-green-600">+15% this week</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Eye className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement</p>
                  <p className="text-2xl font-bold">23.4%</p>
                  <p className="text-xs text-green-600">+8% this week</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Heart className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Shares</p>
                  <p className="text-2xl font-bold">1,234</p>
                  <p className="text-xs text-green-600">+22% this week</p>
                </div>
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Share2 className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Comments</p>
                  <p className="text-2xl font-bold">892</p>
                  <p className="text-xs text-green-600">+12% this week</p>
                </div>
                <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Platform Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-semibold text-blue-600">Facebook</div>
                <div className="text-2xl font-bold">9.2%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Engagement</div>
                <div className="text-xs text-green-600">+15% growth</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-semibold text-pink-600">Instagram</div>
                <div className="text-2xl font-bold">7.8%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Engagement</div>
                <div className="text-xs text-green-600">+22% growth</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-semibold text-blue-400">Twitter</div>
                <div className="text-2xl font-bold">5.4%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Engagement</div>
                <div className="text-xs text-red-600">-3% decline</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-semibold text-blue-700">LinkedIn</div>
                <div className="text-2xl font-bold">6.1%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Engagement</div>
                <div className="text-xs text-green-600">+8% growth</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}