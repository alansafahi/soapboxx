import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  UserCog, 
  HandHeart, 
  DollarSign,
  Calendar,
  Church,
  Activity,
  Eye,
  Download,
  RefreshCw
} from "lucide-react";
import { AdminAnalyticsDashboard } from "../components/AdminAnalyticsDashboard";
import EngagementAnalyticsDashboard from "../components/EngagementAnalyticsDashboard";
import { AnalyticsTab } from "../components/AnalyticsTab";

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeframe, setTimeframe] = useState("30d");

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400">Please log in to access analytics.</p>
        </div>
      </div>
    );
  }

  // Check if user has analytics access
  const analyticsRoles = ['admin', 'church-admin', 'system-admin', 'super-admin', 'pastor', 'lead-pastor', 'soapbox_owner'];
  const hasAnalyticsAccess = analyticsRoles.includes(user.role || '');

  if (!hasAnalyticsAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Access Restricted</h2>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to view analytics data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive insights into your community's engagement, growth, and performance
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.3%</span> from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
              <HandHeart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">184</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8.1%</span> from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">+2</span> new this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Giving</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$24,567</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15.8%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center space-x-2">
              <UserCog className="h-4 w-4" />
              <span>Staff</span>
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="flex items-center space-x-2">
              <HandHeart className="h-4 w-4" />
              <span>Volunteers</span>
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Engagement</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Financial</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Community Overview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                High-level metrics and trends across all areas of your community
              </p>
            </div>
            <AdminAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Member Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Member activity, retention, growth trends, and engagement patterns
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Member Growth Trends</CardTitle>
                  <CardDescription>New members, retention rates, and activity levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">New Members This Month</span>
                      <Badge variant="secondary">47 members</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Retention Rate</span>
                      <Badge variant="secondary">94.2%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Members</span>
                      <Badge variant="secondary">2,543</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Member Engagement</CardTitle>
                  <CardDescription>Activity levels and participation rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Weekly Check-ins</span>
                      <Badge variant="secondary">1,287</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Prayer Requests</span>
                      <Badge variant="secondary">156</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Event Attendance</span>
                      <Badge variant="secondary">78.5%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Staff Performance Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Staff productivity, ministry effectiveness, and leadership metrics
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Staff Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Lead Pastors</span>
                      <span className="font-medium">4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Associate Pastors</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Ministry Leaders</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Administrative</span>
                      <span className="font-medium">8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Ministry Effectiveness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Average Sermon Rating</span>
                      <Badge variant="secondary">4.7/5</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Counseling Sessions</span>
                      <span className="font-medium">47 this month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Follow-up Completion</span>
                      <Badge variant="secondary">89%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Staff Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Training Hours</span>
                      <span className="font-medium">234 hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Certifications</span>
                      <span className="font-medium">12 completed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Performance Reviews</span>
                      <Badge variant="secondary">Up to date</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="volunteers" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Volunteer Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Volunteer engagement, divine appointments success, and retention metrics
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Volunteer Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Volunteers</span>
                      <Badge variant="secondary">184</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Divine Appointments Success</span>
                      <Badge variant="secondary">87.3%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Average Hours/Month</span>
                      <Badge variant="secondary">12.4 hrs</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Retention Rate</span>
                      <Badge variant="secondary">91.7%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Ministry Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Children's Ministry</span>
                      <span className="font-medium">45 volunteers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Worship Team</span>
                      <span className="font-medium">28 volunteers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Hospitality</span>
                      <span className="font-medium">36 volunteers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Outreach</span>
                      <span className="font-medium">31 volunteers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Technical</span>
                      <span className="font-medium">18 volunteers</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Engagement Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sermon performance, social engagement, and content interaction metrics
              </p>
            </div>
            <EngagementAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Donation trends, giving patterns, and financial goal tracking
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Giving</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-2xl font-bold">$24,567</div>
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +15.8% from last month
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Goal: $25,000 (98.3%)
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Donor Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Donors</span>
                      <span className="font-medium">847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Recurring Donors</span>
                      <span className="font-medium">623 (73.6%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">New Donors</span>
                      <span className="font-medium">38 this month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average Gift</span>
                      <span className="font-medium">$89</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Annual Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-xl font-bold">$187,234</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Annual Goal: $300,000
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '62.4%' }}></div>
                    </div>
                    <div className="text-sm text-blue-600">62.4% complete</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}