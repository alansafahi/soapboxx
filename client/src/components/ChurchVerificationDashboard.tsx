import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from "../hooks/use-toast";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  Calendar,
  Search,
  Filter,
  Building,
  Shield,
  FileText,
  ExternalLink
} from "lucide-react";

interface ChurchVerificationRequest {
  id: number;
  name: string;
  denomination: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  memberCount: number;
  foundedYear: number;
  description: string;
  verificationStatus: "pending" | "verified" | "rejected" | "under_review";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  type: "church" | "group" | "ministry";
  size: "small" | "medium" | "large" | "mega";
}

export function ChurchVerificationDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedChurch, setSelectedChurch] = useState<ChurchVerificationRequest | null>(null);

  // Fetch verification requests
  const { data: verificationRequests, isLoading } = useQuery({
    queryKey: ['verification-requests', activeTab, searchTerm, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: activeTab === "all" ? statusFilter : activeTab,
        search: searchTerm
      });
      const response = await fetch(`/api/admin/verification-requests?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch verification requests');
      return response.json();
    },
  });

  // Update verification status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ churchId, status, notes }: { churchId: number; status: string; notes?: string }) => {
      const response = await fetch(`/api/admin/verification-requests/${churchId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, notes }),
      });
      if (!response.ok) throw new Error('Failed to update verification status');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Verification status updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['verification-requests'] });
      setSelectedChurch(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update status", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleApprove = (churchId: number, notes?: string) => {
    updateStatusMutation.mutate({ churchId, status: 'verified', notes });
  };

  const handleReject = (churchId: number, notes: string) => {
    updateStatusMutation.mutate({ churchId, status: 'rejected', notes });
  };

  const handleReview = (churchId: number) => {
    updateStatusMutation.mutate({ churchId, status: 'under_review' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800"><Eye className="h-3 w-3 mr-1" />Under Review</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getStatusCount = (status: string) => {
    return verificationRequests?.filter((req: ChurchVerificationRequest) => req.verificationStatus === status).length || 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification requests...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Church Verification Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Review and approve church registration requests
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search churches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{getStatusCount('pending')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-blue-600">{getStatusCount('under_review')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">{getStatusCount('verified')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{getStatusCount('rejected')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Requests Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({getStatusCount('pending')})
          </TabsTrigger>
          <TabsTrigger value="under_review">
            Under Review ({getStatusCount('under_review')})
          </TabsTrigger>
          <TabsTrigger value="verified">
            Verified ({getStatusCount('verified')})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({getStatusCount('rejected')})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {verificationRequests?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Verification Requests</h3>
                <p className="text-gray-600">No churches found matching your criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {verificationRequests?.map((church: ChurchVerificationRequest) => (
                <Card key={church.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{church.name}</h3>
                          {getStatusBadge(church.verificationStatus)}
                          <Badge variant="outline">{church.type}</Badge>
                          <Badge variant="secondary">{church.size}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building className="h-4 w-4" />
                            <span>{church.denomination}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{church.city}, {church.state}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{church.memberCount} members</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{church.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{church.phone}</span>
                          </div>
                          {church.website && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Globe className="h-4 w-4" />
                              <a href={church.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                Visit Website <ExternalLink className="h-3 w-3 inline ml-1" />
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-600"><strong>Admin Contact:</strong> {church.adminName} ({church.adminEmail})</p>
                          <p className="text-sm text-gray-600"><strong>Submitted:</strong> {new Date(church.submittedAt).toLocaleDateString()}</p>
                          {church.reviewedAt && (
                            <p className="text-sm text-gray-600"><strong>Reviewed:</strong> {new Date(church.reviewedAt).toLocaleDateString()}</p>
                          )}
                        </div>

                        {church.reviewNotes && (
                          <div className="bg-gray-50 p-3 rounded-md mb-4">
                            <p className="text-sm"><strong>Review Notes:</strong> {church.reviewNotes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedChurch(church)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        
                        {church.verificationStatus === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleReview(church.id)}
                              disabled={updateStatusMutation.isPending}
                            >
                              Start Review
                            </Button>
                          </>
                        )}
                        
                        {church.verificationStatus === 'under_review' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(church.id)}
                              disabled={updateStatusMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                const notes = prompt("Please provide a reason for rejection:");
                                if (notes) handleReject(church.id, notes);
                              }}
                              disabled={updateStatusMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Church Details Modal would go here */}
      {selectedChurch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{selectedChurch.name}</h2>
                <Button variant="outline" onClick={() => setSelectedChurch(null)}>
                  ✕ Close
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Type:</strong> {selectedChurch.type}</p>
                    <p><strong>Denomination:</strong> {selectedChurch.denomination}</p>
                    <p><strong>Size:</strong> {selectedChurch.size}</p>
                    <p><strong>Founded:</strong> {selectedChurch.foundedYear}</p>
                    <p><strong>Members:</strong> {selectedChurch.memberCount}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Address:</strong> {selectedChurch.address}, {selectedChurch.city}, {selectedChurch.state} {selectedChurch.zipCode}</p>
                    <p><strong>Phone:</strong> {selectedChurch.phone}</p>
                    <p><strong>Email:</strong> {selectedChurch.email}</p>
                    <p><strong>Website:</strong> {selectedChurch.website}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-sm text-gray-600">{selectedChurch.description}</p>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Administrative Contact</h3>
                <div className="text-sm">
                  <p><strong>Name:</strong> {selectedChurch.adminName}</p>
                  <p><strong>Email:</strong> {selectedChurch.adminEmail}</p>
                  <p><strong>Phone:</strong> {selectedChurch.adminPhone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}