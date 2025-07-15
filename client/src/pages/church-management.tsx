import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useToast } from "../hooks/use-toast";
import { ChurchFeatureManager } from "../components/ChurchFeatureManager";
import { useParams, useLocation } from "wouter";
import {
  Building2,
  Settings,
  Users,
  ArrowLeft,
  Save,
  MapPin,
  Phone,
  Mail,
  Globe
} from "lucide-react";

interface ChurchProfile {
  id: number;
  name: string;
  denomination: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  bio?: string;
  memberCount: number;
  role?: string;
}

export default function ChurchManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { churchId } = useParams<{ churchId: string }>();
  const [editedProfile, setEditedProfile] = useState<Partial<ChurchProfile>>({});
  const [activeTab, setActiveTab] = useState("profile");

  // Get church details
  const { data: church, isLoading } = useQuery({
    queryKey: ['church-details', churchId],
    queryFn: async () => {
      const response = await fetch(`/api/churches/${churchId}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch church details');
      return response.json() as ChurchProfile;
    },
    enabled: !!churchId,
  });

  // Check if user has admin access
  const { data: userRole, error: roleError } = useQuery({
    queryKey: ['user-church-role', churchId],
    queryFn: async () => {
      const response = await fetch(`/api/users/churches/${churchId}/role`, { credentials: 'include' });
      if (!response.ok) {
        // If user is not found for this church, they might still be an admin through other means
        return { role: null, error: response.status };
      }
      return response.json();
    },
    enabled: !!churchId,
    retry: false, // Don't retry role checks
  });

  // Update church profile mutation
  const updateChurchMutation = useMutation({
    mutationFn: async (profileData: Partial<ChurchProfile>) => {
      const response = await fetch(`/api/churches/${churchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update church profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['church-details', churchId] });
      queryClient.invalidateQueries({ queryKey: ['user-churches'] });
      toast({
        title: "Profile Updated",
        description: "Church profile has been updated successfully.",
      });
      setEditedProfile({});
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update church profile.",
        variant: "destructive"
      });
    },
  });

  useEffect(() => {
    if (church) {
      setEditedProfile({});
    }
  }, [church]);

  // Check if user has admin access
  const hasAdminAccess = () => {
    // For SoapBox Owner users, always allow access
    if (user?.role === 'soapbox_owner') {
      return true;
    }
    
    // If there was a role error (like user not associated), check if they are a church creator
    if (roleError || userRole?.error) {
      // For church_admin role users, try to allow access (they might have created this church)
      if (user?.role === 'church_admin' || user?.role === 'admin' || user?.role === 'system_admin') {
        return true;
      }
    }
    
    // Check if user has admin role for this specific church
    const adminRoles = ['church_admin', 'owner', 'pastor', 'lead-pastor', 'system-admin', 'admin'];
    return adminRoles.includes(userRole?.role || '');
  };

  const handleFieldChange = (field: keyof ChurchProfile, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (Object.keys(editedProfile).length === 0) {
      toast({
        title: "No Changes",
        description: "No changes to save.",
      });
      return;
    }

    updateChurchMutation.mutate(editedProfile);
  };

  const getFieldValue = (field: keyof ChurchProfile) => {
    return editedProfile[field] !== undefined ? editedProfile[field] : church?.[field] || '';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading church details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!church) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Church Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The church you're looking for could not be found.
            </p>
            <Button onClick={() => setLocation('/churches')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Churches
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAdminAccess()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You don't have permission to manage this church.
            </p>
            <Button onClick={() => setLocation('/churches')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Churches
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasChanges = Object.keys(editedProfile).length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setLocation('/churches')}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Churches
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manage {church.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Update church profile and configure features
            </p>
          </div>
        </div>
        
        {hasChanges && (
          <Button 
            onClick={handleSave} 
            disabled={updateChurchMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateChurchMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">
            <Building2 className="w-4 h-4 mr-2" />
            Church Profile
          </TabsTrigger>
          <TabsTrigger value="features">
            <Settings className="w-4 h-4 mr-2" />
            Feature Settings
          </TabsTrigger>
        </TabsList>

        {/* Church Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Church Name *</Label>
                  <Input
                    id="name"
                    value={getFieldValue('name')}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Enter church name"
                  />
                </div>
                <div>
                  <Label htmlFor="denomination">Denomination</Label>
                  <Input
                    id="denomination"
                    value={getFieldValue('denomination')}
                    onChange={(e) => handleFieldChange('denomination', e.target.value)}
                    placeholder="e.g., Baptist, Methodist, Presbyterian"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={getFieldValue('description')}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Brief description of your church"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location & Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={getFieldValue('address')}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={getFieldValue('city')}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={getFieldValue('state')}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={getFieldValue('zipCode')}
                    onChange={(e) => handleFieldChange('zipCode', e.target.value)}
                    placeholder="ZIP Code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={getFieldValue('phone')}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={getFieldValue('email')}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="contact@church.org"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={getFieldValue('website')}
                    onChange={(e) => handleFieldChange('website', e.target.value)}
                    placeholder="https://church.org"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Church Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Users className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Members</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{church.memberCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Settings className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Your Role</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                      {userRole?.role || 'Member'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Settings Tab */}
        <TabsContent value="features">
          <ChurchFeatureManager 
            churchId={parseInt(churchId!)} 
            userRole={userRole?.role || 'member'} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}