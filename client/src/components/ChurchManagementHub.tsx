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

// Organization-specific affiliation lists
const AFFILIATIONS = {
  church: [
    // Major Protestant Denominations
    "Baptist", "Southern Baptist", "Independent Baptist", "American Baptist", "Free Will Baptist",
    "Methodist", "United Methodist", "African Methodist Episcopal", "Free Methodist", "Wesleyan",
    "Presbyterian", "Presbyterian Church (USA)", "Presbyterian Church in America", "Orthodox Presbyterian",
    "Lutheran", "Evangelical Lutheran Church", "Lutheran Church Missouri Synod", "Wisconsin Evangelical Lutheran",
    "Episcopal", "Anglican", "Reformed Episcopal",
    
    // Pentecostal and Charismatic
    "Pentecostal", "Assembly of God", "Church of God", "Church of God in Christ", "International Church of the Foursquare Gospel",
    "United Pentecostal Church", "Apostolic", "Full Gospel", "Charismatic", "Vineyard", "Calvary Chapel",
    
    // Reformed and Calvinist
    "Reformed", "Christian Reformed", "Presbyterian Reformed", "Reformed Church in America", "Protestant Reformed",
    "Calvinist", "Reformed Baptist", "Presbyterian Church of America",
    
    // Restorationist Movement
    "Church of Christ", "Disciples of Christ", "Christian Church", "Churches of Christ", "Independent Christian Church",
    
    // Adventist and Sabbatarian
    "Seventh-day Adventist", "Adventist Christian", "Church of God (Seventh Day)",
    
    // Anabaptist and Peace Churches
    "Mennonite", "Amish", "Brethren", "Church of the Brethren", "Mennonite Brethren", "Hutterite",
    "Quaker", "Friends", "Religious Society of Friends",
    
    // Congregational and Independent
    "Congregational", "United Church of Christ", "Congregational Christian", "Conservative Congregational Christian",
    "Independent", "Non-denominational", "Interdenominational", "Community Church", "Bible Church",
    
    // Holiness Movement
    "Nazarene", "Church of the Nazarene", "Salvation Army", "Christian and Missionary Alliance",
    "Church of God (Anderson)", "Pilgrim Holiness", "Free Methodist",
    
    // Evangelical and Fundamentalist
    "Evangelical", "Evangelical Free", "Fundamentalist", "Bible Baptist", "Independent Fundamental Baptist",
    
    // Catholic and Orthodox
    "Roman Catholic", "Catholic", "Eastern Orthodox", "Greek Orthodox", "Russian Orthodox",
    "Orthodox Church in America", "Antiochian Orthodox", "Serbian Orthodox", "Bulgarian Orthodox",
    "Romanian Orthodox", "Ukrainian Orthodox", "Coptic Orthodox", "Ethiopian Orthodox",
    "Armenian Apostolic", "Assyrian Church of the East", "Chaldean Catholic", "Maronite",
    
    // African American Denominations
    "African Methodist Episcopal", "African Methodist Episcopal Zion", "Christian Methodist Episcopal",
    "National Baptist Convention", "Progressive National Baptist Convention", "Full Gospel Baptist",
    
    // Other Christian Traditions
    "Unity", "Unitarian Universalist", "Christian Science", "Latter-day Saints", "Jehovah's Witnesses",
    "Moravian", "Waldensian", "Plymouth Brethren", "Christadelphian"
  ],
  group: [
    "Community Organization", "Non-Profit", "Educational", "Support Group", "Recovery Group",
    "Parent Group", "Youth Organization", "Senior Group", "Health & Wellness", "Environmental",
    "Cultural Organization", "Arts & Music", "Sports & Recreation", "Professional Association",
    "Volunteer Group", "Advocacy Group", "Religious Study Group", "Social Club"
  ],
  ministry: [
    "Youth Ministry", "Children's Ministry", "Young Adults Ministry", "Senior Ministry", 
    "Women's Ministry", "Men's Ministry", "Music Ministry", "Worship Ministry", "Prayer Ministry",
    "Outreach Ministry", "Missions Ministry", "Education Ministry", "Pastoral Care Ministry",
    "Community Service Ministry", "Recovery Ministry", "Family Ministry", "Singles Ministry",
    "Small Groups Ministry", "Discipleship Ministry", "Evangelism Ministry"
  ]
};

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
  description: z.string().optional(),
  logoUrl: z.string().optional()
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
  const [showCustomDenomination, setShowCustomDenomination] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
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
      description: "",
      logoUrl: "",
      weeklyAttendance: "",
      establishedYear: "",
      parentChurchName: "",
      missionStatement: ""
    }
  });

  // Watch the type field to update affiliation options
  const selectedType = createForm.watch("type") as keyof typeof AFFILIATIONS;

  // Claim church form
  const claimForm = useForm({
    defaultValues: {
      churchId: 0,
      justification: ""
    }
  });

  // Helper function to normalize website URL
  const normalizeWebsiteUrl = (url: string) => {
    if (!url || !url.trim()) return "";
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
      return trimmedUrl;
    }
    return `https://${trimmedUrl}`;
  };

  // Handle logo upload
  const handleLogoUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await fetch('/api/upload/community-logo', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload logo');
    }
    
    const result = await response.json();
    return result.logoUrl;
  };

  // Handle logo file selection
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create church mutation
  const createChurchMutation = useMutation({
    mutationFn: async (data: any) => {
      let logoUrl = "";
      
      // Upload logo if selected
      if (logoFile) {
        logoUrl = await handleLogoUpload(logoFile);
      }
      
      // Normalize website URL before sending
      const processedData = {
        ...data,
        website: data.website ? normalizeWebsiteUrl(data.website) : "",
        logoUrl: logoUrl
      };
      return await apiRequest("/api/churches", "POST", processedData);
    },
    onSuccess: () => {
      toast({ title: "Community created successfully!" });
      setCreateDialog(false);
      setShowCustomDenomination(false);
      setLogoFile(null);
      setLogoPreview("");
      createForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/user/churches"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create community", 
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community Administration</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your community organization, campuses, and members
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="churches">Communities</TabsTrigger>
            <TabsTrigger value="management">Community Management</TabsTrigger>
            <TabsTrigger value="directory">Member Directory</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Your Communities</CardTitle>
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
                      <CardTitle className="text-sm font-medium">Primary Community</CardTitle>
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
                <h2 className="text-xl font-semibold mb-2">Welcome to Community Administration</h2>
                <p className="text-gray-600 mb-6">
                  Get started by creating a new community or claiming an existing one
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => {setActiveTab("churches"); setCreateDialog(true);}}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create A Community
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
                <h2 className="text-2xl font-bold">Communities</h2>
                <p className="text-gray-600">Create new communities or claim existing ones</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={createDialog} onOpenChange={(open) => {
                  setCreateDialog(open);
                  if (!open) {
                    setShowCustomDenomination(false);
                    setLogoFile(null);
                    setLogoPreview("");
                    createForm.reset();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create A New Community</DialogTitle>
                      <DialogDescription>
                        Set up a new community and become its administrator
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
                                <FormLabel>Community Name *</FormLabel>
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
                                <Select onValueChange={(value) => {
                                  field.onChange(value);
                                  // Clear denomination when type changes
                                  createForm.setValue("denomination", "");
                                  setShowCustomDenomination(false);
                                }} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="church">Church</SelectItem>
                                    <SelectItem value="ministry">Ministry</SelectItem>
                                    <SelectItem value="group">Group</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="denomination"
                            render={({ field }) => {
                              const currentAffiliations = AFFILIATIONS[selectedType] || AFFILIATIONS.church;
                              
                              return (
                                <FormItem>
                                  <FormLabel>
                                    {selectedType === 'church' ? 'Denomination' : 'Affiliation'}
                                  </FormLabel>
                                  <Select onValueChange={(value) => {
                                    if (value === "other") {
                                      setShowCustomDenomination(true);
                                      field.onChange("");
                                    } else {
                                      setShowCustomDenomination(false);
                                      field.onChange(value);
                                    }
                                  }} value={showCustomDenomination ? "other" : field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder={
                                          selectedType === 'church' 
                                            ? "Select denomination or type..."
                                            : selectedType === 'group'
                                            ? "Select group type or type..."
                                            : "Select ministry type or type..."
                                        } />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-60 overflow-y-auto">
                                      {currentAffiliations.map((affiliation) => (
                                        <SelectItem key={affiliation} value={affiliation}>
                                          {affiliation}
                                        </SelectItem>
                                      ))}
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {showCustomDenomination && (
                                    <FormControl>
                                      <Input
                                        placeholder={
                                          selectedType === 'church' 
                                            ? "Enter custom denomination..."
                                            : selectedType === 'group'
                                            ? "Enter custom group type..."
                                            : "Enter custom ministry type..."
                                        }
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        className="mt-2"
                                      />
                                    </FormControl>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
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
                                  <Input placeholder="https://www.church.org" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Additional Community Information */}
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={createForm.control}
                            name="weeklyAttendance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Weekly Attendance</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select weekly attendance" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="1-50">1-50 (Micro - House church)</SelectItem>
                                    <SelectItem value="51-100">51-100 (Small - Close-knit)</SelectItem>
                                    <SelectItem value="101-250">101-250 (Medium - Community)</SelectItem>
                                    <SelectItem value="251-500">251-500 (Large - Multi-ministry)</SelectItem>
                                    <SelectItem value="501-1000">501-1000 (Very Large - Multi-staff)</SelectItem>
                                    <SelectItem value="1001-2000">1001-2000 (Mega - Extensive programming)</SelectItem>
                                    <SelectItem value="2001-10000">2001-10000 (Giga - High tech)</SelectItem>
                                    <SelectItem value="10000+">10000+ (Meta - National reach)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="establishedYear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Established Year</FormLabel>
                                <FormControl>
                                  <Input placeholder="2020" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="parentChurchName"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Parent Church (if applicable)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Main Campus Church Name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Logo Upload Section */}
                        <div className="space-y-4">
                          <div>
                            <Label>Community Logo</Label>
                            <div className="mt-2 space-y-4">
                              {logoPreview ? (
                                <div className="flex items-center space-x-4">
                                  <img 
                                    src={logoPreview} 
                                    alt="Logo preview" 
                                    className="w-20 h-20 object-cover rounded-lg border"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-600">Logo selected: {logoFile?.name}</p>
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => {
                                        setLogoFile(null);
                                        setLogoPreview("");
                                      }}
                                      className="mt-2"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                    id="logo-upload"
                                  />
                                  <label 
                                    htmlFor="logo-upload" 
                                    className="cursor-pointer"
                                  >
                                    <div className="space-y-2">
                                      <div className="text-gray-400">
                                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        <span className="font-medium text-blue-600 hover:text-blue-500">
                                          Click to upload
                                        </span>
                                        {" "}or drag and drop
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        PNG, JPG, GIF up to 5MB
                                      </div>
                                    </div>
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>

                          <FormField
                            control={createForm.control}
                            name="missionStatement"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mission Statement</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Our mission is to..."
                                    rows={3}
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Brief description of your community..."
                                    rows={3}
                                    {...field} 
                                  />
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
                            {createChurchMutation.isPending ? "Creating..." : "Create Community"}
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Invite Members */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Plus className="h-5 w-5" />
                          Invite Members
                        </CardTitle>
                        <CardDescription>Send invitations to new members</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Email Address</Label>
                          <Input placeholder="pastor@church.org" />
                        </div>
                        <div className="space-y-2">
                          <Label>Default Role</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="minister">Minister</SelectItem>
                              <SelectItem value="pastor">Pastor</SelectItem>
                              <SelectItem value="church_admin">Community Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Personal Message (Optional)</Label>
                          <Textarea placeholder="Welcome to our community!" rows={3} />
                        </div>
                        <Button className="w-full">
                          <Mail className="h-4 w-4 mr-2" />
                          Send Invitation
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Current Staff Roles */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Current Staff & Roles
                        </CardTitle>
                        <CardDescription>Manage existing member roles</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">Alan Safahi</p>
                              <p className="text-sm text-gray-500">alan@soapboxsuperapp.com</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Community Admin</Badge>
                              <Button size="sm" variant="outline">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">Alan SGA</p>
                              <p className="text-sm text-gray-500">alan@safahi.com</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Community Admin</Badge>
                              <Button size="sm" variant="outline">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full mt-4">
                          View All Members
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Role Templates */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Role Templates</CardTitle>
                      <CardDescription>
                        Quick setup templates based on your organization size and structure
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 cursor-pointer">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Small Community</CardTitle>
                            <CardDescription className="text-xs">Under 50 members</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-2">
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Community Admin</span>
                                <Badge variant="outline" className="text-xs">1</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Pastor</span>
                                <Badge variant="outline" className="text-xs">1-2</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Staff</span>
                                <Badge variant="outline" className="text-xs">2-5</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Members</span>
                                <Badge variant="outline" className="text-xs">Rest</Badge>
                              </div>
                            </div>
                            <Button size="sm" className="w-full mt-3">Apply Template</Button>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 cursor-pointer">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Mid-size Community</CardTitle>
                            <CardDescription className="text-xs">50-200 members</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-2">
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Community Admin</span>
                                <Badge variant="outline" className="text-xs">1-2</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Pastor/Minister</span>
                                <Badge variant="outline" className="text-xs">2-4</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Staff</span>
                                <Badge variant="outline" className="text-xs">5-10</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Members</span>
                                <Badge variant="outline" className="text-xs">Rest</Badge>
                              </div>
                            </div>
                            <Button size="sm" className="w-full mt-3">Apply Template</Button>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 cursor-pointer">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Large Community</CardTitle>
                            <CardDescription className="text-xs">200+ members</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-2">
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Community Admin</span>
                                <Badge variant="outline" className="text-xs">2-3</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Lead Pastor</span>
                                <Badge variant="outline" className="text-xs">1</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Ministers</span>
                                <Badge variant="outline" className="text-xs">5-10</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Staff</span>
                                <Badge variant="outline" className="text-xs">10+</Badge>
                              </div>
                            </div>
                            <Button size="sm" className="w-full mt-3">Apply Template</Button>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Community Settings</CardTitle>
                      <CardDescription>Update community information and preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-gray-500 py-8">Community settings coming soon...</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="p-8 text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Community Selected</h3>
                <p className="text-gray-600 mb-4">Create or claim a community first to access management features</p>
                <Button onClick={() => setActiveTab("churches")}>
                  Go to Communities
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Member Directory Tab */}
          <TabsContent value="directory" className="space-y-6">
            {primaryChurch ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Member Directory</h2>
                    <p className="text-gray-600">View and manage all community members</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setActiveTab("management")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Invite Members
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Bulk Actions
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Bulk Member Actions</DialogTitle>
                          <DialogDescription>
                            Perform actions on multiple members at once
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Action Type</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select action" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="change_role">Change Role</SelectItem>
                                <SelectItem value="send_message">Send Message</SelectItem>
                                <SelectItem value="export_list">Export List</SelectItem>
                                <SelectItem value="add_to_group">Add to Group</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button className="w-full">Execute Action</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <MemberManagementSystem selectedChurch={primaryChurch.churchId} />
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Community Selected</h3>
                <p className="text-gray-600 mb-4">Create or claim a community first to manage members</p>
                <Button onClick={() => setActiveTab("churches")}>
                  Go to Communities
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
                <h3 className="text-lg font-semibold mb-2">No Community Selected</h3>
                <p className="text-gray-600 mb-4">Create or claim a community first to view analytics</p>
                <Button onClick={() => setActiveTab("churches")}>
                  Go to Communities
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}