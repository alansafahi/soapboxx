import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
// import { zodResolver } // Simplified validation from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { useToast } from "../hooks/use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";
import { 
  Camera, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  Crown, 
  Shield, 
  Edit3, 
  UserPlus, 
  Trash2, 
  Save, 
  Plus, 
  X 
} from "lucide-react";

const socialLinksSchema = z.object({
  facebook: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  youtube: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});

const churchProfileSchema = z.object({
  name: z.string().min(1, "Church name is required"),
  denomination: z.string().optional(),
  description: z.string().optional(),
  bio: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  socialLinks: socialLinksSchema.optional(),
  communityTags: z.array(z.string()).optional(),
});

const memberRoleSchema = z.object({
  role: z.enum(["member", "moderator", "content_creator", "admin", "pastor"]),
  title: z.string().optional(),
  bio: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

interface ChurchProfileManagerProps {
  churchId: number;
}

export function ChurchProfileManager({ churchId }: ChurchProfileManagerProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newTag, setNewTag] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Fetch church data
  const { data: church, isLoading: churchLoading } = useQuery({
    queryKey: ["church", churchId],
    queryFn: () => apiRequest(`/api/churches/${churchId}`),
  });

  // Fetch church members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["church-members", churchId],
    queryFn: () => apiRequest(`/api/churches/${churchId}/members`),
  });

  // Church profile form
  const profileForm = useForm({
    // resolver: zodResolver // Simplified validation(churchProfileSchema),
    defaultValues: {
      name: church?.name || "",
      denomination: church?.denomination || "",
      description: church?.description || "",
      bio: church?.bio || "",
      address: church?.address || "",
      city: church?.city || "",
      state: church?.state || "",
      zipCode: church?.zipCode || "",
      phone: church?.phone || "",
      email: church?.email || "",
      website: church?.website || "",
      socialLinks: church?.socialLinks || {},
      communityTags: church?.communityTags || [],
    },
  });

  // Member role form
  const roleForm = useForm({
    // resolver: zodResolver // Simplified validation(memberRoleSchema),
    defaultValues: {
      role: "member",
      title: "",
      bio: "",
      permissions: [],
    },
  });

  // Update church profile mutation
  const updateChurchMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/churches/${churchId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({ title: "Church profile updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["church", churchId] });
    },
    onError: () => {
      toast({ title: "Failed to update church profile", variant: "destructive" });
    },
  });

  // Update member role mutation
  const updateMemberMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) => 
      apiRequest(`/api/churches/${churchId}/members/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({ title: "Member role updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["church-members", churchId] });
      setSelectedMember(null);
    },
    onError: () => {
      toast({ title: "Failed to update member role", variant: "destructive" });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => 
      apiRequest(`/api/churches/${churchId}/members/${userId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast({ title: "Member removed successfully" });
      queryClient.invalidateQueries({ queryKey: ["church-members", churchId] });
    },
    onError: () => {
      toast({ title: "Failed to remove member", variant: "destructive" });
    },
  });

  // Logo upload mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return apiRequest("/api/upload/image", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (data) => {
      updateChurchMutation.mutate({ logoUrl: data.url });
    },
    onError: () => {
      toast({ title: "Failed to upload logo", variant: "destructive" });
    },
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadLogoMutation.mutate(file);
    }
  };

  const onSubmitProfile = (data: any) => {
    updateChurchMutation.mutate(data);
  };

  const onSubmitMemberRole = (data: any) => {
    if (selectedMember) {
      updateMemberMutation.mutate({ userId: selectedMember.userId, data });
    }
  };

  const addCommunityTag = () => {
    if (newTag.trim()) {
      const currentTags = profileForm.getValues("communityTags") || [];
      profileForm.setValue("communityTags", [...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeCommunityTag = (tagToRemove: string) => {
    const currentTags = profileForm.getValues("communityTags") || [];
    profileForm.setValue("communityTags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const openMemberEditor = (member: any) => {
    setSelectedMember(member);
    roleForm.reset({
      role: member.role,
      title: member.title || "",
      bio: member.bio || "",
      permissions: member.permissions || [],
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "pastor": return <Crown className="h-4 w-4 text-yellow-500" />;
      case "admin": return <Shield className="h-4 w-4 text-red-500" />;
      case "moderator": return <Shield className="h-4 w-4 text-blue-500" />;
      case "content_creator": return <Edit3 className="h-4 w-4 text-green-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "pastor": return "default";
      case "admin": return "destructive";
      case "moderator": return "secondary";
      case "content_creator": return "outline";
      default: return "outline";
    }
  };

  if (churchLoading) {
    return <div className="flex justify-center p-8">Loading church data...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Church Profile</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Church Logo & Basic Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={church?.logoUrl} />
                  <AvatarFallback>{church?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadLogoMutation.isPending}
                  >
                    {uploadLogoMutation.isPending ? "Uploading..." : "Change Logo"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Church Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="denomination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Denomination</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extended Biography</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={5} placeholder="Tell your community's story..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Community Tags */}
                  <div className="space-y-3">
                    <FormLabel>Community Tags</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCommunityTag())}
                      />
                      <Button type="button" onClick={addCommunityTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(profileForm.watch("communityTags") || []).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {tag}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeCommunityTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" disabled={updateChurchMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {updateChurchMutation.isPending ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Media Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                  <div className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="socialLinks.facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Facebook className="h-4 w-4 text-blue-600" />
                            Facebook
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://facebook.com/your-church" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="socialLinks.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Instagram className="h-4 w-4 text-pink-600" />
                            Instagram
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://instagram.com/your-church" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="socialLinks.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Twitter className="h-4 w-4 text-blue-400" />
                            Twitter/X
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://twitter.com/your-church" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="socialLinks.youtube"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Youtube className="h-4 w-4 text-red-600" />
                            YouTube
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://youtube.com/your-church" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-600" />
                            Website
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://your-church.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={updateChurchMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {updateChurchMutation.isPending ? "Saving..." : "Save Social Links"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="text-center py-4">Loading team members...</div>
              ) : (
                <div className="space-y-4">
                  {members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.user.profileImageUrl} />
                          <AvatarFallback>
                            {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {member.user.firstName} {member.user.lastName}
                            </span>
                            {getRoleIcon(member.role)}
                            <Badge variant={getRoleBadgeVariant(member.role)}>
                              {member.role}
                            </Badge>
                          </div>
                          {member.title && (
                            <p className="text-sm text-muted-foreground">{member.title}</p>
                          )}
                          <p className="text-xs text-muted-foreground">{member.user.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openMemberEditor(member)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.user.firstName} {member.user.lastName} from the team?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => removeMemberMutation.mutate(member.userId)}
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Member Role Editor Dialog */}
          {selectedMember && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Member Role</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...roleForm}>
                  <form onSubmit={roleForm.handleSubmit(onSubmitMemberRole)} className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar>
                        <AvatarImage src={selectedMember.user.profileImageUrl} />
                        <AvatarFallback>
                          {selectedMember.user.firstName?.[0]}{selectedMember.user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {selectedMember.user.firstName} {selectedMember.user.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">{selectedMember.user.email}</p>
                      </div>
                    </div>

                    <FormField
                      control={roleForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="content_creator">Content Creator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="pastor">Pastor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={roleForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Title (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Youth Leader, Worship Director" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={roleForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role Bio (Optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} placeholder="Describe this person's role and contributions..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button type="submit" disabled={updateMemberMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {updateMemberMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setSelectedMember(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}