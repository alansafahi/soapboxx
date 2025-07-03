import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
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
  ArrowDownRight,
  FileText
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
  // Goal tracking and progress
  goals: {
    annual: {
      target: 500000,
      current: 234567.89,
      percentage: 46.9,
      daysRemaining: 198,
      projectedTotal: 487500,
      onTrack: true
    },
    monthly: {
      target: 42000,
      current: 38450,
      percentage: 91.5,
      daysRemaining: 8,
      projectedTotal: 41200,
      onTrack: true
    },
    building: {
      target: 150000,
      current: 67800,
      percentage: 45.2,
      daysRemaining: 365,
      projectedTotal: 140000,
      onTrack: false
    }
  },
  // Seasonal giving insights
  seasonalInsights: {
    currentSeason: "Summer",
    seasonalTrend: "8% below average",
    peakMonths: ["December", "April", "November"],
    averageSeasonalIncrease: {
      christmas: 145,
      easter: 78,
      thanksgiving: 62,
      backToSchool: -12
    },
    yearOverYear: [
      { season: "Spring 2023", amount: 85600 },
      { season: "Summer 2023", amount: 67200 },
      { season: "Fall 2023", amount: 92400 },
      { season: "Winter 2023", amount: 134800 },
      { season: "Spring 2024", amount: 89300 },
      { season: "Summer 2024", amount: 71800 }
    ]
  },
  // Donor retention analytics
  donorRetention: {
    newDonors: {
      thisMonth: 67,
      lastMonth: 54,
      threeMonthRetention: 78.5,
      sixMonthRetention: 65.2,
      oneYearRetention: 52.8
    },
    lapsedDonors: {
      total: 234,
      reactivated: 45,
      reactivationRate: 19.2,
      averageDaysLapsed: 127
    },
    loyalDonors: {
      giving12Plus: 342,
      giving24Plus: 189,
      giving36Plus: 98,
      averageTenure: 28.5
    }
  },
  // Giving frequency patterns
  givingFrequency: {
    weekly: { count: 156, percentage: 18.5, avgAmount: 89.50 },
    biweekly: { count: 89, percentage: 10.6, avgAmount: 156.75 },
    monthly: { count: 423, percentage: 50.2, avgAmount: 245.30 },
    quarterly: { count: 134, percentage: 15.9, avgAmount: 678.90 },
    annually: { count: 41, percentage: 4.9, avgAmount: 1250.00 }
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

  // Fetch real-time donation analytics data
  const { data: analytics = SAMPLE_ANALYTICS, isLoading } = useQuery({
    queryKey: ['/api/analytics/donations', selectedPeriod],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
    staleTime: 5000 // Consider data stale after 5 seconds
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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="frequency">Frequency</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
          <TabsTrigger value="donors">Top Donors</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
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

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Annual Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Annual Goal
                  {analytics.goals.annual.onTrack ? 
                    <TrendingUp className="h-5 w-5 text-green-600" /> : 
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  }
                </CardTitle>
                <CardDescription>{formatCurrency(analytics.goals.annual.target)} target</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{analytics.goals.annual.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${analytics.goals.annual.onTrack ? 'bg-green-600' : 'bg-yellow-500'}`}
                      style={{ width: `${Math.min(analytics.goals.annual.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Current:</span>
                      <div className="font-medium">{formatCurrency(analytics.goals.annual.current)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Projected:</span>
                      <div className="font-medium">{formatCurrency(analytics.goals.annual.projectedTotal)}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {analytics.goals.annual.daysRemaining} days remaining
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Monthly Goal
                  {analytics.goals.monthly.onTrack ? 
                    <TrendingUp className="h-5 w-5 text-green-600" /> : 
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  }
                </CardTitle>
                <CardDescription>{formatCurrency(analytics.goals.monthly.target)} target</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{analytics.goals.monthly.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${analytics.goals.monthly.onTrack ? 'bg-green-600' : 'bg-yellow-500'}`}
                      style={{ width: `${Math.min(analytics.goals.monthly.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Current:</span>
                      <div className="font-medium">{formatCurrency(analytics.goals.monthly.current)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Projected:</span>
                      <div className="font-medium">{formatCurrency(analytics.goals.monthly.projectedTotal)}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {analytics.goals.monthly.daysRemaining} days remaining
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Building Fund Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Building Fund
                  {analytics.goals.building.onTrack ? 
                    <TrendingUp className="h-5 w-5 text-green-600" /> : 
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  }
                </CardTitle>
                <CardDescription>{formatCurrency(analytics.goals.building.target)} target</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{analytics.goals.building.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${analytics.goals.building.onTrack ? 'bg-green-600' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(analytics.goals.building.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Current:</span>
                      <div className="font-medium">{formatCurrency(analytics.goals.building.current)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Projected:</span>
                      <div className="font-medium">{formatCurrency(analytics.goals.building.projectedTotal)}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {analytics.goals.building.daysRemaining} days remaining
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* New Donor Retention */}
            <Card>
              <CardHeader>
                <CardTitle>New Donor Retention</CardTitle>
                <CardDescription>Retention rates for new donors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Donors This Month</span>
                    <span className="font-medium text-green-600">+{analytics.donorRetention.newDonors.thisMonth}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">3-Month Retention</span>
                      <span className="font-medium">{analytics.donorRetention.newDonors.threeMonthRetention}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${analytics.donorRetention.newDonors.threeMonthRetention}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">6-Month Retention</span>
                      <span className="font-medium">{analytics.donorRetention.newDonors.sixMonthRetention}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${analytics.donorRetention.newDonors.sixMonthRetention}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">1-Year Retention</span>
                      <span className="font-medium">{analytics.donorRetention.newDonors.oneYearRetention}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${analytics.donorRetention.newDonors.oneYearRetention}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donor Loyalty */}
            <Card>
              <CardHeader>
                <CardTitle>Donor Loyalty</CardTitle>
                <CardDescription>Long-term giving patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{analytics.donorRetention.loyalDonors.giving12Plus}</div>
                      <div className="text-sm text-gray-600">12+ Months</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{analytics.donorRetention.loyalDonors.giving24Plus}</div>
                      <div className="text-sm text-gray-600">24+ Months</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{analytics.donorRetention.loyalDonors.giving36Plus}</div>
                      <div className="text-sm text-gray-600">36+ Months</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{analytics.donorRetention.loyalDonors.averageTenure}</div>
                      <div className="text-sm text-gray-600">Avg. Tenure (months)</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Lapsed Donors Reactivated</span>
                      <span className="font-medium text-green-600">{analytics.donorRetention.lapsedDonors.reactivated}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {analytics.donorRetention.lapsedDonors.reactivationRate}% reactivation rate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="frequency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Giving Frequency Patterns</CardTitle>
              <CardDescription>How often donors give and their average amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(analytics.givingFrequency).map(([frequency, data]) => (
                  <div key={frequency} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{frequency} Givers</span>
                      <span className="text-sm text-gray-600">{data.count} donors ({data.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full bg-blue-600"
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Average Gift: {formatCurrency(data.avgAmount)}</span>
                      <span>Total: {formatCurrency(data.count * data.avgAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Season Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Current Season: {analytics.seasonalInsights.currentSeason}</CardTitle>
                <CardDescription>Seasonal giving trends and patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm font-medium text-yellow-800">Trend Alert</div>
                    <div className="text-sm text-yellow-700">{analytics.seasonalInsights.seasonalTrend}</div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Peak Giving Months:</div>
                    <div className="flex flex-wrap gap-2">
                      {analytics.seasonalInsights.peakMonths.map(month => (
                        <span key={month} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {month}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Holiday Impact:</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Christmas:</span>
                        <span className="font-medium text-green-600">+{analytics.seasonalInsights.averageSeasonalIncrease.christmas}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Easter:</span>
                        <span className="font-medium text-green-600">+{analytics.seasonalInsights.averageSeasonalIncrease.easter}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thanksgiving:</span>
                        <span className="font-medium text-green-600">+{analytics.seasonalInsights.averageSeasonalIncrease.thanksgiving}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Back to School:</span>
                        <span className="font-medium text-red-600">{analytics.seasonalInsights.averageSeasonalIncrease.backToSchool}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Year-over-Year Seasonal Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Comparison</CardTitle>
                <CardDescription>Year-over-year seasonal giving trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.seasonalInsights.yearOverYear}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="season" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="amount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Automated Report Generation */}
            <Card>
              <CardHeader>
                <CardTitle>Automated Reports for Leadership</CardTitle>
                <CardDescription>Generate comprehensive giving reports automatically</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Monthly Report
                    </Button>
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Quarterly Report
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Annual Summary
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Donor Analysis
                    </Button>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Auto-Email Reports</span>
                      <Button variant="ghost" size="sm">Configure</Button>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• Weekly summary to Pastor</div>
                      <div>• Monthly board report</div>
                      <div>• Quarterly financial review</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report Schedule & History */}
            <Card>
              <CardHeader>
                <CardTitle>Report History</CardTitle>
                <CardDescription>Recent automated reports sent to leadership</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <div className="font-medium text-green-800">Monthly Report - June 2024</div>
                      <div className="text-sm text-green-600">Sent 3 days ago</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <div className="font-medium text-blue-800">Weekly Summary</div>
                      <div className="text-sm text-blue-600">Sent yesterday</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">Quarterly Review Q2</div>
                      <div className="text-sm text-gray-600">Sent 2 weeks ago</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Next automated report: <span className="font-medium">Weekly Summary</span> in 6 days
                  </div>
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