import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar, 
  Target,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Gift,
  Church,
  Heart,
  Star,
  Award,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Sample analytics data - in production this would come from your API
const SAMPLE_ANALYTICS = {
  overview: {
    totalGiving: 234567.89,
    totalDonors: 1847,
    averageGift: 127.15,
    recurringDonors: 423,
    monthlyGrowth: 12.5,
    newDonorsThisMonth: 67
  },
  monthlyTrends: [
    { month: "Jan", total: 18500, donors: 145, average: 127.59 },
    { month: "Feb", total: 21200, donors: 168, average: 126.19 },
    { month: "Mar", total: 19800, donors: 152, average: 130.26 },
    { month: "Apr", total: 23400, donors: 189, average: 123.81 },
    { month: "May", total: 26700, donors: 201, average: 132.84 },
    { month: "Jun", total: 28900, donors: 218, average: 132.57 }
  ],
  givingByCategory: [
    { name: "General Fund", value: 45, amount: 105555, color: "#3B82F6" },
    { name: "Missions", value: 22, amount: 51605, color: "#10B981" },
    { name: "Building Fund", value: 18, amount: 42222, color: "#F59E0B" },
    { name: "Youth Ministry", value: 10, amount: 23456, color: "#EF4444" },
    { name: "Community Outreach", value: 5, amount: 11729, color: "#8B5CF6" }
  ],
  topDonors: [
    { name: "The Johnson Family", amount: 15600, frequency: "Monthly", lastGift: "2024-06-13" },
    { name: "Sarah Mitchell", amount: 12400, frequency: "Weekly", lastGift: "2024-06-12" },
    { name: "Anonymous Donor", amount: 11200, frequency: "Quarterly", lastGift: "2024-06-10" },
    { name: "David & Mary Chen", amount: 9800, frequency: "Monthly", lastGift: "2024-06-11" },
    { name: "Robert Williams", amount: 8900, frequency: "Bi-weekly", lastGift: "2024-06-13" }
  ],
  recurringGiving: {
    totalRecurring: 89456,
    recurringPercentage: 38.1,
    averageRecurringGift: 211.47,
    retentionRate: 94.2
  },
  demographics: [
    { ageGroup: "18-25", donors: 89, percentage: 12.3, avgGift: 67.50 },
    { ageGroup: "26-35", donors: 156, percentage: 21.6, avgGift: 98.75 },
    { ageGroup: "36-45", donors: 234, percentage: 32.4, avgGift: 145.20 },
    { ageGroup: "46-55", donors: 178, percentage: 24.6, avgGift: 167.80 },
    { ageGroup: "56+", donors: 67, percentage: 9.3, avgGift: 234.60 }
  ]
};

export default function DonationAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [selectedMetric, setSelectedMetric] = useState("total");

  // In production, this would fetch real analytics data
  const { data: analytics = SAMPLE_ANALYTICS } = useQuery({
    queryKey: ['/api/analytics/donations', selectedPeriod],
    enabled: false // Disabled for demo - would enable in production
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Donation Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into your church's giving patterns</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Giving</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.overview.totalGiving)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">{formatPercentage(analytics.overview.monthlyGrowth)}</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalDonors.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="text-blue-600">+{analytics.overview.newDonorsThisMonth}</span>
              <span className="ml-1">new this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Gift</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.overview.averageGift)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">+5.2%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recurring Donors</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.recurringDonors}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="text-purple-600">{analytics.recurringGiving.retentionRate}%</span>
              <span className="ml-1">retention rate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Giving Trends</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="donors">Top Donors</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Gifts</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Giving Trends</CardTitle>
              <CardDescription>
                Track giving patterns and growth over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'total' ? formatCurrency(value as number) : value,
                        name === 'total' ? 'Total Giving' : name === 'donors' ? 'Number of Donors' : 'Average Gift'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Donor Count Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="donors" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ fill: '#10B981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Gift Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Average Gift']} />
                      <Bar dataKey="average" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Giving by Category</CardTitle>
                <CardDescription>
                  Distribution of donations across different funds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Tooltip formatter={(value, name) => [formatCurrency(value as number), name]} />
                      <Pie 
                        data={analytics.givingByCategory} 
                        dataKey="amount" 
                        nameKey="name"
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                      >
                        {analytics.givingByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>
                  Detailed breakdown with amounts and percentages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.givingByCategory.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(category.amount)}</div>
                        <div className="text-sm text-gray-500">{category.value}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="donors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Donors</CardTitle>
              <CardDescription>
                Your most generous supporters this period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topDonors.map((donor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Award className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold">{donor.name}</div>
                        <div className="text-sm text-gray-500">
                          {donor.frequency} • Last gift: {new Date(donor.lastGift).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{formatCurrency(donor.amount)}</div>
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Recurring Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.recurringGiving.totalRecurring)}</div>
                <div className="text-sm text-gray-500">
                  {analytics.recurringGiving.recurringPercentage}% of total giving
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg Recurring Gift</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.recurringGiving.averageRecurringGift)}</div>
                <div className="text-sm text-gray-500">
                  67% higher than one-time gifts
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.recurringGiving.retentionRate}%</div>
                <div className="text-sm text-gray-500">
                  Donors continuing monthly giving
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recurring vs One-time Giving</CardTitle>
              <CardDescription>
                Comparison of giving patterns and reliability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Recurring Giving</span>
                    <span className="text-sm text-gray-500">{analytics.recurringGiving.recurringPercentage}%</span>
                  </div>
                  <Progress value={analytics.recurringGiving.recurringPercentage} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">One-time Giving</span>
                    <span className="text-sm text-gray-500">{(100 - analytics.recurringGiving.recurringPercentage).toFixed(1)}%</span>
                  </div>
                  <Progress value={100 - analytics.recurringGiving.recurringPercentage} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Donor Demographics</CardTitle>
              <CardDescription>
                Age distribution and giving patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.demographics.map((demo, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{demo.ageGroup}</span>
                      <div className="text-right">
                        <span className="font-semibold">{demo.donors} donors</span>
                        <span className="text-sm text-gray-500 ml-2">({demo.percentage}%)</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <Progress value={demo.percentage} className="flex-1 mr-4" />
                      <span>Avg: {formatCurrency(demo.avgGift)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}