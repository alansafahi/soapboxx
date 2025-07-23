import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Users, TrendingUp, Shield, CheckCircle, AlertTriangle, BarChart3, UserCheck, Edit3, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// D.I.V.I.N.E. Phase 2: Enterprise Ready Dashboard

interface Campus {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  capacity: number;
  isActive: boolean;
  administrators?: any[];
}

interface BackgroundCheck {
  id: number;
  volunteerId: number;
  provider: string;
  status: string;
  checkType: string;
  requestedAt: string;
  completedAt?: string;
  expiresAt: string;
}

interface AnalyticsData {
  volunteerCount: number;
  averageEngagement: number;
  completionRate: number;
  retentionRate: number;
}

export default function DivinePhase2Dashboard() {
  const [selectedCampus, setSelectedCampus] = useState<number | null>(null);
  const [newCampusData, setNewCampusData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    capacity: ''
  });
  const [manageCampusDialog, setManageCampusDialog] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
  const [editCampusData, setEditCampusData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    capacity: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch campuses
  const { data: campuses, isLoading: campusesLoading } = useQuery<Campus[]>({
    queryKey: ['/api/divine-phase2/campuses'],
    queryFn: () => apiRequest('/api/divine-phase2/campuses', 'GET').then(res => res.campuses)
  });

  // Fetch cross-campus statistics
  const { data: statistics } = useQuery({
    queryKey: ['/api/divine-phase2/campuses/statistics'],
    queryFn: () => apiRequest('/api/divine-phase2/campuses/statistics', 'GET').then(res => res.statistics)
  });

  // Fetch expiring background checks
  const { data: expiringChecks } = useQuery<BackgroundCheck[]>({
    queryKey: ['/api/divine-phase2/background-checks/expiring'],
    queryFn: () => apiRequest('/api/divine-phase2/background-checks/expiring', 'GET').then(res => res.expiringChecks)
  });

  // Fetch ministry performance
  const { data: performance } = useQuery({
    queryKey: ['/api/divine-phase2/analytics/ministry/performance'],
    queryFn: () => apiRequest('/api/divine-phase2/analytics/ministry/performance', 'GET').then(res => res.performance)
  });

  // Create campus mutation
  const createCampusMutation = useMutation({
    mutationFn: (campusData: any) => apiRequest('/api/divine-phase2/campuses', 'POST', campusData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Campus created successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/divine-phase2/campuses'] });
      setNewCampusData({ name: '', address: '', city: '', state: '', capacity: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create campus",
        variant: "destructive"
      });
    }
  });

  // Update campus mutation
  const updateCampusMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & any) => 
      apiRequest(`/api/divine-phase2/campuses/${id}`, 'PUT', data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Campus updated successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/divine-phase2/campuses'] });
      setManageCampusDialog(false);
      setEditingCampus(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update campus",
        variant: "destructive"
      });
    }
  });

  // Delete campus mutation
  const deleteCampusMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/divine-phase2/campuses/${id}`, 'DELETE'),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Campus deleted successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/divine-phase2/campuses'] });
      setManageCampusDialog(false);
      setEditingCampus(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete campus",
        variant: "destructive"
      });
    }
  });

  // Request background check mutation
  const requestBackgroundCheckMutation = useMutation({
    mutationFn: (data: { volunteerId: number; checkType: string }) => 
      apiRequest('/api/divine-phase2/background-checks/request', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Background check requested successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/divine-phase2/background-checks'] });
    }
  });

  const handleCreateCampus = () => {
    if (!newCampusData.name || !newCampusData.city) {
      toast({
        title: "Validation Error",
        description: "Please fill in campus name and city",
        variant: "destructive"
      });
      return;
    }

    createCampusMutation.mutate({
      ...newCampusData,
      capacity: parseInt(newCampusData.capacity) || 0,
      churchId: 1 // Default church ID for SoapBox Super App
    });
  };

  const handleManageCampus = (campus: Campus) => {
    setEditingCampus(campus);
    setEditCampusData({
      name: campus.name,
      address: campus.address || '',
      city: campus.city,
      state: campus.state,
      capacity: campus.capacity.toString()
    });
    setManageCampusDialog(true);
  };

  const handleUpdateCampus = () => {
    if (!editingCampus || !editCampusData.name || !editCampusData.city) {
      toast({
        title: "Validation Error",
        description: "Please fill in campus name and city",
        variant: "destructive"
      });
      return;
    }

    updateCampusMutation.mutate({
      id: editingCampus.id,
      ...editCampusData,
      capacity: parseInt(editCampusData.capacity) || 0,
      churchId: 1
    });
  };

  const handleDeleteCampus = () => {
    if (!editingCampus) return;
    
    if (confirm(`Are you sure you want to delete ${editingCampus.name}? This action cannot be undone.`)) {
      deleteCampusMutation.mutate(editingCampus.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            D.I.V.I.N.E. Phase 2: Enterprise Ready
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Disciple-Inspired Volunteer Integration & Nurture Engine - Enterprise Edition
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Campuses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statistics?.totalCampuses || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Volunteers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics?.totalVolunteers || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{statistics?.totalOpportunities || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{expiringChecks?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="campuses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campuses" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Multi-Campus
            </TabsTrigger>
            <TabsTrigger value="background-checks" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Background Checks
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Ministry Leader
            </TabsTrigger>
          </TabsList>

          {/* Campus Management Tab */}
          <TabsContent value="campuses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Create New Campus */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Create New Campus
                  </CardTitle>
                  <CardDescription>
                    Add a new campus location to your church network
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="campus-name">Campus Name</Label>
                      <Input
                        id="campus-name"
                        value={newCampusData.name}
                        onChange={(e) => setNewCampusData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., East Campus"
                      />
                    </div>
                    <div>
                      <Label htmlFor="campus-capacity">Capacity</Label>
                      <Input
                        id="campus-capacity"
                        type="number"
                        value={newCampusData.capacity}
                        onChange={(e) => setNewCampusData(prev => ({ ...prev, capacity: e.target.value }))}
                        placeholder="500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="campus-address">Address</Label>
                    <Input
                      id="campus-address"
                      value={newCampusData.address}
                      onChange={(e) => setNewCampusData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Main Street"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="campus-city">City</Label>
                      <Input
                        id="campus-city"
                        value={newCampusData.city}
                        onChange={(e) => setNewCampusData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Springfield"
                      />
                    </div>
                    <div>
                      <Label htmlFor="campus-state">State</Label>
                      <Input
                        id="campus-state"
                        value={newCampusData.state}
                        onChange={(e) => setNewCampusData(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="IL"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleCreateCampus}
                    disabled={createCampusMutation.isPending}
                    className="w-full"
                  >
                    {createCampusMutation.isPending ? 'Creating...' : 'Create Campus'}
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Campuses */}
              <Card>
                <CardHeader>
                  <CardTitle>Existing Campuses</CardTitle>
                  <CardDescription>
                    Manage your church campus locations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {campusesLoading ? (
                    <div className="text-center py-8">Loading campuses...</div>
                  ) : campuses?.length ? (
                    <div className="space-y-4">
                      {campuses.map((campus) => (
                        <div key={campus.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-semibold">{campus.name}</h3>
                            <p className="text-sm text-gray-600">{campus.city}, {campus.state}</p>
                            <p className="text-xs text-gray-500">Capacity: {campus.capacity}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={campus.isActive ? "default" : "secondary"}>
                              {campus.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleManageCampus(campus)}
                            >
                              Manage
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No campuses found. Create your first campus above.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Background Checks Tab */}
          <TabsContent value="background-checks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Background Check Management
                </CardTitle>
                <CardDescription>
                  Enterprise-grade background check integration with MinistrySafe and Checkr
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expiringChecks?.length ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-orange-600 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Expiring Background Checks
                    </h3>
                    {expiringChecks.map((check) => (
                      <div key={check.id} className="flex items-center justify-between p-4 border border-orange-200 rounded-lg">
                        <div>
                          <p className="font-medium">Volunteer ID: {check.volunteerId}</p>
                          <p className="text-sm text-gray-600">{check.checkType} check via {check.provider}</p>
                          <p className="text-xs text-orange-600">Expires: {new Date(check.expiresAt).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="outline" className="border-orange-500 text-orange-600">
                          {check.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">All background checks are current</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Advanced Analytics Dashboard
                </CardTitle>
                <CardDescription>
                  AI-powered volunteer engagement metrics and ministry performance analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {performance?.length ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Ministry Performance Comparison</h3>
                    {performance.map((ministry: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{ministry.ministryName}</h4>
                          <Badge>{ministry.volunteerCount} volunteers</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Engagement</p>
                            <p className="font-semibold">{ministry.averageEngagement?.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Completion Rate</p>
                            <p className="font-semibold">{ministry.completionRate?.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Retention Rate</p>
                            <p className="font-semibold">{ministry.retentionRate?.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No analytics data available yet. Complete volunteer activities to generate insights.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ministry Leader Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Personalized Ministry Leader Dashboard
                </CardTitle>
                <CardDescription>
                  Configurable widgets with real-time metrics and actionable insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  <Card className="border-dashed border-2 border-gray-300">
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Volunteer Overview Widget</p>
                      <p className="text-xs text-gray-500 mt-1">Coming Soon</p>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed border-2 border-gray-300">
                    <CardContent className="p-6 text-center">
                      <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Engagement Metrics Widget</p>
                      <p className="text-xs text-gray-500 mt-1">Coming Soon</p>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed border-2 border-gray-300">
                    <CardContent className="p-6 text-center">
                      <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Team Performance Widget</p>
                      <p className="text-xs text-gray-500 mt-1">Coming Soon</p>
                    </CardContent>
                  </Card>

                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🎯 Enterprise Features Activated</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>✅ Multi-campus volunteer management with cross-campus analytics</li>
                    <li>✅ Enterprise background check API integration (MinistrySafe/Checkr)</li>
                    <li>✅ AI-powered volunteer engagement scoring and retention prediction</li>
                    <li>✅ Advanced ministry performance analytics and reporting</li>
                    <li>✅ Configurable leadership dashboard with real-time metrics</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Campus Management Dialog */}
        <Dialog open={manageCampusDialog} onOpenChange={setManageCampusDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Manage Campus
              </DialogTitle>
              <DialogDescription>
                Edit or delete this campus location
              </DialogDescription>
            </DialogHeader>
            
            {editingCampus && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-campus-name">Campus Name</Label>
                    <Input
                      id="edit-campus-name"
                      value={editCampusData.name}
                      onChange={(e) => setEditCampusData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., East Campus"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-campus-capacity">Capacity</Label>
                    <Input
                      id="edit-campus-capacity"
                      type="number"
                      value={editCampusData.capacity}
                      onChange={(e) => setEditCampusData(prev => ({ ...prev, capacity: e.target.value }))}
                      placeholder="500"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-campus-address">Address</Label>
                  <Input
                    id="edit-campus-address"
                    value={editCampusData.address}
                    onChange={(e) => setEditCampusData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main Street"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-campus-city">City</Label>
                    <Input
                      id="edit-campus-city"
                      value={editCampusData.city}
                      onChange={(e) => setEditCampusData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Springfield"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-campus-state">State</Label>
                    <Input
                      id="edit-campus-state"
                      value={editCampusData.state}
                      onChange={(e) => setEditCampusData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="IL"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleUpdateCampus}
                    disabled={updateCampusMutation.isPending}
                    className="flex-1"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {updateCampusMutation.isPending ? 'Updating...' : 'Update Campus'}
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteCampus}
                    disabled={deleteCampusMutation.isPending}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleteCampusMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}