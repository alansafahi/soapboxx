import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Plus, MapPin, Users, Calendar, Star, Edit, Trash2, 
  ChevronLeft, ChevronRight, X, Activity, Mail, MoreHorizontal,
  AlertTriangle, CheckCircle, Clock, UserPlus, Eye, BookOpen, Heart,
  TrendingUp, Settings
} from "lucide-react";

// Church data with all the enhancement features
const churches = [
  {
    id: 1,
    name: "Christ the King Lutheran Church",
    denomination: "Lutheran",
    location: "Downtown District",
    memberCount: 850,
    activeEvents: 12,
    status: "active",
    pastor: "Rev. Michael Johnson",
    lastActivity: "2 hours ago",
    lastEvent: "June 8, 2025",
    activeUsers: 17,
    isDuplicate: false,
    engagement: 92,
    growth: "+12%"
  },
  {
    id: 2,
    name: "Grace Community Church",
    denomination: "Non-denominational", 
    location: "Riverside Area",
    memberCount: 1200,
    activeEvents: 18,
    status: "active",
    pastor: "Pastor Sarah Davis",
    lastActivity: "1 hour ago",
    lastEvent: "June 10, 2025",
    activeUsers: 23,
    isDuplicate: false,
    engagement: 96,
    growth: "+18%"
  },
  {
    id: 3,
    name: "Grace Community Church",  // Duplicate
    denomination: "Baptist",
    location: "West Side",
    memberCount: 750,
    activeEvents: 8,
    status: "pending",
    pastor: "Rev. David Thompson",
    lastActivity: "3 days ago",
    lastEvent: "June 5, 2025",
    activeUsers: 12,
    isDuplicate: true,
    engagement: 78,
    growth: "+5%"
  },
  {
    id: 4,
    name: "Sacred Heart Catholic Church",
    denomination: "Catholic",
    location: "East End",
    memberCount: 2100,
    activeEvents: 25,
    status: "active",
    pastor: "Father Antonio Rodriguez",
    lastActivity: "30 minutes ago",
    lastEvent: "June 11, 2025",
    activeUsers: 35,
    isDuplicate: false,
    engagement: 88,
    growth: "+8%"
  },
  {
    id: 5,
    name: "New Life Baptist Church",
    denomination: "Baptist",
    location: "North Side",
    memberCount: 650,
    activeEvents: 15,
    status: "inactive",
    pastor: "Rev. James Wilson",
    lastActivity: "2 weeks ago",
    lastEvent: "May 28, 2025",
    activeUsers: 3,
    isDuplicate: false,
    engagement: 45,
    growth: "-2%"
  },
  {
    id: 6,
    name: "First Methodist Church",
    denomination: "Methodist",
    location: "Central District",
    memberCount: 0,
    activeEvents: 0,
    status: "invite_sent",
    pastor: "Rev. Emily Carter",
    lastActivity: "Never",
    lastEvent: "N/A",
    activeUsers: 0,
    isDuplicate: false,
    engagement: 0,
    growth: "N/A"
  }
];

const statusColors = {
  active: "bg-green-500",
  pending: "bg-yellow-500", 
  inactive: "bg-gray-500",
  invite_sent: "bg-blue-500"
};

