import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  UserPlus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Star, 
  Award, 
  TrendingUp,
  Settings,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  Gift,
  Target,
  BarChart3
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { motion } from "framer-motion";

// Safe date formatting utility
const formatSafeDate = (dateString: string | null | undefined, formatStr: string = "MMM dd, yyyy"): string => {
  if (!dateString) return "Date TBD";
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return "Invalid Date";
    return format(date, formatStr);
  } catch (error) {
    return "Invalid Date";
  }
};
import { useToast } from "@/hooks/use-toast";

interface Volunteer {
  id: number;
  userId: string;
  churchId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  skills: string[];
  interests: string[];
  status: string;
  joinedAt: string;
  totalHours: number;
  backgroundCheck: boolean;
  orientation: boolean;
}

interface VolunteerRole {
  id: number;
  name: string;
  description: string;
  requiredSkills: string[];
  department: string;
  isActive: boolean;
}

interface VolunteerOpportunity {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  volunteersNeeded: number;
  volunteersRegistered: number;
  status: string;
  priority: string;
  roleId: number;
  roleName?: string;
}

interface VolunteerHours {
  id: number;
  volunteerId: number;
  volunteerName: string;
  date: string;
  hoursServed: number;
  description: string;
  status: string;
}

export default function VolunteerManagementSystem() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddVolunteer, setShowAddVolunteer] = useState(false);
  const [showAddOpportunity, setShowAddOpportunity] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch volunteers
  const { data: volunteers = [], isLoading: loadingVolunteers } = useQuery({
    queryKey: ["/api/volunteers"],
    enabled: true,
  });

  // Fetch volunteer roles
  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["/api/volunteer-roles"],
    enabled: true,
  });

  // Fetch volunteer opportunities
  const { data: opportunities = [], isLoading: loadingOpportunities } = useQuery({
    queryKey: ["/api/volunteer-opportunities"],
    enabled: true,
  });

  // Fetch volunteer hours
  const { data: volunteerHours = [], isLoading: loadingHours } = useQuery({
    queryKey: ["/api/volunteer-hours"],
    enabled: true,
  });

  // Fetch volunteer stats
  const { data: stats = {} } = useQuery({
    queryKey: ["/api/volunteer-stats"],
    enabled: true,
  });

  // Create volunteer mutation
  const createVolunteerMutation = useMutation({
    mutationFn: async (volunteerData: Omit<Volunteer, 'id' | 'joinedAt' | 'totalHours'>) => {
      return await apiRequest("/api/volunteers", {
        method: "POST",
        body: volunteerData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      setShowAddVolunteer(false);
      toast({
        title: "Success",
        description: "Volunteer added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add volunteer",
        variant: "destructive",
      });
    },
  });

  // Create opportunity mutation
  const createOpportunityMutation = useMutation({
    mutationFn: async (opportunityData: Omit<VolunteerOpportunity, 'id' | 'volunteersRegistered'>) => {
      return await apiRequest("/api/volunteer-opportunities", {
        method: "POST",
        body: opportunityData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteer-opportunities"] });
      setShowAddOpportunity(false);
      toast({
        title: "Success",
        description: "Volunteer opportunity created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create opportunity",
        variant: "destructive",
      });
    },
  });

  // Register for opportunity mutation
  const registerMutation = useMutation({
    mutationFn: async ({ opportunityId, volunteerId }: { opportunityId: number; volunteerId: number }) => {
      return await apiRequest("/api/volunteer-registrations", {
        method: "POST",
        body: { opportunityId, volunteerId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteer-opportunities"] });
      toast({
        title: "Success",
        description: "Volunteer registered successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register volunteer",
        variant: "destructive",
      });
    },
  });

  // Filter volunteers based on search and status
  const filteredVolunteers = volunteers.filter((volunteer: Volunteer) => {
    const matchesSearch = `${volunteer.firstName} ${volunteer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || volunteer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const DashboardOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Volunteers</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalVolunteers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Opportunities</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeOpportunities || 0}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hours This Month</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.hoursThisMonth || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.completionRate || 0}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Volunteer Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {volunteers.slice(0, 5).map((volunteer: Volunteer) => (
                <div key={volunteer.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{volunteer.firstName} {volunteer.lastName}</p>
                      <p className="text-sm text-gray-500">{volunteer.email}</p>
                    </div>
                  </div>
                  <Badge variant={volunteer.status === "active" ? "default" : "secondary"}>
                    {volunteer.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opportunities.slice(0, 5).map((opportunity: VolunteerOpportunity) => (
                <div key={opportunity.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CalendarIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{opportunity.title}</p>
                      <p className="text-sm text-gray-500">
                        {formatSafeDate(opportunity.startDate)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    opportunity.priority === "high" ? "destructive" :
                    opportunity.priority === "medium" ? "default" : "secondary"
                  }>
                    {opportunity.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const VolunteersTab = () => (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search volunteers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showAddVolunteer} onOpenChange={setShowAddVolunteer}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Volunteer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Volunteer</DialogTitle>
              </DialogHeader>
              <AddVolunteerForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Volunteers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVolunteers.map((volunteer: Volunteer) => (
                <TableRow key={volunteer.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{volunteer.firstName} {volunteer.lastName}</p>
                      <p className="text-sm text-gray-500">
                        Joined {format(new Date(volunteer.joinedAt), "MMM yyyy")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{volunteer.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {volunteer.skills?.slice(0, 2).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {volunteer.skills?.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{volunteer.skills.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {volunteer.totalHours || 0}h
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      volunteer.status === "active" ? "default" :
                      volunteer.status === "inactive" ? "secondary" : "outline"
                    }>
                      {volunteer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedVolunteer(volunteer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const AddVolunteerForm = () => {
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      skills: [],
      interests: [],
      address: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createVolunteerMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setShowAddVolunteer(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createVolunteerMutation.isPending}>
            {createVolunteerMutation.isPending ? "Adding..." : "Add Volunteer"}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Volunteer Management</h1>
          <p className="text-gray-600 mt-2">Manage volunteers, opportunities, and track service hours</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardOverview />
        </TabsContent>

        <TabsContent value="volunteers">
          <VolunteersTab />
        </TabsContent>

        <TabsContent value="opportunities">
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Volunteer Opportunities</h3>
            <p className="text-gray-500">Manage volunteer opportunities and scheduling</p>
          </div>
        </TabsContent>

        <TabsContent value="hours">
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Hour Tracking</h3>
            <p className="text-gray-500">Track and verify volunteer service hours</p>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Reports & Analytics</h3>
            <p className="text-gray-500">View volunteer engagement and impact reports</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}