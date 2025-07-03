import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Search, Plus, MapPin, Users, Calendar, Star, Filter, MoreVertical, Eye, Edit, Trash2, Phone, Mail, Globe, Church, Heart, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";

// Mock church data with enhanced features
const mockChurches = [
  {
    id: 1,
    name: "Christ the King Lutheran Church",
    denomination: "Lutheran",
    location: "Downtown District",
    address: "123 Main St, Springfield, IL",
    memberCount: 850,
    activeEvents: 12,
    weeklyAttendance: 650,
    rating: 4.8,
    status: "Active",
    pastor: "Rev. Michael Johnson",
    phone: "(555) 123-4567",
    email: "info@ctklutheran.org",
    website: "www.ctklutheran.org",
    founded: 1952,
    lastActivity: "2 hours ago",
    ministries: ["Youth", "Seniors", "Music", "Outreach"],
    engagement: 92,
    growth: "+12%",
    isVerified: true,
    specialties: ["Community Outreach", "Youth Programs", "Music Ministry"]
  },
  {
    id: 2,
    name: "Grace Community Church",
    denomination: "Non-denominational",
    location: "Riverside Area",
    address: "456 Oak Ave, Springfield, IL",
    memberCount: 1200,
    activeEvents: 18,
    weeklyAttendance: 980,
    rating: 4.9,
    status: "Active",
    pastor: "Pastor Sarah Davis",
    phone: "(555) 234-5678",
    email: "hello@gracecc.org",
    website: "www.gracecc.org",
    founded: 1987,
    lastActivity: "1 hour ago",
    ministries: ["Children", "Youth", "Young Adults", "Seniors", "Missions"],
    engagement: 96,
    growth: "+18%",
    isVerified: true,
    specialties: ["Family Ministry", "Missions", "Contemporary Worship"]
  },
  {
    id: 3,
    name: "Sacred Heart Catholic Church",
    denomination: "Catholic",
    location: "West End",
    address: "789 Pine St, Springfield, IL",
    memberCount: 2100,
    activeEvents: 25,
    weeklyAttendance: 1650,
    rating: 4.7,
    status: "Active",
    pastor: "Father Antonio Rodriguez",
    phone: "(555) 345-6789",
    email: "parish@sacredheart.org",
    website: "www.sacredheart.org",
    founded: 1923,
    lastActivity: "30 minutes ago",
    ministries: ["Youth", "Family", "Education", "Social Justice", "Music"],
    engagement: 88,
    growth: "+8%",
    isVerified: true,
    specialties: ["Traditional Worship", "Education", "Social Justice"]
  },
  {
    id: 4,
    name: "New Life Baptist Church",
    denomination: "Baptist",
    location: "North Side",
    address: "321 Cedar Rd, Springfield, IL",
    memberCount: 650,
    activeEvents: 15,
    weeklyAttendance: 520,
    rating: 4.6,
    status: "Active",
    pastor: "Rev. James Wilson",
    phone: "(555) 456-7890",
    email: "info@newlifebaptist.org",
    website: "www.newlifebaptist.org",
    founded: 1965,
    lastActivity: "4 hours ago",
    ministries: ["Youth", "Men", "Women", "Children"],
    engagement: 85,
    growth: "+5%",
    isVerified: false,
    specialties: ["Biblical Teaching", "Community Service", "Youth Development"]
  }
];

export default function ChurchManagementDemo() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDenomination, setFilterDenomination] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedChurch, setSelectedChurch] = useState(null);

  const filteredChurches = mockChurches
    .filter(church => 
      church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      church.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      church.pastor.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(church => 
      filterDenomination === "all" || church.denomination === filterDenomination
    )
    .sort((a, b) => {
      switch(sortBy) {
        case "members": return b.memberCount - a.memberCount;
        case "attendance": return b.weeklyAttendance - a.weeklyAttendance;
        case "rating": return b.rating - a.rating;
        case "activity": return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        default: return a.name.localeCompare(b.name);
      }
    });

  const denominationCounts = mockChurches.reduce((acc, church) => {
    acc[church.denomination] = (acc[church.denomination] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalMembers = mockChurches.reduce((sum, church) => sum + church.memberCount, 0);
  const avgAttendance = mockChurches.reduce((sum, church) => sum + church.weeklyAttendance, 0) / mockChurches.length;
  const totalEvents = mockChurches.reduce((sum, church) => sum + church.activeEvents, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Church Management</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Enhanced interface for managing church communities</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Church
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Church className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Churches</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockChurches.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalMembers.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Attendance</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(avgAttendance)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Events</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalEvents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search churches, locations, or pastors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterDenomination} onValueChange={setFilterDenomination}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by denomination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Denominations</SelectItem>
                  <SelectItem value="Lutheran">Lutheran ({denominationCounts.Lutheran || 0})</SelectItem>
                  <SelectItem value="Non-denominational">Non-denominational ({denominationCounts["Non-denominational"] || 0})</SelectItem>
                  <SelectItem value="Catholic">Catholic ({denominationCounts.Catholic || 0})</SelectItem>
                  <SelectItem value="Baptist">Baptist ({denominationCounts.Baptist || 0})</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="members">Members</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="activity">Last Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Churches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChurches.map((church) => (
            <Card key={church.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg font-semibold">{church.name}</CardTitle>
                      {church.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{church.rating}</span>
                      <span className="mx-1">•</span>
                      <Badge variant="outline" className="text-xs">{church.denomination}</Badge>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{church.name} - Detailed View</DialogTitle>
                      </DialogHeader>
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="contact">Contact</TabsTrigger>
                          <TabsTrigger value="ministries">Ministries</TabsTrigger>
                          <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Pastor</p>
                              <p className="font-medium">{church.pastor}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Founded</p>
                              <p className="font-medium">{church.founded}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Members</p>
                              <p className="font-medium">{church.memberCount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Attendance</p>
                              <p className="font-medium">{church.weeklyAttendance.toLocaleString()}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Specialties</p>
                            <div className="flex flex-wrap gap-2">
                              {church.specialties.map((specialty, index) => (
                                <Badge key={index} variant="secondary">{specialty}</Badge>
                              ))}
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="contact" className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{church.address}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{church.phone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span>{church.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Globe className="w-4 h-4 text-gray-400" />
                              <span>{church.website}</span>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="ministries" className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            {church.ministries.map((ministry, index) => (
                              <Card key={index}>
                                <CardContent className="p-3 text-center">
                                  <p className="font-medium">{ministry}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Ministry</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="analytics" className="space-y-4">
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Engagement Rate</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{church.engagement}%</span>
                              </div>
                              <Progress value={church.engagement} className="h-2" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{church.growth}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
                              </div>
                              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{church.activeEvents}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Active Events</p>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{church.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{church.memberCount.toLocaleString()} members</span>
                    <span className="mx-1">•</span>
                    <span>{church.weeklyAttendance.toLocaleString()} weekly</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{church.activeEvents} active events</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Last activity: {church.lastActivity}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Engagement</span>
                      <span className="text-xs font-medium">{church.engagement}%</span>
                    </div>
                    <Progress value={church.engagement} className="h-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Results Summary */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredChurches.length} of {mockChurches.length} churches
        </div>
      </div>
    </div>
  );
}