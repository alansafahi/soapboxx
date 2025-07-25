import * as React from "react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { 
  Building2, Users, Settings, BarChart3, Plus, Search, 
  MapPin, Phone, Mail, Globe, User, Crown, Satellite
} from "lucide-react";
import CampusManagement from "./CampusManagement";
import { MemberManagementSystem } from "./MemberManagementSystem";
import { CrossCampusMemberManagement } from "./CrossCampusMemberManagement";

// Church/Group creation schema
const createChurchSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  type: z.string().default("church"),
  denomination: z.string().optional(),
  adminEmail: z.string().email("Valid email required"),
  adminPhone: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional()
});

// Church claim schema
const claimChurchSchema = z.object({
  churchId: z.number(),
  justification: z.string().min(10, "Please explain why you should be admin of this church")
});

export function ChurchManagementHub() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [createDialog, setCreateDialog] = useState(false);
  const [claimDialog, setClaimDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Get user's admin churches
  const { data: userChurches = [] } = useQuery({
    queryKey: ["/api/user/churches"],
  }) as { data: any[] };

  // Get available churches to claim
  const { data: availableChurches = [] } = useQuery({
    queryKey: ["/api/churches/available"],
    enabled: claimDialog
  }) as { data: any[] };

  const adminChurches = userChurches.filter((uc: any) => {
    const adminRoles = ['church_admin', 'admin', 'pastor', 'lead_pastor'];
    return adminRoles.includes(uc.role);
  });

  // Primary church (first one user is admin of)
  const primaryChurch = adminChurches[0];

  // Create church form
  const createForm = useForm({
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      type: "church",
      denomination: "",
      adminEmail: "",
      adminPhone: "",
      website: "",
      description: ""
    }
  });

  // Claim church form
  const claimForm = useForm({
    defaultValues: {
      churchId: 0,
      justification: ""
    }
  });

  // Create church mutation
  const createChurchMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/churches", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Church created successfully!" });
      setCreateDialog(false);
      createForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/user/churches"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create church", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Claim church mutation
  const claimChurchMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/churches/claim", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Claim request submitted! We'll review and get back to you." });
      setClaimDialog(false);
      claimForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to submit claim", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const filteredChurches = availableChurches.filter((church: any) =>
    church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    church.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Church Administration</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your church organization, campuses, and members
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="churches">Churches / Groups</TabsTrigger>
            <TabsTrigger value="management">Church Management</TabsTrigger>
            <TabsTrigger value="directory">Member Directory</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Your Churches</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminChurches.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Admin access
                  </p>
                </CardContent>
              </Card>

              {primaryChurch && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Primary Church</CardTitle>
                      <Crown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{primaryChurch.name}</div>
                      <p className="text-xs text-muted-foreground">
                        {primaryChurch.role}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab("management")}
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        Manage Campuses
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab("directory")}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        View Members
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {!primaryChurch && (
              <Card className="p-8 text-center">
                <Building2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Welcome to Church Administration</h2>
                <p className="text-gray-600 mb-6">
                  Get started by creating a new church or claiming an existing one
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => {setActiveTab("churches"); setCreateDialog(true);}}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Church
                  </Button>
                  <Button variant="outline" onClick={() => {setActiveTab("churches"); setClaimDialog(true);}}>
                    <Search className="h-4 w-4 mr-2" />
                    Claim Existing
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Churches/Groups Tab */}
          <TabsContent value="churches" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Churches & Groups</h2>
                <p className="text-gray-600">Create new organizations or claim existing ones</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Church/Group</DialogTitle>
                      <DialogDescription>
                        Set up a new organization and become its administrator
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...createForm}>
                      <form onSubmit={createForm.handleSubmit((data) => createChurchMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={createForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Organization Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="First Baptist Church" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="church">Church</SelectItem>
                                    <SelectItem value="group">Group</SelectItem>
                                    <SelectItem value="ministry">Ministry</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="denomination"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Denomination/Affiliation</FormLabel>
                                <FormControl>
                                  <Input placeholder="Baptist, Methodist, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Address *</FormLabel>
                                <FormControl>
                                  <Input placeholder="123 Main Street" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Los Angeles" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State *</FormLabel>
                                <FormControl>
                                  <Input placeholder="CA" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Zip Code *</FormLabel>
                                <FormControl>
                                  <Input placeholder="90210" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="adminEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Admin Email *</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="pastor@church.org" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="adminPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Admin Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="(555) 123-4567" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://church.org" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setCreateDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createChurchMutation.isPending}>
                            {createChurchMutation.isPending ? "Creating..." : "Create Organization"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Dialog open={claimDialog} onOpenChange={setClaimDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Claim Existing
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Claim Existing Church</DialogTitle>
                      <DialogDescription>
                        Request admin access to an existing church in our database
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Search Churches</Label>
                        <Input
                          placeholder="Search by name or city..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {filteredChurches.map((church: any) => (
                          <Card key={church.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{church.name}</h3>
                                <p className="text-sm text-gray-600">{church.city}, {church.state}</p>
                                <p className="text-xs text-gray-500">{church.denomination}</p>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => claimForm.setValue("churchId", church.id)}
                              >
                                Select
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>

                      <Form {...claimForm}>
                        <form onSubmit={claimForm.handleSubmit((data) => claimChurchMutation.mutate(data))} className="space-y-4">
                          <FormField
                            control={claimForm.control}
                            name="justification"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Why should you be admin of this church?</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Please explain your role and connection to this church..."
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setClaimDialog(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={claimChurchMutation.isPending}>
                              {claimChurchMutation.isPending ? "Submitting..." : "Submit Claim"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Your Churches */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Organizations</h3>
              {adminChurches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminChurches.map((church: any, index: number) => (
                    <Card key={church.churchId}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{church.name}</CardTitle>
                            <CardDescription>
                              {church.role} {index === 0 && <Badge variant="outline" className="ml-2">Primary</Badge>}
                            </CardDescription>
                          </div>
                          {index === 0 && <Crown className="h-5 w-5 text-yellow-500" />}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{church.city}, {church.state}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            <span>{church.denomination || 'No denomination'}</span>
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-4" 
                          variant="outline"
                          onClick={() => setActiveTab("management")}
                        >
                          Manage Church
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Churches Yet</h3>
                  <p className="text-gray-600 mb-4">Create a new church or claim an existing one to get started</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Church Management Tab */}
          <TabsContent value="management" className="space-y-6">
            {primaryChurch ? (
              <Tabs defaultValue="campuses" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{primaryChurch.name} Management</h2>
                    <p className="text-gray-600">Manage campuses, staff, and church settings</p>
                  </div>
                  <Badge variant="outline">{primaryChurch.role}</Badge>
                </div>

                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="campuses">Campuses</TabsTrigger>
                  <TabsTrigger value="staff">Staff & Roles</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="campuses" className="space-y-6">
                  <CampusManagement churchId={primaryChurch.churchId} />
                </TabsContent>

                <TabsContent value="staff" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Staff Management</CardTitle>
                      <CardDescription>Manage church staff roles and permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-gray-500 py-8">Staff management coming soon...</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Church Settings</CardTitle>
                      <CardDescription>Update church information and preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-gray-500 py-8">Church settings coming soon...</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="p-8 text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Church Selected</h3>
                <p className="text-gray-600 mb-4">Create or claim a church first to access management features</p>
                <Button onClick={() => setActiveTab("churches")}>
                  Go to Churches
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Member Directory Tab */}
          <TabsContent value="directory" className="space-y-6">
            {primaryChurch ? (
              <MemberManagementSystem selectedChurch={primaryChurch.churchId} />
            ) : (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Church Selected</h3>
                <p className="text-gray-600 mb-4">Create or claim a church first to manage members</p>
                <Button onClick={() => setActiveTab("churches")}>
                  Go to Churches
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {primaryChurch ? (
              <CrossCampusMemberManagement churchId={primaryChurch.churchId} />
            ) : (
              <Card className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Church Selected</h3>
                <p className="text-gray-600 mb-4">Create or claim a church first to view analytics</p>
                <Button onClick={() => setActiveTab("churches")}>
                  Go to Churches
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}