import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Building2, 
  Edit3,
  Trash2,
  MapPin,
  Users,
  Plus
} from 'lucide-react';

interface Campus {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  capacity: number;
  phoneNumber?: string;
  workNumber?: string;
  email?: string;
  campusAdminName?: string;
  campusAdminEmail?: string;
  campusAdminMobile?: string;
  isActive: boolean;
  churchId: number;
}

interface CampusManagementProps {
  churchId: number;
}

export default function CampusManagement({ churchId }: CampusManagementProps) {
  const [newCampusData, setNewCampusData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    capacity: '',
    phoneNumber: '',
    workNumber: '',
    email: '',
    campusAdminName: '',
    campusAdminEmail: '',
    campusAdminMobile: ''
  });
  const [manageCampusDialog, setManageCampusDialog] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
  const [editCampusData, setEditCampusData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    capacity: '',
    phoneNumber: '',
    workNumber: '',
    email: '',
    campusAdminName: '',
    campusAdminEmail: '',
    campusAdminMobile: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch church details to identify main church
  const { data: churchDetails } = useQuery({
    queryKey: ['/api/churches', churchId],
    queryFn: () => apiRequest(`/api/churches/${churchId}`, 'GET')
  });

  // Fetch campuses for the church
  const { data: campuses, isLoading: campusesLoading } = useQuery<Campus[]>({
    queryKey: ['/api/churches/campuses', churchId],
    queryFn: () => apiRequest(`/api/churches/${churchId}/campuses`, 'GET').then(res => res.campuses)
  });

  // Sort campuses with main church first, then satellite campuses
  const sortedCampuses = React.useMemo(() => {
    if (!campuses || !churchDetails) return campuses || [];
    
    return [...campuses].sort((a, b) => {
      // Main church (matches church name) comes first
      const aIsMain = a.name === churchDetails.name || a.name.toLowerCase().includes('main');
      const bIsMain = b.name === churchDetails.name || b.name.toLowerCase().includes('main');
      
      if (aIsMain && !bIsMain) return -1;
      if (!aIsMain && bIsMain) return 1;
      
      // Otherwise, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [campuses, churchDetails]);

  // Create campus mutation
  const createCampusMutation = useMutation({
    mutationFn: (campusData: any) => apiRequest(`/api/churches/${churchId}/campuses`, 'POST', campusData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Campus created successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/churches/campuses', churchId] });
      setNewCampusData({ 
        name: '', 
        address: '', 
        city: '', 
        state: '', 
        zipCode: '',
        capacity: '',
        phoneNumber: '',
        workNumber: '',
        email: '',
        campusAdminName: '',
        campusAdminEmail: '',
        campusAdminMobile: ''
      });
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
      apiRequest(`/api/churches/campuses/${id}`, 'PUT', data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Campus updated successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/churches/campuses', churchId] });
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
    mutationFn: (id: number) => apiRequest(`/api/churches/campuses/${id}`, 'DELETE'),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Campus deleted successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/churches/campuses', churchId] });
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
      churchId: churchId
    });
  };

  const handleManageCampus = (campus: Campus) => {
    setEditingCampus(campus);
    setEditCampusData({
      name: campus.name,
      address: campus.address || '',
      city: campus.city,
      state: campus.state,
      zipCode: campus.zipCode || '',
      capacity: campus.capacity.toString(),
      phoneNumber: campus.phoneNumber || '',
      workNumber: campus.workNumber || '',
      email: campus.email || '',
      campusAdminName: campus.campusAdminName || '',
      campusAdminEmail: campus.campusAdminEmail || '',
      campusAdminMobile: campus.campusAdminMobile || ''
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
      churchId: churchId
    });
  };

  const handleDeleteCampus = () => {
    if (!editingCampus) return;
    
    if (confirm(`Are you sure you want to delete ${editingCampus.name}? This action cannot be undone.`)) {
      deleteCampusMutation.mutate(editingCampus.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Campus Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campuses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sortedCampuses?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sortedCampuses?.reduce((sum, campus) => sum + campus.capacity, 0) || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campuses</CardTitle>
            <Badge className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sortedCampuses?.filter(c => c.isActive).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Create New Campus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Add New Campus
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
            
            <div className="grid grid-cols-3 gap-4">
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
              <div>
                <Label htmlFor="campus-zipcode">Zip Code</Label>
                <Input
                  id="campus-zipcode"
                  value={newCampusData.zipCode}
                  onChange={(e) => setNewCampusData(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="62701"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campus-phone">Phone Number</Label>
                <Input
                  id="campus-phone"
                  value={newCampusData.phoneNumber}
                  onChange={(e) => setNewCampusData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="campus-work">Work Number</Label>
                <Input
                  id="campus-work"
                  value={newCampusData.workNumber}
                  onChange={(e) => setNewCampusData(prev => ({ ...prev, workNumber: e.target.value }))}
                  placeholder="(555) 987-6543"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="campus-email">Email Address</Label>
              <Input
                id="campus-email"
                type="email"
                value={newCampusData.email}
                onChange={(e) => setNewCampusData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="campus@church.org"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Campus Administrator</Label>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="admin-name">Administrator Name</Label>
                  <Input
                    id="admin-name"
                    value={newCampusData.campusAdminName}
                    onChange={(e) => setNewCampusData(prev => ({ ...prev, campusAdminName: e.target.value }))}
                    placeholder="John Smith"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="admin-email">Administrator Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={newCampusData.campusAdminEmail}
                      onChange={(e) => setNewCampusData(prev => ({ ...prev, campusAdminEmail: e.target.value }))}
                      placeholder="john@church.org"
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-mobile">Administrator Mobile</Label>
                    <Input
                      id="admin-mobile"
                      value={newCampusData.campusAdminMobile}
                      onChange={(e) => setNewCampusData(prev => ({ ...prev, campusAdminMobile: e.target.value }))}
                      placeholder="(555) 456-7890"
                    />
                  </div>
                </div>
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
            ) : sortedCampuses?.length ? (
              <div className="space-y-4">
                {sortedCampuses.map((campus, index) => {
                  const isMainCampus = churchDetails && (
                    campus.name === churchDetails.name || 
                    campus.name.toLowerCase().includes('main')
                  );
                  
                  return (
                    <div key={campus.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{campus.name}</h3>
                          {isMainCampus && (
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              Main Campus
                            </Badge>
                          )}
                          {!isMainCampus && index > 0 && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Satellite Campus
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {campus.city}, {campus.state}
                        </div>
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
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No campuses found. Create your first campus above.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campus Management Dialog */}
      <Dialog open={manageCampusDialog} onOpenChange={setManageCampusDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
              
              <div className="grid grid-cols-3 gap-4">
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
                <div>
                  <Label htmlFor="edit-campus-zipcode">Zip Code</Label>
                  <Input
                    id="edit-campus-zipcode"
                    value={editCampusData.zipCode}
                    onChange={(e) => setEditCampusData(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="62701"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-campus-phone">Phone Number</Label>
                  <Input
                    id="edit-campus-phone"
                    value={editCampusData.phoneNumber}
                    onChange={(e) => setEditCampusData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-campus-work">Work Number</Label>
                  <Input
                    id="edit-campus-work"
                    value={editCampusData.workNumber}
                    onChange={(e) => setEditCampusData(prev => ({ ...prev, workNumber: e.target.value }))}
                    placeholder="(555) 987-6543"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-campus-email">Email Address</Label>
                <Input
                  id="edit-campus-email"
                  type="email"
                  value={editCampusData.email}
                  onChange={(e) => setEditCampusData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="campus@church.org"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Campus Administrator</Label>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="edit-admin-name">Administrator Name</Label>
                    <Input
                      id="edit-admin-name"
                      value={editCampusData.campusAdminName}
                      onChange={(e) => setEditCampusData(prev => ({ ...prev, campusAdminName: e.target.value }))}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-admin-email">Administrator Email</Label>
                      <Input
                        id="edit-admin-email"
                        type="email"
                        value={editCampusData.campusAdminEmail}
                        onChange={(e) => setEditCampusData(prev => ({ ...prev, campusAdminEmail: e.target.value }))}
                        placeholder="john@church.org"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-admin-mobile">Administrator Mobile</Label>
                      <Input
                        id="edit-admin-mobile"
                        value={editCampusData.campusAdminMobile}
                        onChange={(e) => setEditCampusData(prev => ({ ...prev, campusAdminMobile: e.target.value }))}
                        placeholder="(555) 456-7890"
                      />
                    </div>
                  </div>
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
  );
}