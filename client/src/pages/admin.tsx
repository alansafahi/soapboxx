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

// Church Management Component
function ChurchManagementTab() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  
  // Query for churches by status
  const { data: churches, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin-portal/churches', statusFilter],
    queryFn: () => fetch(`/api/admin-portal/churches?status=${statusFilter}`).then(res => res.json())
  });

  // Mutation for approving churches
  const approveChurchMutation = useMutation({
    mutationFn: async (churchId: number) => {
      const response = await apiRequest('POST', '/api/admin-portal/churches/approve', { churchId });
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
      const response = await apiRequest('POST', '/api/admin-portal/churches/reject', { churchId, reason });
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

  // Mutation for suspending churches
  const suspendChurchMutation = useMutation({
    mutationFn: async ({ churchId, reason }: { churchId: number; reason: string }) => {
      const response = await apiRequest('POST', '/api/admin-portal/churches/suspend', { churchId, reason });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Church Suspended",
        description: "Church has been suspended.",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Suspension Failed",
        description: error.message || "Failed to suspend church",
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

  const handleSuspend = (churchId: number, reason: string) => {
    suspendChurchMutation.mutate({ churchId, reason });
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Church Management</h2>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending Churches</SelectItem>
              <SelectItem value="approved">Approved Churches</SelectItem>
              <SelectItem value="rejected">Rejected Churches</SelectItem>
              <SelectItem value="suspended">Suspended Churches</SelectItem>
              <SelectItem value="all">All Churches</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6">
        {churches?.length === 0 ? (
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
          churches?.map((church: any) => (
            <Card key={church.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {church.name}
                    </h3>
                    <Badge 
                      variant={church.status === 'pending' ? 'default' : 
                              church.status === 'approved' ? 'secondary' : 
                              church.status === 'suspended' ? 'outline' : 'destructive'}
                      className={church.status === 'suspended' ? 'border-orange-500 text-orange-600' : ''}
                    >
                      {(() => {
                        const status = church.status;
                        if (!status || status === 'NaN' || isNaN(status)) return 'Pending';
                        if (typeof status === 'string') return status.charAt(0).toUpperCase() + status.slice(1);
                        return String(status);
                      })()}
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
                        <span>{isNaN(Number(church.size)) ? church.size : Number(church.size).toLocaleString()}</span>
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

              {/* Action Buttons - Show different buttons based on church status */}
              <div className="flex items-center gap-3 pt-4 border-t">
                {church.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleApprove(church.id)}
                      disabled={approveChurchMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          disabled={rejectChurchMutation.isPending}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Decline Church Submission</DialogTitle>
                          <DialogDescription>
                            Provide a reason for declining "{church.name}". This will be communicated to the submitter.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea 
                            placeholder="Enter decline reason..."
                            id={`decline-reason-${church.id}`}
                            rows={3}
                          />
                          <div className="flex justify-end gap-3">
                            <DialogTrigger asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogTrigger>
                            <Button 
                              onClick={() => {
                                const textarea = document.getElementById(`decline-reason-${church.id}`) as HTMLTextAreaElement;
                                const reason = textarea?.value || "No reason provided";
                                handleReject(church.id, reason);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Confirm Decline
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                )}

                {church.status === 'approved' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        disabled={suspendChurchMutation.isPending}
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Suspend
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Suspend Church</DialogTitle>
                        <DialogDescription>
                          Provide a reason for suspending "{church.name}". This will temporarily disable their access.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea 
                          placeholder="Enter suspension reason..."
                          id={`suspend-reason-${church.id}`}
                          rows={3}
                        />
                        <div className="flex justify-end gap-3">
                          <DialogTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogTrigger>
                          <Button 
                            onClick={() => {
                              const textarea = document.getElementById(`suspend-reason-${church.id}`) as HTMLTextAreaElement;
                              const reason = textarea?.value || "No reason provided";
                              handleSuspend(church.id, reason);
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            Confirm Suspension
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {/* Additional Details for non-pending churches */}
              {church.status !== 'pending' && (
                <div className="pt-4 border-t text-sm text-gray-500">
                  <span>
                    {church.status === 'approved' ? 'Approved' : 
                     church.status === 'suspended' ? 'Suspended' : 'Declined'} on: {new Date(church.updatedAt).toLocaleDateString()}
                  </span>
                  {church.rejectionReason && (
                    <div className={`mt-2 p-3 rounded border ${
                      church.status === 'suspended' 
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                      <span className={`font-medium ${
                        church.status === 'suspended'
                          ? 'text-orange-800 dark:text-orange-400'
                          : 'text-red-800 dark:text-red-400'
                      }`}>
                        {church.status === 'suspended' ? 'Suspension' : 'Decline'} Reason: 
                      </span>
                      <span className={
                        church.status === 'suspended'
                          ? 'text-orange-700 dark:text-orange-300'
                          : 'text-red-700 dark:text-red-300'
                      }>{church.rejectionReason}</span>
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

  // Get user's churches to check for admin roles
  const { data: userChurches = [] } = useQuery({
    queryKey: ["/api/users/churches"],
    enabled: !!user,
  });

  // Check if user has admin role in any church
  const hasChurchAdminRole = userChurches.some((uc: any) => {
    const adminRoles = ['church_admin', 'church-admin', 'admin', 'pastor', 'lead-pastor', 'elder', 'system_admin'];
    return adminRoles.includes(uc.role);
  });

  // Allow church administrators and SoapBox owners to access member directory
  const allowedRoles = ['soapbox_owner', 'church_admin', 'pastor', 'lead_pastor', 'admin', 'system_admin'];
  const hasGlobalAccess = allowedRoles.includes(user?.role || '') || user?.role === 'soapbox_owner';
  const hasAccess = hasGlobalAccess || hasChurchAdminRole;

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

  // Get the first church that user is admin of for default selection
  const adminChurch = userChurches.find((uc: any) => {
    const adminRoles = ['church_admin', 'church-admin', 'admin', 'pastor', 'lead-pastor', 'elder', 'system_admin'];
    return adminRoles.includes(uc.role);
  });

  // Set default selected church to the one user is admin of
  React.useEffect(() => {
    if (adminChurch && !selectedChurch) {
      setSelectedChurch(adminChurch.id);
      console.log("Setting selected church to:", adminChurch.id, adminChurch.name);
    }
  }, [adminChurch, selectedChurch]);

  // Show simplified member directory for church admins who are not soapbox owners
  // But allow them to access campus management for their church
  if (hasChurchAdminRole && user?.role !== 'soapbox_owner') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Church Administration</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your church members and campus operations
            </p>
          </div>

          <Tabs defaultValue="members" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="campuses">Campuses</TabsTrigger>
              <TabsTrigger value="cross-campus">Cross-Campus</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Member Management</h2>
              <MemberManagementSystem selectedChurch={selectedChurch} />
            </TabsContent>

            <TabsContent value="campuses" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  Campus Management
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Manage campus locations for your church
                </p>
              </div>
              {selectedChurch ? (
                <CampusManagement churchId={selectedChurch} />
              ) : (
                <Card className="p-8 text-center">
                  <Building2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Loading Church Data</h2>
                  <p className="text-gray-600">Setting up your church administration...</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="cross-campus" className="space-y-6">
              {selectedChurch ? (
                <CrossCampusMemberManagement churchId={selectedChurch} />
              ) : adminChurch ? (
                <CrossCampusMemberManagement churchId={adminChurch.id} />
              ) : (
                <Card className="p-8 text-center">
                  <Users className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Loading Church Data</h2>
                  <p className="text-gray-600">Setting up cross-campus member management...</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-11">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="soapbox-admin">SoapBox Admin</TabsTrigger>
            <TabsTrigger value="church-admin">Church Admin</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="campuses">Campuses</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="content" className="hidden lg:block">Content</TabsTrigger>
            <TabsTrigger value="media" className="hidden lg:block">Media</TabsTrigger>
            <TabsTrigger value="analytics" className="hidden lg:block">Analytics</TabsTrigger>
            <TabsTrigger value="volunteers" className="hidden lg:block">Volunteers</TabsTrigger>
            <TabsTrigger value="settings" className="hidden lg:block">Settings</TabsTrigger>
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

          <TabsContent value="soapbox-admin" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SoapBox Admin</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Platform-wide administration tools for SoapBox Owners
              </p>
            </div>
            <ChurchManagementTab />
          </TabsContent>

          <TabsContent value="church-admin" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building className="h-6 w-6" />
                Church Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Edit and manage the churches you've created as a church administrator.
              </p>
            </div>
            <ChurchAdminManagement />
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