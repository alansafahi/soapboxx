import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, Edit, QrCode, Download, Eye, EyeOff, Plus, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

// QR Code form schema
const qrCodeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  maxUsesPerDay: z.number().min(0).optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
});

type QrCodeFormData = z.infer<typeof qrCodeSchema>;

interface QrCodeData {
  id: string;
  communityId: number;
  eventId?: number;
  name: string;
  description?: string;
  location: string;
  isActive: boolean;
  maxUsesPerDay?: number;
  validFrom?: string;
  validUntil?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function QrManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingQrCode, setEditingQrCode] = useState<QrCodeData | null>(null);
  const [viewingQrCode, setViewingQrCode] = useState<QrCodeData | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate QR code when viewingQrCode changes
  const generateQrCode = async (qrCodeId: string) => {
    try {
      const checkInUrl = `${window.location.origin}/check-in/${qrCodeId}`;
      const dataUrl = await QRCode.toDataURL(checkInUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code image",
        variant: "destructive",
      });
    }
  };

  // Handle viewing QR code
  const handleViewQrCode = (qrCode: QrCodeData) => {
    setViewingQrCode(qrCode);
    generateQrCode(qrCode.id);
  };

  // Download QR code
  const downloadQrCode = () => {
    if (!qrCodeDataUrl || !viewingQrCode) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${viewingQrCode.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  // Fetch QR codes
  const { data: qrCodes = [], isLoading, error } = useQuery({
    queryKey: ['/api/qr-codes'],
    queryFn: async () => {
      return await apiRequest('GET', '/api/qr-codes');
    },
  });



  // Create QR code form
  const createForm = useForm<QrCodeFormData>({
    resolver: zodResolver(qrCodeSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      maxUsesPerDay: undefined,
      validFrom: "",
      validUntil: "",
    },
  });

  // Edit QR code form
  const editForm = useForm<QrCodeFormData>({
    resolver: zodResolver(qrCodeSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      maxUsesPerDay: undefined,
      validFrom: "",
      validUntil: "",
    },
  });

  // Create QR code mutation
  const createMutation = useMutation({
    mutationFn: (data: QrCodeFormData) => {

      return apiRequest('POST', '/api/qr-codes', {
        ...data,
        maxUsesPerDay: data.maxUsesPerDay || null,
        validFrom: data.validFrom || null,
        validUntil: data.validUntil || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr-codes'] });
      setIsCreateDialogOpen(false);
      createForm.reset({
        name: "",
        description: "",
        location: "",
        maxUsesPerDay: undefined,
        validFrom: "",
        validUntil: "",
      });
      toast({
        title: "QR Code Created",
        description: "The QR code has been created successfully.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to create QR code";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Update QR code mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QrCodeFormData> & { isActive?: boolean } }) =>
      apiRequest('PUT', `/api/qr-codes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr-codes'] });
      setEditingQrCode(null);
      toast({
        title: "QR Code Updated",
        description: "The QR code has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update QR code",
        variant: "destructive",
      });
    },
  });

  // Delete QR code mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/qr-codes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr-codes'] });
      toast({
        title: "QR Code Deleted",
        description: "The QR code has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete QR code",
        variant: "destructive",
      });
    },
  });

  // Generate QR code image
  const generateQrCodeImage = async (qrCode: QrCodeData) => {
    try {
      const qrUrl = `${window.location.origin}/check-in/${qrCode.id}`;
      const dataUrl = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(dataUrl);
      setViewingQrCode(qrCode);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code image",
        variant: "destructive",
      });
    }
  };

  // Handle edit
  const handleEdit = (qrCode: QrCodeData) => {
    setEditingQrCode(qrCode);
    editForm.reset({
      name: qrCode.name,
      description: qrCode.description || "",
      location: qrCode.location,
      maxUsesPerDay: qrCode.maxUsesPerDay || undefined,
      validFrom: qrCode.validFrom ? new Date(qrCode.validFrom).toISOString().slice(0, 16) : "",
      validUntil: qrCode.validUntil ? new Date(qrCode.validUntil).toISOString().slice(0, 16) : "",
    });
  };

  // Toggle active status
  const toggleActive = (qrCode: QrCodeData) => {
    updateMutation.mutate({
      id: qrCode.id,
      data: { isActive: !qrCode.isActive }
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">QR Code Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create and manage QR codes for physical check-in locations
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create QR Code
        </Button>
      </div>

      {/* QR Codes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {qrCodes.map((qrCode: QrCodeData) => (
          <Card key={qrCode.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{qrCode.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {qrCode.location}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={qrCode.isActive}
                    onCheckedChange={() => toggleActive(qrCode)}
                    className="data-[state=checked]:bg-green-600"
                  />
                  {qrCode.isActive ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {qrCode.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {qrCode.description}
                </p>
              )}
              
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                {qrCode.maxUsesPerDay && (
                  <div>Max uses per day: {qrCode.maxUsesPerDay}</div>
                )}
                {qrCode.validFrom && (
                  <div>Valid from: {new Date(qrCode.validFrom).toLocaleDateString()}</div>
                )}
                {qrCode.validUntil && (
                  <div>Valid until: {new Date(qrCode.validUntil).toLocaleDateString()}</div>
                )}
                <div>Created: {new Date(qrCode.createdAt).toLocaleDateString()}</div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateQrCodeImage(qrCode)}
                  className="flex-1"
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  View QR
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(qrCode)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Delete QR code confirmation handled by UI
                    if (true) {
                      deleteMutation.mutate(qrCode.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {qrCodes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No QR codes yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first QR code for physical check-in locations
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create QR Code
            </Button>
          </div>
        )}


      </div>

      {/* Create QR Code Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create QR Code</DialogTitle>
            <DialogDescription>
              Create a new QR code for a physical check-in location
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Main Sanctuary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="Building A, Room 101" {...field} />
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description of this check-in location..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="maxUsesPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Uses Per Day (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="Leave empty for unlimited"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid From (Optional) - Leave empty for no restriction</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field}
                          value={field.value || ""}
                          onFocus={(e) => {
                            if (!field.value) {
                              // Set to today at 9:00 AM when focused (avoid timezone issues)
                              const today = new Date();
                              const year = today.getFullYear();
                              const month = String(today.getMonth() + 1).padStart(2, '0');
                              const day = String(today.getDate()).padStart(2, '0');
                              const dateString = `${year}-${month}-${day}T09:00`;
                              field.onChange(dateString);
                            }
                          }}
                          className="flex-1"
                        />
                      </FormControl>
                      {field.value && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => field.onChange("")}
                          className="px-2"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until (Optional) - Leave empty for no expiration</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field}
                          value={field.value || ""}
                          onFocus={(e) => {
                            if (!field.value) {
                              // Set to today at 10:00 AM when focused (avoid timezone issues)
                              const today = new Date();
                              const year = today.getFullYear();
                              const month = String(today.getMonth() + 1).padStart(2, '0');
                              const day = String(today.getDate()).padStart(2, '0');
                              const dateString = `${year}-${month}-${day}T10:00`;
                              field.onChange(dateString);
                            }
                          }}
                          className="flex-1"
                        />
                      </FormControl>
                      {field.value && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => field.onChange("")}
                          className="px-2"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="flex-1">
                  {createMutation.isPending ? "Creating..." : "Create QR Code"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit QR Code Dialog */}
      <Dialog open={!!editingQrCode} onOpenChange={() => setEditingQrCode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit QR Code</DialogTitle>
            <DialogDescription>
              Update the QR code settings
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => {
              if (editingQrCode) {
                updateMutation.mutate({ id: editingQrCode.id, data });
              }
            })} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="maxUsesPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Uses Per Day (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid From (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingQrCode(null)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} className="flex-1">
                  {updateMutation.isPending ? "Updating..." : "Update QR Code"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View QR Code Dialog */}
      <Dialog open={!!viewingQrCode} onOpenChange={() => setViewingQrCode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{viewingQrCode?.name}</DialogTitle>
            <DialogDescription>
              {viewingQrCode?.location}
            </DialogDescription>
          </DialogHeader>

          <div className="text-center space-y-4">
            {qrCodeDataUrl && (
              <img src={qrCodeDataUrl} alt="QR Code" className="mx-auto border rounded-lg" />
            )}
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Scan this QR code to check in at this location
            </p>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setViewingQrCode(null)}
                className="flex-1"
              >
                Close
              </Button>
              <Button 
                onClick={downloadQrCode}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}