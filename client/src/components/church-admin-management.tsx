import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Users,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form schema for church editing
const churchFormSchema = z.object({
  name: z.string().min(1, 'Church name is required'),
  denomination: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  capacity: z.number().min(1).optional(),
});

type ChurchFormData = z.infer<typeof churchFormSchema>;

interface Church {
  id: number;
  name: string;
  denomination?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  capacity?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function ChurchAdminManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);

  // Fetch churches created by user
  const { data: churches = [], isLoading } = useQuery<Church[]>({
    queryKey: ['/api/users/created-churches'],
  });

  // Edit church mutation
  const editChurchMutation = useMutation({
    mutationFn: async ({ churchId, data }: { churchId: number; data: ChurchFormData }) => {
      return apiRequest('PUT', `/api/churches/${churchId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Church Updated",
        description: "Church information has been successfully updated.",
      });
      setEditDialogOpen(false);
      setSelectedChurch(null);
      queryClient.invalidateQueries({ queryKey: ['/api/users/created-churches'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update church",
        variant: "destructive",
      });
    },
  });

  // Delete church mutation
  const deleteChurchMutation = useMutation({
    mutationFn: async (churchId: number) => {
      return apiRequest('DELETE', `/api/churches/${churchId}`);
    },
    onSuccess: () => {
      toast({
        title: "Church Deleted",
        description: "Church has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setSelectedChurch(null);
      queryClient.invalidateQueries({ queryKey: ['/api/users/created-churches'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete church",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ChurchFormData>({
    resolver: zodResolver(churchFormSchema),
    defaultValues: {
      name: '',
      denomination: '',
      description: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      website: '',
      capacity: undefined,
    },
  });

  const openEditDialog = (church: Church) => {
    setSelectedChurch(church);
    form.reset({
      name: church.name,
      denomination: church.denomination || '',
      description: church.description || '',
      address: church.address || '',
      city: church.city || '',
      state: church.state || '',
      zipCode: church.zipCode || '',
      phone: church.phone || '',
      email: church.email || '',
      website: church.website || '',
      capacity: church.capacity || undefined,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (church: Church) => {
    setSelectedChurch(church);
    setDeleteDialogOpen(true);
  };

  const onSubmit = (data: ChurchFormData) => {
    if (!selectedChurch) return;
    
    // Convert capacity to number if provided
    const formData = {
      ...data,
      capacity: data.capacity ? Number(data.capacity) : undefined,
    };
    
    editChurchMutation.mutate({ 
      churchId: selectedChurch.id, 
      data: formData 
    });
  };

  const handleDelete = () => {
    if (!selectedChurch) return;
    deleteChurchMutation.mutate(selectedChurch.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Loading your churches...</div>
      </div>
    );
  }

  if (churches.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Churches Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            You haven't created any churches yet as a church admin.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Manage Your Churches
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Edit and manage the churches you've created as a church administrator.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {churches.map((church) => (
          <Card key={church.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span className="truncate">{church.name}</span>
                </div>
                <Badge variant={church.status === 'active' ? 'default' : 'secondary'}>
                  {church.status}
                </Badge>
              </CardTitle>
              {church.denomination && (
                <CardDescription>{church.denomination}</CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {church.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">
                      {church.address}
                      {church.city && `, ${church.city}`}
                      {church.state && `, ${church.state}`}
                    </span>
                  </div>
                )}
                
                {church.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{church.phone}</span>
                  </div>
                )}
                
                {church.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{church.email}</span>
                  </div>
                )}
                
                {church.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="truncate">{church.website}</span>
                  </div>
                )}
                
                {church.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Capacity: {church.capacity}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(church)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDeleteDialog(church)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Church</DialogTitle>
            <DialogDescription>
              Update your church information. Changes will be reflected immediately.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Church Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter church name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="denomination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Denomination</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select denomination" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="baptist">Baptist</SelectItem>
                          <SelectItem value="methodist">Methodist</SelectItem>
                          <SelectItem value="presbyterian">Presbyterian</SelectItem>
                          <SelectItem value="lutheran">Lutheran</SelectItem>
                          <SelectItem value="pentecostal">Pentecostal</SelectItem>
                          <SelectItem value="episcopal">Episcopal</SelectItem>
                          <SelectItem value="catholic">Catholic</SelectItem>
                          <SelectItem value="orthodox">Orthodox</SelectItem>
                          <SelectItem value="non-denominational">Non-denominational</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of your church..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="ZIP code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={editChurchMutation.isPending}
                >
                  {editChurchMutation.isPending ? 'Updating...' : 'Update Church'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Church
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedChurch?.name}"? This action cannot be undone.
              All associated data and member information will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteChurchMutation.isPending}
            >
              {deleteChurchMutation.isPending ? 'Deleting...' : 'Delete Church'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}