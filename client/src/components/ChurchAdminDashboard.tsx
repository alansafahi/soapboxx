import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  UserCheck, 
  DollarSign, 
  Building, 
  TrendingUp, 
  Send, 
  ChevronRight,
  BarChart3,
  PieChart,
  Settings,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  Search,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Clock,
  Target,
  Award,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MemberAnalytics {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  averageEngagement: number;
  attendanceRate: number;
  volunteerParticipation: number;
  donationParticipation: number;
  eventParticipation: number;
}

interface CommunicationCampaign {
  id: number;
  name: string;
  type: string;
  status: string;
  totalRecipients: number;
  deliveredCount: number;
  openedCount: number;
  clickCount: number;
  scheduledFor: string;
  createdAt: string;
}

interface VolunteerRole {
  id: number;
  name: string;
  department: string;
  currentVolunteers: number;
  maximumVolunteers: number;
  hoursPerWeek: number;
  isActive: boolean;
}

interface DonationSummary {
  totalAmount: number;
  totalDonations: number;
  uniqueDonors: number;
  averageDonation: number;
  monthlyGrowth: number;
  goalProgress: number;
}

interface Campus {
  id: number;
  name: string;
  campusCode: string;
  memberCount: number;
  staffCount: number;
  capacity: number;
  isActive: boolean;
  isPrimary: boolean;
}

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  type: z.enum(["email", "sms", "push", "announcement", "newsletter"]),
  subject: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  targetAudience: z.object({
    type: z.enum(["all", "members", "leaders", "group", "location", "age_group"]),
    filters: z.object({}).optional()
  }),
  scheduledFor: z.string().optional()
});

const volunteerRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  department: z.string().min(1, "Department is required"),
  description: z.string().optional(),
  hoursPerWeek: z.number().min(0),
  maximumVolunteers: z.number().min(1),
  requirements: z.array(z.string()).optional(),
  minimumAge: z.number().min(16).default(16)
});

const donationCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  goalAmount: z.number().min(0).optional(),
  taxDeductible: z.boolean().default(true),
  code: z.string().optional()
});

