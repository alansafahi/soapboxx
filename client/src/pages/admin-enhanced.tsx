import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Church, Calendar, Users, MessageSquare, Heart, Building, MapPin, Phone, Mail, Globe, Clock, Plus, Upload, X, Trophy, Settings, 
  BookOpen, Video, Music, FileText, Edit, Trash2, Eye, Book, AlertTriangle, UserCheck, Tag, Flag, CheckCircle, XCircle, 
  Filter, Search, Send, UserPlus, Calendar as CalendarIcon, UserCheck2, ClipboardList, Archive, Headphones, PlayCircle, 
  User, Home, MapPinIcon, UserCog, HeartHandshake, Star, TrendingUp, PanelLeftClose, PanelLeftOpen, HelpCircle, Bell,
  Edit3, Mic, Share2, Download
} from "lucide-react";
import { insertChurchSchema, insertEventSchema, insertDevotionalSchema } from "@shared/schema";
import { SimpleMemberDirectory } from "@/components/SimpleMemberDirectory";
import { SessionsManagement } from "@/components/SessionsManagement";
import SermonCreationStudio from "@/components/SermonCreationStudio";
import RoleSwitcher from "@/components/RoleSwitcher";

const churchFormSchema = insertChurchSchema;
const eventFormSchema = insertEventSchema;
const devotionalFormSchema = insertDevotionalSchema;

type ChurchFormData = z.infer<typeof churchFormSchema>;
type EventFormData = z.infer<typeof eventFormSchema>;
type DevotionalFormData = z.infer<typeof devotionalFormSchema>;

