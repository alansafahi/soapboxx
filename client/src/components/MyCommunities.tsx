import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Building, MapPin, Users, Calendar, Plus, Settings, Eye } from "lucide-react";
import { CommunityViewDialog } from "./CommunityViewDialog";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import { z } from "zod";

interface Community {
  id: number;
  name: string;
  type: string; // church, group, ministry
  denomination: string;
  address: string;
  city: string;
  state: string;
  memberCount: number;
  role: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  phone?: string;
}

// Community creation schema
const createCommunitySchema = z.object({
  name: z.string().min(1, "Community name is required"),
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
  logoUrl: z.string().optional(),
  establishedYear: z.string().optional(),
  weeklyAttendance: z.string().optional(),
  parentChurchName: z.string().optional(),
  missionStatement: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  sundayService: z.string().optional(),
  wednesdayService: z.string().optional()
});

// Organization-specific affiliation lists
const AFFILIATIONS = {
  church: [
    "Baptist", "Methodist", "Presbyterian", "Lutheran", "Episcopal", "Catholic", "Orthodox",
    "Pentecostal", "Assembly of God", "Church of Christ", "Disciples of Christ", "Adventist",
    "Mennonite", "Quaker", "Congregational", "Reformed", "Evangelical", "Non-denominational",
    "Interdenominational", "Unity", "Unitarian Universalist"
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

export default function MyCommunities() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createCommunityOpen, setCreateCommunityOpen] = useState(false);
  const [showCustomDenomination, setShowCustomDenomination] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  
  const { data: userCommunities = [], isLoading, error } = useQuery<Community[]>({
    queryKey: ["/api/users/communities"],
    enabled: !!user,
  });

  // Create community form
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
      establishedYear: "",
      weeklyAttendance: "",
      parentChurchName: "",
      missionStatement: "",
      facebookUrl: "",
      instagramUrl: "",
      sundayService: "",
      wednesdayService: ""
    }
  });

  // Watch the type field to update affiliation options
  const selectedType = createForm.watch("type") as keyof typeof AFFILIATIONS;

  // Helper function to normalize website URL
  const normalizeWebsiteUrl = (url: string) => {
    if (!url?.trim()) return "";
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
      return trimmedUrl;
    }
    return `https://${trimmedUrl}`;
  };

  // Create community mutation
  const createCommunityMutation = useMutation({
    mutationFn: async (data: any) => {
      const normalizedData = {
        ...data,
        website: normalizeWebsiteUrl(data.website)
      };
      
      const response = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create community");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Community created successfully!",
        description: "Your new community has been created and you are now the administrator.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users/communities"] });
      setCreateCommunityOpen(false);
      createForm.reset();
      setShowCustomDenomination(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create community",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Communities</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Communities</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Unable to load communities
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                There was an issue loading your communities. Please try again later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'church_admin':
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'pastor':
      case 'lead-pastor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'elder':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace('-', ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Communities</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Communities you're part of and your roles
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={createCommunityOpen} onOpenChange={setCreateCommunityOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create A Community
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create A New Community</DialogTitle>
                <DialogDescription>
                  Set up a new community and become its administrator
                </DialogDescription>
              </DialogHeader>
              
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit((data) => createCommunityMutation.mutate(data))} className="space-y-4">
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
                            <Input placeholder="pastor@church.org" {...field} />
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

                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your community..."
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
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Community Logo URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/logo.png" {...field} />
                          </FormControl>
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
                            <Input type="number" placeholder="2020" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="weeklyAttendance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weekly Attendance</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="150" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="parentChurchName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Church (if applicable)</FormLabel>
                          <FormControl>
                            <Input placeholder="Main Campus Church Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="missionStatement"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
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
                      name="facebookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://facebook.com/community" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="instagramUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/community" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="sundayService"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sunday Service Time</FormLabel>
                          <FormControl>
                            <Input placeholder="10:00 AM" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="wednesdayService"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wednesday Service Time</FormLabel>
                          <FormControl>
                            <Input placeholder="7:00 PM" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setCreateCommunityOpen(false);
                        createForm.reset();
                        setShowCustomDenomination(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createCommunityMutation.isPending}>
                      {createCommunityMutation.isPending ? "Creating..." : "Create Community"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {userCommunities.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Building className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Communities Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                You haven't joined any communities yet. Discover and connect with faith communities in your area.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => {
                    // Scroll to the community discovery section
                    const discoverySection = document.querySelector('#community-discovery');
                    if (discoverySection) {
                      discoverySection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Join a Community
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Churches Section */}
          {userCommunities.filter(c => c.type === 'church').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Churches</h3>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {userCommunities.filter(c => c.type === 'church').length}
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userCommunities.filter(c => c.type === 'church').map((community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow border-2 border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {community.logoUrl ? (
                            <img 
                              src={community.logoUrl} 
                              alt={`${community.name} logo`}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                              <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg leading-6 truncate">
                              {community.name}
                            </CardTitle>
                            <CardDescription>
                              {community.denomination}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getRoleBadgeColor(community.role)}>
                          {formatRole(community.role)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {community.city}, {community.state}
                          </span>
                        </div>
                        {community.memberCount && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{community.memberCount} members</span>
                          </div>
                        )}
                      </div>
                      
                      {community.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {community.description}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedCommunityId(community.id.toString());
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {(community.role === 'church_admin' || community.role === 'admin' || community.role === 'pastor' || community.role === 'lead-pastor' || community.role === 'elder') && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              window.location.href = `/admin?tab=community-admin&communityId=${community.id}`;
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Groups Section */}
          {userCommunities.filter(c => c.type === 'group').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Groups</h3>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {userCommunities.filter(c => c.type === 'group').length}
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userCommunities.filter(c => c.type === 'group').map((community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow border-2 border-green-200 dark:border-green-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {community.logoUrl ? (
                            <img 
                              src={community.logoUrl} 
                              alt={`${community.name} logo`}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                              <Building className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg leading-6 truncate">
                              {community.name}
                            </CardTitle>
                            <CardDescription>
                              {community.denomination}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getRoleBadgeColor(community.role)}>
                          {formatRole(community.role)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {community.city}, {community.state}
                          </span>
                        </div>
                        {community.memberCount && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{community.memberCount} members</span>
                          </div>
                        )}
                      </div>
                      
                      {community.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {community.description}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Link href={`/community-management/${community.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Calendar className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        {(community.role === 'church_admin' || community.role === 'admin' || community.role === 'pastor') && (
                          <Link href={`/admin?communityId=${community.id}`}>
                            <Button size="sm" variant="outline">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Ministries Section */}
          {userCommunities.filter(c => c.type === 'ministry').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ministries</h3>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {userCommunities.filter(c => c.type === 'ministry').length}
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userCommunities.filter(c => c.type === 'ministry').map((community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow border-2 border-purple-200 dark:border-purple-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {community.logoUrl ? (
                            <img 
                              src={community.logoUrl} 
                              alt={`${community.name} logo`}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                              <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg leading-6 truncate">
                              {community.name}
                            </CardTitle>
                            <CardDescription>
                              {community.denomination}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getRoleBadgeColor(community.role)}>
                          {formatRole(community.role)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {community.city}, {community.state}
                          </span>
                        </div>
                        {community.memberCount && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{community.memberCount} members</span>
                          </div>
                        )}
                      </div>
                      
                      {community.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {community.description}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedCommunityId(community.id.toString());
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {(community.role === 'church_admin' || community.role === 'admin' || community.role === 'pastor' || community.role === 'lead-pastor' || community.role === 'elder') && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              window.location.href = `/admin?tab=community-admin&communityId=${community.id}`;
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Community View Dialog */}
      {selectedCommunityId && (
        <CommunityViewDialog
          isOpen={viewDialogOpen}
          onClose={() => {
            setViewDialogOpen(false);
            setSelectedCommunityId(null);
          }}
          communityId={selectedCommunityId}
          userRole={userCommunities.find(c => c.id.toString() === selectedCommunityId)?.role}
        />
      )}
    </div>
  );
}