const campusSchema = z.object({
  name: z.string().min(1, "Campus name is required"),
  campusCode: z.string().min(1, "Campus code is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  capacity: z.number().min(1).optional()
});

export default function ChurchAdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery<MemberAnalytics>({
    queryKey: ["/api/admin/analytics"],
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery<CommunicationCampaign[]>({
    queryKey: ["/api/admin/campaigns"],
  });

  const { data: volunteerRoles, isLoading: volunteerRolesLoading } = useQuery<VolunteerRole[]>({
    queryKey: ["/api/admin/volunteer-roles"],
  });

  const { data: donationSummary, isLoading: donationLoading } = useQuery<DonationSummary>({
    queryKey: ["/api/admin/donations/summary"],
  });

  const { data: campuses, isLoading: campusesLoading } = useQuery<Campus[]>({
    queryKey: ["/api/admin/campuses"],
  });

  // Mutations
  const createCampaignMutation = useMutation({
    mutationFn: (data: z.infer<typeof campaignSchema>) => 
      apiRequest("/api/admin/campaigns", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      toast({ title: "Campaign created successfully" });
    }
  });

  const createVolunteerRoleMutation = useMutation({
    mutationFn: (data: z.infer<typeof volunteerRoleSchema>) => 
      apiRequest("/api/admin/volunteer-roles", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/volunteer-roles"] });
      toast({ title: "Volunteer role created successfully" });
    }
  });

  const createCampusMutation = useMutation({
    mutationFn: (data: z.infer<typeof campusSchema>) => 
      apiRequest("/api/admin/campuses", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campuses"] });
      toast({ title: "Campus created successfully" });
    }
  });

  const OverviewTab = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.totalMembers || 0}</div>
          <p className="text-xs text-muted-foreground">
            +{analytics?.newMembersThisMonth || 0} this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Members</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.activeMembers || 0}</div>
          <p className="text-xs text-muted-foreground">
            {analytics?.averageEngagement || 0}% engagement rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${donationSummary?.totalAmount?.toLocaleString() || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            +{donationSummary?.monthlyGrowth || 0}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {volunteerRoles?.reduce((sum, role) => sum + role.currentVolunteers, 0) || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {analytics?.volunteerParticipation || 0}% participation
          </p>
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Member Engagement Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Attendance Rate</Label>
              <Progress value={analytics?.attendanceRate || 0} className="mt-2" />
              <p className="text-sm text-muted-foreground mt-1">
                {analytics?.attendanceRate || 0}%
              </p>
            </div>
            <div>
              <Label>Event Participation</Label>
              <Progress value={analytics?.eventParticipation || 0} className="mt-2" />
              <p className="text-sm text-muted-foreground mt-1">
                {analytics?.eventParticipation || 0}%
              </p>
            </div>
            <div>
              <Label>Donation Participation</Label>
              <Progress value={analytics?.donationParticipation || 0} className="mt-2" />
              <p className="text-sm text-muted-foreground mt-1">
                {analytics?.donationParticipation || 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const CommunicationsTab = () => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const form = useForm<z.infer<typeof campaignSchema>>({
      resolver: zodResolver(campaignSchema),
      defaultValues: {
        type: "email",
        targetAudience: { type: "all" }
      }
    });

    const onSubmit = (data: z.infer<typeof campaignSchema>) => {
      createCampaignMutation.mutate(data);
      setIsCreateDialogOpen(false);
      form.reset();
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Communication Campaigns</h3>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Communication Campaign</DialogTitle>
                <DialogDescription>
                  Create a new communication campaign to reach your members
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter campaign name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select campaign type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="push">Push Notification</SelectItem>
                            <SelectItem value="announcement">Announcement</SelectItem>
                            <SelectItem value="newsletter">Newsletter</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter subject line" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter campaign content" 
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetAudience.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select target audience" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Members</SelectItem>
                            <SelectItem value="members">Active Members</SelectItem>
                            <SelectItem value="leaders">Church Leaders</SelectItem>
                            <SelectItem value="group">Specific Group</SelectItem>
                            <SelectItem value="location">By Location</SelectItem>
                            <SelectItem value="age_group">Age Group</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createCampaignMutation.isPending}>
                      {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {campaigns?.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
                    {campaign.status}
                  </Badge>
                </div>
                <CardDescription>
                  {campaign.type} • {campaign.totalRecipients} recipients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Delivered</p>
                    <p className="font-medium">{campaign.deliveredCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Opened</p>
                    <p className="font-medium">{campaign.openedCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Clicked</p>
                    <p className="font-medium">{campaign.clickCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const VolunteersTab = () => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const form = useForm<z.infer<typeof volunteerRoleSchema>>({
      resolver: zodResolver(volunteerRoleSchema),
      defaultValues: {
        minimumAge: 16,
        hoursPerWeek: 2,
        maximumVolunteers: 10
      }
    });

    const onSubmit = (data: z.infer<typeof volunteerRoleSchema>) => {
      createVolunteerRoleMutation.mutate(data);
      setIsCreateDialogOpen(false);
      form.reset();
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Volunteer Management</h3>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Volunteer Role</DialogTitle>
                <DialogDescription>
                  Create a new volunteer role for your church
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Greeter, Usher, Tech Support" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Worship, Children, Tech" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the role responsibilities" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hoursPerWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hours per Week</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maximumVolunteers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Volunteers</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="10" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createVolunteerRoleMutation.isPending}>
                      {createVolunteerRoleMutation.isPending ? "Creating..." : "Create Role"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {volunteerRoles?.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <CardTitle className="text-lg">{role.name}</CardTitle>
                <CardDescription>{role.department}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Volunteers</span>
                    <span>{role.currentVolunteers}/{role.maximumVolunteers}</span>
                  </div>
                  <Progress 
                    value={(role.currentVolunteers / role.maximumVolunteers) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{role.hoursPerWeek}h/week</span>
                    <Badge variant={role.isActive ? "default" : "secondary"}>
                      {role.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const DonationsTab = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${donationSummary?.totalAmount?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {donationSummary?.totalDonations || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unique Donors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {donationSummary?.uniqueDonors || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${donationSummary?.averageDonation?.toFixed(2) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Donation Goal Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={donationSummary?.goalProgress || 0} className="h-4" />
          <p className="text-sm text-muted-foreground mt-2">
            {donationSummary?.goalProgress || 0}% of annual goal reached
          </p>
        </CardContent>
      </Card>

      <div className="flex space-x-2">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
        <Button variant="outline">
          <BarChart3 className="w-4 h-4 mr-2" />
          View Analytics
        </Button>
      </div>
    </div>
  );

  const CampusesTab = () => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const form = useForm<z.infer<typeof campusSchema>>({
      resolver: zodResolver(campusSchema)
    });

    const onSubmit = (data: z.infer<typeof campusSchema>) => {
      createCampusMutation.mutate(data);
      setIsCreateDialogOpen(false);
      form.reset();
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Campus Management</h3>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Campus
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Campus</DialogTitle>
                <DialogDescription>
                  Add a new campus location for your church
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campus Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Main Campus, East Campus" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="campusCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campus Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., MAIN, EAST, WEST" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Campus address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Maximum capacity" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createCampusMutation.isPending}>
                      {createCampusMutation.isPending ? "Creating..." : "Create Campus"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campuses?.map((campus) => (
            <Card key={campus.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{campus.name}</CardTitle>
                  <div className="flex space-x-1">
                    {campus.isPrimary && (
                      <Badge variant="default">Primary</Badge>
                    )}
                    <Badge variant={campus.isActive ? "default" : "secondary"}>
                      {campus.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{campus.campusCode}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Members</span>
                    <span>{campus.memberCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Staff</span>
                    <span>{campus.staffCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity</span>
                    <span>{campus.capacity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Church Administration</h1>
        <p className="text-muted-foreground">
          Manage your church with comprehensive analytics, communications, and member tools
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="campuses">Campuses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="communications" className="mt-6">
          <CommunicationsTab />
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Enhanced Event Management</h3>
            <p className="text-muted-foreground">
              Advanced event management with RSVP tracking, capacity management, and recurring events coming soon.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="volunteers" className="mt-6">
          <VolunteersTab />
        </TabsContent>

        <TabsContent value="donations" className="mt-6">
          <DonationsTab />
        </TabsContent>

        <TabsContent value="campuses" className="mt-6">
          <CampusesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}