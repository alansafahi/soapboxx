import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, MessageSquare, Heart, Share2,
  Calendar, Target, BarChart3, PieChart as PieChartIcon, 
  Activity, ArrowUpRight, ArrowDownRight, Star, Clock,
  ThumbsUp, Eye, Download, Bell, Filter
} from "lucide-react";

interface SermonMetrics {
  id: string;
  title: string;
  date: string;
  attendance: number;
  engagement: number;
  shares: number;
  prayers: number;
  feedback: number;
  downloadViews: number;
  avgRating: number;
  completionRate: number;
}

interface FeedbackData {
  category: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  count: number;
  feedback: string;
  timestamp: string;
}

export default function EngagementAnalyticsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [selectedSermon, setSelectedSermon] = useState("all");

  // Sample sermon performance data
  const sermonMetrics: SermonMetrics[] = [
    {
      id: "1",
      title: "The Greatest Love Story Ever Told",
      date: "2024-06-09",
      attendance: 284,
      engagement: 92,
      shares: 47,
      prayers: 23,
      feedback: 18,
      downloadViews: 156,
      avgRating: 4.8,
      completionRate: 89
    },
    {
      id: "2", 
      title: "Walking by Faith, Not by Sight",
      date: "2024-06-02",
      attendance: 267,
      engagement: 88,
      shares: 52,
      prayers: 31,
      feedback: 22,
      downloadViews: 134,
      avgRating: 4.6,
      completionRate: 85
    },
    {
      id: "3",
      title: "Finding Peace in the Storm",
      date: "2024-05-26",
      attendance: 298,
      engagement: 95,
      shares: 63,
      prayers: 45,
      feedback: 28,
      downloadViews: 187,
      avgRating: 4.9,
      completionRate: 93
    },
    {
      id: "4",
      title: "The Power of Forgiveness",
      date: "2024-05-19",
      attendance: 251,
      engagement: 81,
      shares: 38,
      prayers: 19,
      feedback: 15,
      downloadViews: 98,
      avgRating: 4.4,
      completionRate: 78
    }
  ];

  // Engagement trend data
  const engagementTrend = [
    { week: 'Week 1', attendance: 251, engagement: 81, shares: 38, prayers: 19 },
    { week: 'Week 2', attendance: 298, engagement: 95, shares: 63, prayers: 45 },
    { week: 'Week 3', attendance: 267, engagement: 88, shares: 52, prayers: 31 },
    { week: 'Week 4', attendance: 284, engagement: 92, shares: 47, prayers: 23 }
  ];

  // Feedback categories
  const feedbackCategories = [
    { name: 'Message Content', value: 45, color: '#8884d8' },
    { name: 'Delivery Style', value: 25, color: '#82ca9d' },
    { name: 'Biblical Application', value: 20, color: '#ffc658' },
    { name: 'Length/Timing', value: 10, color: '#ff7c7c' }
  ];

  // Sample feedback data
  const recentFeedback: FeedbackData[] = [
    {
      category: "Message Content",
      sentiment: "positive",
      count: 12,
      feedback: "The explanation of John 3:16 was profound and easy to understand. Really helped me see God's love in a new way.",
      timestamp: "2024-06-09T14:30:00Z"
    },
    {
      category: "Delivery Style",
      sentiment: "positive", 
      count: 8,
      feedback: "Pastor's storytelling made the message come alive. The illustrations were perfect.",
      timestamp: "2024-06-09T15:45:00Z"
    },
    {
      category: "Biblical Application",
      sentiment: "neutral",
      count: 3,
      feedback: "Would love more practical examples of how to apply this in daily life.",
      timestamp: "2024-06-09T16:20:00Z"
    },
    {
      category: "Length/Timing",
      sentiment: "negative",
      count: 2,
      feedback: "Felt a bit long today, especially the introduction section.",
      timestamp: "2024-06-09T17:10:00Z"
    }
  ];

  // Key performance indicators
  const kpis = [
    {
      title: "Average Attendance",
      value: 275,
      change: +8.2,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Engagement Rate",
      value: 89,
      change: +4.1,
      icon: Activity,
      color: "text-green-600"
    },
    {
      title: "Content Shares",
      value: 50,
      change: +12.5,
      icon: Share2,
      color: "text-purple-600"
    },
    {
      title: "Prayer Requests",
      value: 30,
      change: -5.2,
      icon: Heart,
      color: "text-red-600"
    }
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="w-4 h-4" />;
      case 'negative': return <ArrowDownRight className="w-4 h-4" />;
      default: return <ArrowUpRight className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Engagement Analytics</h1>
          <p className="text-gray-600 mt-2">Track sermon effectiveness and congregation response</p>
        </div>
        <div className="flex space-x-4">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
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
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <div className="flex items-center mt-2">
                    {kpi.change > 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm ml-1 ${kpi.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(kpi.change)}%
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sermons">Sermon Performance</TabsTrigger>
          <TabsTrigger value="feedback">Feedback Analysis</TabsTrigger>
          <TabsTrigger value="trends">Engagement Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Engagement Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="attendance" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="engagement" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Feedback Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="w-5 h-5 mr-2" />
                  Feedback Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={feedbackCategories}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {feedbackCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">New sermon feedback received</span>
                  </div>
                  <span className="text-xs text-gray-500">2 minutes ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">12 new prayer requests submitted</span>
                  </div>
                  <span className="text-xs text-gray-500">15 minutes ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Content shared 47 times on social media</span>
                  </div>
                  <span className="text-xs text-gray-500">1 hour ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sermon Performance Tab */}
        <TabsContent value="sermons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Individual Sermon Performance</CardTitle>
              <div className="flex space-x-4">
                <Select value={selectedSermon} onValueChange={setSelectedSermon}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select sermon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sermons</SelectItem>
                    {sermonMetrics.map((sermon) => (
                      <SelectItem key={sermon.id} value={sermon.id}>
                        {sermon.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Sermon Title</th>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Attendance</th>
                      <th className="text-left p-3">Engagement</th>
                      <th className="text-left p-3">Shares</th>
                      <th className="text-left p-3">Rating</th>
                      <th className="text-left p-3">Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sermonMetrics.map((sermon) => (
                      <tr key={sermon.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{sermon.title}</p>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-gray-600">{sermon.date}</td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1 text-gray-400" />
                            {sermon.attendance}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary">{sermon.engagement}%</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <Share2 className="w-4 h-4 mr-1 text-gray-400" />
                            {sermon.shares}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                            {sermon.avgRating}
                          </div>
                        </td>
                        <td className="p-3">{sermon.completionRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Analysis Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback Sentiment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentFeedback.map((feedback, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getSentimentColor(feedback.sentiment)}>
                          {getSentimentIcon(feedback.sentiment)}
                          <span className="ml-1 capitalize">{feedback.sentiment}</span>
                        </Badge>
                        <span className="text-sm text-gray-600">{feedback.category}</span>
                      </div>
                      <span className="text-xs text-gray-500">{feedback.count} responses</span>
                    </div>
                    <p className="text-sm text-gray-700">{feedback.feedback}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(feedback.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  AI-Generated Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Strengths</h4>
                  <ul className="mt-2 text-sm text-blue-700 space-y-1">
                    <li>• Storytelling and illustrations resonate well with congregation</li>
                    <li>• Biblical explanations are clear and accessible</li>
                    <li>• High completion rates indicate strong engagement</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-900">Opportunities</h4>
                  <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                    <li>• Consider shortening introduction segments</li>
                    <li>• Add more practical application examples</li>
                    <li>• Increase interactive elements during service</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900">Recommendations</h4>
                  <ul className="mt-2 text-sm text-green-700 space-y-1">
                    <li>• Focus on John 3:16 style explanations</li>
                    <li>• Continue current storytelling approach</li>
                    <li>• Develop follow-up small group materials</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={engagementTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="attendance" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="shares" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="prayers" stackId="1" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Performing Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">God's Love</span>
                    <Badge variant="secondary">95% engagement</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Faith & Trust</span>
                    <Badge variant="secondary">89% engagement</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Peace & Comfort</span>
                    <Badge variant="secondary">88% engagement</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Peak Engagement Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sunday 10:30 AM</span>
                    <Badge variant="secondary">92% avg</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Wednesday 7:00 PM</span>
                    <Badge variant="secondary">78% avg</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Online Replays</span>
                    <Badge variant="secondary">65% avg</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Facebook</span>
                    <Badge variant="secondary">45% of shares</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">WhatsApp</span>
                    <Badge variant="secondary">30% of shares</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Email</span>
                    <Badge variant="secondary">25% of shares</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}