export default function ChurchesEnhanced() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChurch, setSelectedChurch] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedChurches, setSelectedChurches] = useState<number[]>([]);

  const filteredChurches = churches
    .filter(church => {
      const matchesSearch = church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          church.pastor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === "all" || church.status === selectedStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case "members": return b.memberCount - a.memberCount;
        case "engagement": return b.engagement - a.engagement;
        default: return a.name.localeCompare(b.name);
      }
    });

  const duplicateCount = churches.filter(church => church.isDuplicate).length;
  const activeCount = churches.filter(church => church.status === "active").length;

  const toggleChurchSelection = (churchId: number) => {
    setSelectedChurches(prev => 
      prev.includes(churchId) 
        ? prev.filter(id => id !== churchId)
        : [...prev, churchId]
    );
  };

  const getSelectedChurchData = () => {
    return churches.find(c => c.id === selectedChurch);
  };

  const selectedChurchData = getSelectedChurchData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
      <div className="flex">
        {/* Enhanced Sidebar */}
        <div className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-80"}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Churches</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activeCount} Active Churches</p>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8 p-0"
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          {!sidebarCollapsed && (
            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search churches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="invite_sent">Invite Sent</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="members">Members</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Duplicate Warning */}
          {!sidebarCollapsed && duplicateCount > 0 && (
            <div className="mx-4 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Duplicate Detected</span>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                {duplicateCount} potential duplicate(s) found
              </p>
            </div>
          )}

          {/* Bulk Actions */}
          {!sidebarCollapsed && selectedChurches.length > 0 && (
            <div className="mx-4 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {selectedChurches.length} selected
                </span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedChurches([])}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="text-xs h-7">
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </Button>
                <Button size="sm" variant="outline" className="text-xs h-7">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Add Church Button */}
          {!sidebarCollapsed && (
            <div className="px-4 pb-2">
              <Button variant="outline" className="w-full justify-start h-12 mb-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Church
              </Button>
            </div>
          )}

          {/* Church List */}
          <div className="space-y-1 px-2">
            {filteredChurches.map((church) => (
              <div
                key={church.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                  selectedChurch === church.id 
                    ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                } ${church.isDuplicate ? "border-l-4 border-l-yellow-400" : ""}`}
                onClick={() => setSelectedChurch(church.id)}
              >
                <div className="flex items-start gap-3">
                  {!sidebarCollapsed && (
                    <Checkbox
                      checked={selectedChurches.includes(church.id)}
                      onCheckedChange={() => toggleChurchSelection(church.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    {!sidebarCollapsed ? (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {church.name}
                          </h3>
                          {church.isDuplicate && (
                            <AlertTriangle className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${statusColors[church.status as keyof typeof statusColors]}`} />
                            {church.status === "active" && <CheckCircle className="w-3 h-3" />}
                            {church.status === "pending" && <Clock className="w-3 h-3" />}
                            {church.status === "inactive" && <X className="w-3 h-3" />}
                            {church.status === "invite_sent" && <Mail className="w-3 h-3" />}
                            {church.status.replace("_", " ").charAt(0).toUpperCase() + church.status.replace("_", " ").slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{church.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{church.activeUsers} active users</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            <span>Last: {church.lastActivity}</span>
                          </div>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                            <Calendar className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                            <Heart className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                            <BookOpen className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {church.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {selectedChurchData && (
            <div className="max-w-4xl">
              {/* Church Header */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedChurchData.name}
                      </h1>
                      {selectedChurchData.isDuplicate && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Possible Duplicate
                        </Badge>
                      )}
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${statusColors[selectedChurchData.status as keyof typeof statusColors]}`} />
                        {selectedChurchData.status.replace("_", " ").charAt(0).toUpperCase() + selectedChurchData.status.replace("_", " ").slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedChurchData.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{selectedChurchData.memberCount.toLocaleString()} members</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedChurchData.activeUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Active Events</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedChurchData.activeEvents}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Engagement</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedChurchData.engagement}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedChurchData.growth}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Church Details */}
              <Card>
                <CardContent className="p-6">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="members">Members</TabsTrigger>
                      <TabsTrigger value="events">Events</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4 mt-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-3">Contact Information</h3>
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Pastor:</span> {selectedChurchData.pastor}</div>
                            <div><span className="font-medium">Denomination:</span> {selectedChurchData.denomination}</div>
                            <div><span className="font-medium">Location:</span> {selectedChurchData.location}</div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold mb-3">Activity Summary</h3>
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Last Activity:</span> {selectedChurchData.lastActivity}</div>
                            <div><span className="font-medium">Last Event:</span> {selectedChurchData.lastEvent}</div>
                            <div><span className="font-medium">Total Members:</span> {selectedChurchData.memberCount.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="members" className="mt-6">
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Member Management</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          View and manage church members, roles, and permissions.
                        </p>
                        <Button>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Manage Members
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="events" className="mt-6">
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Event Management</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {selectedChurchData.activeEvents} active events for {selectedChurchData.name}
                        </p>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Event
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="analytics" className="mt-6">
                      <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Church Analytics</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Detailed analytics and engagement metrics for {selectedChurchData.name}
                        </p>
                        <Button>
                          <Activity className="w-4 h-4 mr-2" />
                          View Analytics
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg">
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}