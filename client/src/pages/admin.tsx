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

// Church Verification Component
function ChurchVerificationTab() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  
  // Query for churches pending verification
  const { data: pendingChurches, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/churches', statusFilter],
    queryFn: () => fetch(`/api/admin/churches?status=${statusFilter}`).then(res => res.json())
  });

  // Mutation for approving churches
  const approveChurchMutation = useMutation({
    mutationFn: async (churchId: number) => {
      const response = await apiRequest('/api/admin/churches/approve', {
        method: 'POST',
        body: JSON.stringify({ churchId })
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Church Approved",
        description: "Church has been successfully verified and approved.",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve church",
        variant: "destructive",
      });
    }
  });

  // Mutation for rejecting churches
  const rejectChurchMutation = useMutation({
    mutationFn: async ({ churchId, reason }: { churchId: number; reason: string }) => {
      const response = await apiRequest('/api/admin/churches/reject', {
        method: 'POST',
        body: JSON.stringify({ churchId, reason })
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Church Rejected",
        description: "Church submission has been rejected.",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject church",
        variant: "destructive",
      });
    }
  });

  const handleApprove = (churchId: number) => {
    approveChurchMutation.mutate(churchId);
  };

  const handleReject = (churchId: number, reason: string) => {
    rejectChurchMutation.mutate({ churchId, reason });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Church Verification</h2>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending Verification</SelectItem>
              <SelectItem value="approved">Approved Churches</SelectItem>
              <SelectItem value="rejected">Rejected Churches</SelectItem>
              <SelectItem value="all">All Churches</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6">
        {pendingChurches?.length === 0 ? (
          <Card className="p-8 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No {statusFilter} churches found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {statusFilter === 'pending' 
                ? "All churches have been reviewed."
                : `No churches with ${statusFilter} status.`}
            </p>
          </Card>
        ) : (
          pendingChurches?.map((church: any) => (
            <Card key={church.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {church.name}
                    </h3>
                    <Badge 
                      variant={church.status === 'pending' ? 'default' : 
                              church.status === 'approved' ? 'secondary' : 'destructive'}
                    >
                      {church.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {church.denomination && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span>{church.denomination}</span>
                      </div>
                    )}
                    {church.city && church.state && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{church.city}, {church.state}</span>
                      </div>
                    )}
                    {church.size && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{church.size}</span>
                      </div>
                    )}
                  </div>
                  {church.description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {church.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Submitted: {new Date(church.createdAt).toLocaleDateString()}</span>
                    {church.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{church.email}</span>
                      </div>
                    )}
                    {church.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{church.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Church Logo */}
                {church.logoUrl && (
                  <div className="ml-4">
                    <img 
                      src={church.logoUrl} 
                      alt={`${church.name} logo`}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons - Only show for pending churches */}
              {church.status === 'pending' && (
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleApprove(church.id)}
                    disabled={approveChurchMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Church
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        disabled={rejectChurchMutation.isPending}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Church Submission</DialogTitle>
                        <DialogDescription>
                          Provide a reason for rejecting "{church.name}". This will be communicated to the submitter.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea 
                          placeholder="Enter rejection reason..."
                          id={`rejection-reason-${church.id}`}
                          rows={3}
                        />
                        <div className="flex justify-end gap-3">
                          <DialogTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogTrigger>
                          <Button 
                            onClick={() => {
                              const textarea = document.getElementById(`rejection-reason-${church.id}`) as HTMLTextAreaElement;
                              const reason = textarea?.value || "No reason provided";
                              handleReject(church.id, reason);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Confirm Rejection
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* Additional Details for approved/rejected */}
              {church.status !== 'pending' && (
                <div className="pt-4 border-t text-sm text-gray-500">
                  <span>
                    {church.status === 'approved' ? 'Approved' : 'Rejected'} on: {new Date(church.updatedAt).toLocaleDateString()}
                  </span>
                  {church.rejectionReason && (
                    <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                      <span className="font-medium text-red-800 dark:text-red-400">Rejection Reason: </span>
                      <span className="text-red-700 dark:text-red-300">{church.rejectionReason}</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

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
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="churches">Churches</TabsTrigger>
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

          <TabsContent value="churches" className="space-y-6">
            <ChurchVerificationTab />
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