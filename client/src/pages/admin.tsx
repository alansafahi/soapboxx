import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Church, Calendar, Users, MessageSquare, Heart, Building, MapPin, Phone, Mail, Globe, Clock, Plus, Upload, X, Trophy, Settings, BookOpen, Video, Music, FileText, Edit, Trash2, Eye, Book, AlertTriangle, UserCheck, Tag, Flag, CheckCircle, XCircle, Filter, Search, Send, UserPlus, Calendar as CalendarIcon, UserCheck2, ClipboardList, Archive, Headphones, PlayCircle, User, Home, MapPinIcon, UserCog, HeartHandshake, Star, TrendingUp, PanelLeftClose, PanelLeftOpen, HelpCircle, Bell, Share2, BarChart3 } from "lucide-react";
import { insertChurchSchema, insertEventSchema, insertDevotionalSchema, insertWeeklySeriesSchema, insertSermonMediaSchema, insertPrayerFollowUpSchema, insertPrayerUpdateSchema, insertPrayerAssignmentSchema } from "@shared/schema";
import { ChurchProfileManager } from "@/components/church-profile-manager";
import { MemberManagementSystem } from "@/components/MemberManagementSystem";
import { SessionsManagement } from "@/components/SessionsManagement";
import { CounselingManagement } from "@/components/CounselingManagement";
import { EventManagement } from "@/components/EventManagement";
import MediaManagementSystem from "@/components/MediaManagementSystem";
import VolunteerManagementSystem from "@/components/VolunteerManagementSystem";
import ChurchAdminDashboard from "@/components/ChurchAdminDashboard";
import ContentManagementSystem from "@/components/ContentManagementSystem";
import { AnalyticsTab } from "@/components/AnalyticsTab";

function MembersPage() {
  const { user } = useAuth();
  const [selectedChurch, setSelectedChurch] = useState<number | null>(null);

  // Only allow soapbox_owner role to access admin features
  if (user?.role !== 'soapbox_owner') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-gray-600">This page is only accessible to SoapBox administrators.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Portal</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage churches, members, and platform settings
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

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

          <TabsContent value="members" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Member Management</h2>
            <MemberManagementSystem />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Management</h2>
            <EventManagement />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Management</h2>
            <ContentManagementSystem />
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Media Management</h2>
            <MediaManagementSystem />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="volunteers" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Volunteer Management</h2>
            <VolunteerManagementSystem />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Church Settings</h2>
            <ChurchProfileManager churchId={selectedChurch} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return <MembersPage />;
}