export default function EnhancedAdminPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedChurch, setSelectedChurch] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [isChurchDialogOpen, setIsChurchDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isDevotionalDialogOpen, setIsDevotionalDialogOpen] = useState(false);

  const { data: churches = [], isLoading: churchesLoading } = useQuery({
    queryKey: ["/api/churches/created"],
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events", selectedChurch],
    enabled: !!selectedChurch,
  });

  const { data: prayers = [] } = useQuery({
    queryKey: ["/api/prayers", selectedChurch],
    enabled: !!selectedChurch,
  });

  const churchForm = useForm<ChurchFormData>({
    resolver: zodResolver(churchFormSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      denomination: "",
      isActive: true,
    },
  });

  const eventForm = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      churchId: selectedChurch || 0,
      category: "service",
      isPublic: true,
    },
  });

  const createChurchMutation = useMutation({
    mutationFn: async (data: ChurchFormData) => {
      const response = await apiRequest("/api/churches", {
        method: "POST",
        body: data,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/churches"] });
      setIsChurchDialogOpen(false);
      churchForm.reset();
      toast({
        title: "Success",
        description: "Church created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create church",
        variant: "destructive",
      });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const response = await apiRequest("/api/events", {
        method: "POST",
        body: data,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsEventDialogOpen(false);
      eventForm.reset();
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const handleCreateChurch = (data: ChurchFormData) => {
    createChurchMutation.mutate(data);
  };

  const handleCreateEvent = (data: EventFormData) => {
    createEventMutation.mutate({
      ...data,
      churchId: selectedChurch || 0,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Header with Global Search */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">SoapBox Admin Portal</h1>
          </div>
          
          {/* Global Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search members, prayers, events..." 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <RoleSwitcher />
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative">
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Enhanced Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-80'} bg-white dark:bg-gray-800 shadow-lg border-r transition-all duration-300 overflow-hidden`}>
          <div className="p-4">
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : <PanelLeftClose className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
            </button>
          </div>
          
          {/* Church Selector */}
          {!sidebarCollapsed && (
            <div className="px-4 pb-4">
              <select 
                value={selectedChurch || ""} 
                onChange={(e) => setSelectedChurch(Number(e.target.value))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a Church</option>
                {(churches as any[]).map((church) => (
                  <option key={church.id} value={church.id}>{church.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Navigation */}
          <nav className="px-4 space-y-2">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === "dashboard" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Building className="h-5 w-5" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </button>
            <button 
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === "analytics" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              {!sidebarCollapsed && (
                <>
                  <span>Analytics</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-auto">+12%</span>
                </>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("people")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === "people" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Users className="h-5 w-5" />
              {!sidebarCollapsed && (
                <>
                  <span>People</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-auto">234</span>
                </>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("ministry")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === "ministry" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Heart className="h-5 w-5" />
              {!sidebarCollapsed && <span>Ministry</span>}
            </button>
            <button 
              onClick={() => setActiveTab("prayers")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === "prayers" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <HeartHandshake className="h-5 w-5" />
              {!sidebarCollapsed && (
                <>
                  <span>Prayers</span>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full ml-auto">7 new</span>
                </>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === "settings" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Settings className="h-5 w-5" />
              {!sidebarCollapsed && <span>Settings</span>}
            </button>
          </nav>

          {/* Quick Actions */}
          {!sidebarCollapsed && (
            <div className="px-4 mt-8">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">QUICK ACTIONS</div>
              <div className="space-y-2">
                <button 
                  onClick={() => setIsEventDialogOpen(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 rounded-lg text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Event</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 rounded-lg text-sm">
                  <Plus className="h-4 w-4" />
                  <span>New Prayer</span>
                </button>
                <button 
                  onClick={() => setIsDevotionalDialogOpen(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Devotional</span>
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Enhanced Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome to your enhanced church management portal</p>
              </div>

              {/* Quick Stats with Sparklines */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Events This Week</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{(events as any[]).length}</p>
                        <span className="text-sm text-green-600 font-medium">↗ +5%</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-12 h-3 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">vs last week</span>
                      </div>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prayer Requests</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{(prayers as any[]).length}</p>
                        <span className="text-sm text-orange-600 font-medium">→ 0%</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-12 h-3 bg-gradient-to-r from-purple-500 to-purple-300 rounded-full"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">this month</span>
                      </div>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Heart className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Members</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">234</p>
                        <span className="text-sm text-green-600 font-medium">↗ +12%</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-12 h-3 bg-gradient-to-r from-green-500 to-green-300 rounded-full"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
                      </div>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Volunteer Hours</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
                        <span className="text-sm text-green-600 font-medium">↗ +23%</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-12 h-3 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">this week</span>
                      </div>
                    </div>
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <HeartHandshake className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Church Management */}
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Churches
                  </CardTitle>
                  <Dialog open={isChurchDialogOpen} onOpenChange={setIsChurchDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Church
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(churches as any[]).map((church) => (
                      <Button
                        key={church.id}
                        variant={selectedChurch === church.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedChurch(church.id)}
                      >
                        <Church className="h-4 w-4 mr-2" />
                        {church.name || `Church ${church.id}`}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              </div>
            </div>
          )}

          {/* People Tab - Enhanced Member Management */}
          {activeTab === "people" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Member Directory</h2>
                <Button className="bg-green-600 hover:bg-green-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
              <SimpleMemberDirectory selectedChurch={selectedChurch} />
            </div>
          )}

          {/* Ministry Tab - Comprehensive Ministry Management */}
          {activeTab === "ministry" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ministry Management</h2>
              
              {/* Sermon Management System - Featured Section */}
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Mic className="h-6 w-6" />
                    AI-Powered Sermon Creation Studio
                    <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700">Pastor Tools</Badge>
                  </CardTitle>
                  <p className="text-blue-700 text-sm">
                    Complete sermon preparation with AI research, outline generation, story suggestions, and content enhancement
                  </p>
                </CardHeader>
                <CardContent>
                  <SermonCreationStudio />
                </CardContent>
              </Card>

              {/* Other Ministry Tools */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Sessions Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SessionsManagement />
                  </CardContent>
                </Card>
                <Card className="p-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HeartHandshake className="h-5 w-5" />
                      Prayer Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-gray-500 py-8">
                      Prayer management system will be connected here
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Prayers Tab */}
          {activeTab === "prayers" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prayer Requests</h2>
              <Card className="p-6">
                <div className="text-center text-gray-500 py-8">
                  Prayer management interface
                </div>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Church Settings</h2>
              <Card className="p-6">
                <div className="text-center text-gray-500 py-8">
                  Church profile management interface
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Floating Quick Actions */}
      <div className="fixed bottom-6 right-6">
        <div className="relative">
          <button 
            onClick={() => setQuickActionsOpen(!quickActionsOpen)}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          >
            <Plus className="h-6 w-6" />
          </button>
          
          {quickActionsOpen && (
            <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border p-2 min-w-48">
              <button 
                onClick={() => {setIsEventDialogOpen(true); setQuickActionsOpen(false);}}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>Add Event</span>
              </button>
              <button 
                onClick={() => {setIsDevotionalDialogOpen(true); setQuickActionsOpen(false);}}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Book className="h-4 w-4 text-green-600" />
                <span>Add Devotional</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Heart className="h-4 w-4 text-purple-600" />
                <span>New Prayer</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dialog Components */}
      <Dialog open={isChurchDialogOpen} onOpenChange={setIsChurchDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Church</DialogTitle>
          </DialogHeader>
          <Form {...churchForm}>
            <form onSubmit={churchForm.handleSubmit(handleCreateChurch)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={churchForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Church Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Grace Community Church" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={churchForm.control}
                  name="denomination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Denomination</FormLabel>
                      <FormControl>
                        <Input placeholder="Non-denominational" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={churchForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A welcoming community focused on..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsChurchDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createChurchMutation.isPending}>
                  Create Church
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <Form {...eventForm}>
            <form onSubmit={eventForm.handleSubmit(handleCreateEvent)} className="space-y-6">
              <FormField
                control={eventForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Sunday Service" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={eventForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Event description..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createEventMutation.isPending}>
                  Create Event
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}