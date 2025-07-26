import { useState } from "react";
import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { Church, Calendar, Users, MessageSquare, Heart, Building, Building2, MapPin, Phone, Mail, Globe, Clock, Plus, Upload, X, Trophy, Settings, BookOpen, Video, Music, FileText, Edit, Trash2, Eye, Book, AlertTriangle, UserCheck, Tag, Flag, CheckCircle, XCircle, Filter, Search, Send, UserPlus, Calendar as CalendarIcon, UserCheck2, ClipboardList, Archive, Headphones, PlayCircle, User, Home, MapPinIcon, UserCog, HeartHandshake, Star, TrendingUp, PanelLeftClose, PanelLeftOpen, HelpCircle, Bell, Share2, BarChart3 } from "lucide-react";
import { insertChurchSchema, insertEventSchema, insertDevotionalSchema, insertWeeklySeriesSchema, insertSermonMediaSchema, insertPrayerFollowUpSchema, insertPrayerUpdateSchema, insertPrayerAssignmentSchema } from "../../../shared/schema";
import { ChurchProfileManager } from "../components/church-profile-manager";
import { MemberManagementSystem } from "../components/MemberManagementSystem";
import { SessionsManagement } from "../components/SessionsManagement";
import { CounselingManagement } from "../components/CounselingManagement";
import { EventManagement } from "../components/EventManagement";
import MediaManagementSystem from "../components/MediaManagementSystem";
import VolunteerManagementSystem from "../components/VolunteerManagementSystem";
import ChurchAdminDashboard from "../components/ChurchAdminDashboard";
import ContentManagementSystem from "../components/ContentManagementSystem";
import { AnalyticsTab } from "../components/AnalyticsTab";
import ChurchFeatureManager from "../components/ChurchFeatureManager";
import { ChurchAdminManagement } from "../components/church-admin-management";
import CampusManagement from "../components/CampusManagement";
import { CrossCampusMemberManagement } from "../components/CrossCampusMemberManagement";
import { ChurchManagementHub } from "../components/ChurchManagementHub";
import { CommunityAdminTab } from "../components/CommunityAdminTab";

function MembersPage() {
  const { user } = useAuth();
  const [selectedChurch, setSelectedChurch] = useState<number | null>(null);
  
  // Handle URL tab parameter with proper state management
  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab') || 'overview';
  });

  // Handle tab change with URL update
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', newTab);
    window.history.replaceState({}, '', url.toString());
  };

  // Get user's churches to check for admin roles
  const { data: userChurches = [] } = useQuery({
    queryKey: ["/api/users/churches"],
    enabled: !!user,
  }) as { data: any[] };

  // Check if user has admin role in any church
  const hasChurchAdminRole = userChurches.some((uc: any) => {
    const adminRoles = ['church_admin', 'church-admin', 'admin', 'pastor', 'lead-pastor', 'elder', 'system_admin'];
    return adminRoles.includes(uc.role);
  });

  // Allow church administrators and SoapBox owners to access member directory
  const allowedRoles = ['soapbox_owner', 'church_admin', 'pastor', 'lead_pastor', 'admin', 'system_admin'];
  const hasGlobalAccess = allowedRoles.includes(user?.role || '') || user?.role === 'soapbox_owner';
  const hasAccess = hasGlobalAccess || hasChurchAdminRole;

  // Get the first church that user is admin of for default selection
  // Prioritize SGA Church (2807) if user has access
  const adminChurch = userChurches.find((uc: any) => {
    const adminRoles = ['church_admin', 'church-admin', 'admin', 'pastor', 'lead-pastor', 'elder', 'system_admin'];
    return adminRoles.includes(uc.role) && uc.churchId === 2807;
  }) || userChurches.find((uc: any) => {
    const adminRoles = ['church_admin', 'church-admin', 'admin', 'pastor', 'lead-pastor', 'elder', 'system_admin'];
    return adminRoles.includes(uc.role);
  });

  // Set default selected church to the one user is admin of (moved before conditional return)
  React.useEffect(() => {
    if (adminChurch && !selectedChurch) {
      setSelectedChurch(adminChurch.id);
      
    }
  }, [adminChurch, selectedChurch]);

  // Early returns after all hooks are called
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-gray-600">This page is only accessible to church administrators and SoapBox administrators.</p>
        </Card>
      </div>
    );
  }

  // Note: Removed redirect to ChurchManagementHub to allow church admins access to Admin Portal Community Admin tab

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Portal</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage churches, members, and platform settings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="community-admin">Community Admin</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="campuses">Campuses</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="media" className="hidden lg:block">Media</TabsTrigger>
            <TabsTrigger value="analytics" className="hidden lg:block">Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="hidden lg:block">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="community-admin" className="space-y-6">
            <CommunityAdminTab />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Churches</p>
                      <p className="text-2xl font-bold">2,630</p>
                    </div>
                    <Church className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Members</p>
                      <p className="text-2xl font-bold">15,742</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prayer Requests</p>
                      <p className="text-2xl font-bold">3,284</p>
                    </div>
                    <Heart className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bible Studies</p>
                      <p className="text-2xl font-bold">892</p>
                    </div>
                    <Book className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Platform Growth</h3>
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
          </TabsContent>





          <TabsContent value="features" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Church Feature Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Configure which SoapBox features are available to church members. Perfect for mega churches that want to use only specific SoapBox features while maintaining their existing systems.
              </p>
            </div>
            {user?.role === 'soapbox_owner' ? (
              <ChurchFeatureManager churchId={3} userRole={user.role} />
            ) : (
              <Card className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
                <p className="text-gray-600">Feature management is only accessible to SoapBox administrators.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="campuses" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                Multi-Campus Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage multiple campus locations for your church. Add, edit, and organize campus operations from one central dashboard.
              </p>
            </div>
            {selectedChurch ? (
              <CampusManagement churchId={selectedChurch} />
            ) : (
              <Card className="p-8 text-center">
                <Building2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Select a Church</h2>
                <p className="text-gray-600">Please select a church to manage its campus locations.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Management</h2>
            <EventManagement />
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Media Management</h2>
            <MediaManagementSystem />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Church Settings</h2>
            <ChurchProfileManager churchId={selectedChurch || 0} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return <MembersPage />;
}