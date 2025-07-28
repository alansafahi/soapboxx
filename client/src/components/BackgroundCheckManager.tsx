import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Shield, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar,
  RefreshCw,
  Settings,
  Send,
  Eye,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";

interface BackgroundCheck {
  id: number;
  volunteerId: number;
  provider: string;
  externalId: string;
  checkType: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'expired';
  requestedAt: string;
  completedAt?: string;
  expiresAt: string;
  cost: string;
  notes: string;
  results?: any;
}

interface Volunteer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  backgroundChecks?: BackgroundCheck[];
}

export default function BackgroundCheckManager() {
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<number | null>(null);
  const [selectedCheckType, setSelectedCheckType] = useState("comprehensive");
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [isRequestingCheck, setIsRequestingCheck] = useState(false);
  const [viewDetailsCheckId, setViewDetailsCheckId] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch volunteers
  const { data: volunteers = [], isLoading: loadingVolunteers } = useQuery({
    queryKey: ['/api/volunteers'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch expiring background checks
  const { data: expiringChecks = [], isLoading: loadingExpiring } = useQuery({
    queryKey: ['/api/divine-phase2/background-checks/expiring'],
    staleTime: 60 * 1000, // 1 minute
  });

  // Initialize providers mutation
  const initializeProvidersMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('/api/divine-phase2/background-checks/initialize', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Providers Initialized",
        description: "Background check providers have been set up successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Initialization Failed",
        description: error.message || "Failed to initialize background check providers",
        variant: "destructive"
      });
    }
  });

  // Request background check mutation
  const requestCheckMutation = useMutation({
    mutationFn: async ({ volunteerId, checkType, providerId }: {
      volunteerId: number;
      checkType: string;
      providerId?: number;
    }) => {
      return await apiRequest('/api/divine-phase2/background-checks/request', {
        method: 'POST',
        body: JSON.stringify({ volunteerId, checkType, providerId })
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Background Check Requested",
        description: `Background check initiated for volunteer. Provider: ${data.backgroundCheck.provider}`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/volunteers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/divine-phase2/background-checks/expiring'] });
      setIsRequestingCheck(false);
      setSelectedVolunteerId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to request background check",
        variant: "destructive"
      });
    }
  });

  // Process renewals mutation
  const processRenewalsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/divine-phase2/background-checks/process-renewals', {
        method: 'POST'
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Renewals Processed",
        description: data.message || "Renewal reminders processed successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/divine-phase2/background-checks/expiring'] });
    },
    onError: (error: any) => {
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process renewals",
        variant: "destructive"
      });
    }
  });

  // Get status badge color and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'approved':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle, label: 'Approved' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock, label: 'Pending' };
      case 'in_progress':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: RefreshCw, label: 'In Progress' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle, label: 'Rejected' };
      case 'expired':
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: AlertTriangle, label: 'Expired' };
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: AlertCircle, label: 'Unknown' };
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const checkTypes = [
    { value: 'basic', label: 'Basic Check' },
    { value: 'comprehensive', label: 'Comprehensive Check' },
    { value: 'child_protection', label: 'Child Protection Check' },
    { value: 'youth_worker', label: 'Youth Worker Check' },
    { value: 'financial', label: 'Financial Check' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Background Check Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage volunteer background checks with MinistrySafe and Checkr integration
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => initializeProvidersMutation.mutate()}
            disabled={initializeProvidersMutation.isPending}
            variant="outline"
          >
            <Settings className="w-4 h-4 mr-2" />
            {initializeProvidersMutation.isPending ? 'Initializing...' : 'Initialize Providers'}
          </Button>
          <Button
            onClick={() => processRenewalsMutation.mutate()}
            disabled={processRenewalsMutation.isPending}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${processRenewalsMutation.isPending ? 'animate-spin' : ''}`} />
            Process Renewals
          </Button>
        </div>
      </div>

      {/* Expiring Checks Alert */}
      {expiringChecks.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800 dark:text-orange-200">
            Background Checks Expiring Soon
          </AlertTitle>
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            {expiringChecks.length} background check{expiringChecks.length !== 1 ? 's' : ''} expiring within 30 days. 
            Review and process renewals as needed.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="volunteers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Checks</TabsTrigger>
          <TabsTrigger value="request">Request Check</TabsTrigger>
        </TabsList>

        {/* Volunteers Tab */}
        <TabsContent value="volunteers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Volunteer Background Check Status
              </CardTitle>
              <CardDescription>
                View and manage background checks for all volunteers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingVolunteers ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  Loading volunteers...
                </div>
              ) : volunteers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No volunteers found. Create volunteer positions to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Volunteer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Latest Check</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {volunteers.map((volunteer: Volunteer) => {
                      const latestCheck = volunteer.backgroundChecks?.[0];
                      const statusDisplay = latestCheck ? getStatusDisplay(latestCheck.status) : null;
                      const StatusIcon = statusDisplay?.icon;

                      return (
                        <TableRow key={volunteer.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {volunteer.name}
                              {/* Smart Cross-Link to Volunteer Management */}
                              <Link href="/volunteer-management">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-6 px-2 text-xs hover:bg-blue-50"
                                  title="View Volunteer Profile"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                          <TableCell>{volunteer.email}</TableCell>
                          <TableCell>
                            {latestCheck ? (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{latestCheck.checkType}</span>
                                <span className="text-xs text-gray-500">{latestCheck.provider}</span>
                              </div>
                            ) : (
                              <span className="text-gray-500">No checks</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {statusDisplay && StatusIcon ? (
                              <Badge className={statusDisplay.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusDisplay.label}
                              </Badge>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {latestCheck?.expiresAt ? formatDate(latestCheck.expiresAt) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {latestCheck && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setViewDetailsCheckId(latestCheck.id)}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedVolunteerId(volunteer.id);
                                  setIsRequestingCheck(true);
                                }}
                              >
                                <Send className="w-3 h-3 mr-1" />
                                Request
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expiring Checks Tab */}
        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Expiring Background Checks
              </CardTitle>
              <CardDescription>
                Background checks that expire within the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingExpiring ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  Loading expiring checks...
                </div>
              ) : expiringChecks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No background checks expiring in the next 30 days.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Volunteer</TableHead>
                      <TableHead>Check Type</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Days Until Expiration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringChecks.map((item: any) => {
                      const check = item.backgroundCheck;
                      const volunteer = item.volunteer;
                      const expirationDate = new Date(check.expiresAt);
                      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <TableRow key={check.id}>
                          <TableCell className="font-medium">{volunteer.name}</TableCell>
                          <TableCell>{check.checkType}</TableCell>
                          <TableCell>{check.provider}</TableCell>
                          <TableCell>{formatDate(check.expiresAt)}</TableCell>
                          <TableCell>
                            <Badge className={daysUntilExpiration <= 7 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>
                              {daysUntilExpiration} days
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedVolunteerId(volunteer.id);
                                setIsRequestingCheck(true);
                              }}
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Renew
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Request Check Tab */}
        <TabsContent value="request" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Request Background Check
              </CardTitle>
              <CardDescription>
                Request a new background check for a volunteer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volunteer">Select Volunteer</Label>
                  <Select value={selectedVolunteerId?.toString() || ""} onValueChange={(value) => setSelectedVolunteerId(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a volunteer" />
                    </SelectTrigger>
                    <SelectContent>
                      {volunteers.map((volunteer: Volunteer) => (
                        <SelectItem key={volunteer.id} value={volunteer.id.toString()}>
                          {volunteer.name} ({volunteer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkType">Check Type</Label>
                  <Select value={selectedCheckType} onValueChange={setSelectedCheckType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {checkTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    if (selectedVolunteerId) {
                      requestCheckMutation.mutate({
                        volunteerId: selectedVolunteerId,
                        checkType: selectedCheckType,
                        providerId: selectedProvider || undefined
                      });
                    }
                  }}
                  disabled={!selectedVolunteerId || requestCheckMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {requestCheckMutation.isPending ? 'Requesting...' : 'Request Background Check'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}