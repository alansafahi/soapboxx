import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { 
  Users, User, Building, BookOpen, Heart, Calendar, Search, 
  UserPlus, AlertCircle, Phone, Mail, MapPin 
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

interface SimpleMemberDirectoryProps {
  selectedChurch?: number | null;
}

export function SimpleMemberDirectory({ selectedChurch }: SimpleMemberDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [churchFilter, setChurchFilter] = useState("all");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [showActivityHistory, setShowActivityHistory] = useState(false);
  const [editingMemberData, setEditingMemberData] = useState<any>({});
  const [newMember, setNewMember] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    interests: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize editing data when editing starts
  const handleEditProfile = (member: any) => {
    setEditingMemberData({
      id: member.id,
      fullName: member.fullName || '',
      email: member.email || '',
      phoneNumber: member.phoneNumber || '',
      address: member.address || '',
      interests: member.interests || '',
      membershipStatus: member.membershipStatus || 'active'
    });
    setIsEditingMember(true);
  };

  // Save edited member profile
  const handleSaveProfile = async () => {
    setIsActionLoading(true);
    try {
      const response = await fetch('/api/members/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMemberData)
      });

      if (response.ok) {
        toast({ title: "Success", description: "Member profile updated successfully" });
        queryClient.invalidateQueries({ queryKey: ['/api/members'] });
        setIsEditingMember(false);
        setSelectedMember(null);
      } else {
        toast({ title: "Error", description: "Failed to update profile" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error occurred" });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Member management actions
  const handleSendMessage = async (member: any) => {
    setIsActionLoading(true);
    try {
      const response = await fetch('/api/members/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          memberId: member.id,
          message: `Hello ${member.fullName}, this is a message from church leadership.`
        })
      });
      
      if (response.ok) {
        toast({
          title: "Message Sent",
          description: `Message sent to ${member.fullName}`,
        });
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          toast({
            title: "Just Need Permission",
            description: "Only church leaders can send messages to members. Contact your pastor if you need this access.",
            variant: "default",
          });
        } else {
          throw new Error(errorData.message || 'Failed to send message');
        }
      }
    } catch (error) {
      toast({
        title: "Message Not Sent",
        description: "Something went wrong. Please try again in a moment.",
        variant: "default",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStatusChange = async (member: any, newStatus: string) => {
    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/members/${member.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/members'] });
        setSelectedMember({ ...member, membershipStatus: newStatus });
        toast({
          title: "Status Updated",
          description: `${member.fullName}'s status changed to ${newStatus}`,
        });
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          toast({
            title: "Leadership Access Needed",
            description: "This feature is available for pastors and church leaders. Contact your pastor for assistance.",
            variant: "default",
          });
        } else {
          throw new Error(errorData.message || 'Failed to update status');
        }
      }
    } catch (error) {
      toast({
        title: "Status Not Updated",
        description: "Something went wrong. Please try again in a moment.",
        variant: "default",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSuspendMember = async (member: any) => {
    // Suspend member confirmation handled by UI
    
    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/members/${member.id}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: true })
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/members'] });
        setSelectedMember(null);
        toast({
          title: "Member Suspended",
          description: `${member.fullName} has been suspended`,
        });
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          toast({
            title: "Leadership Access Required",
            description: "This action is restricted to pastors and church leaders for member safety.",
            variant: "default",
          });
        } else {
          throw new Error(errorData.message || 'Failed to suspend member');
        }
      }
    } catch (error) {
      toast({
        title: "Action Not Completed",
        description: "Something went wrong. Please try again in a moment.",
        variant: "default",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRemoveMember = async (member: any) => {
    // Remove member confirmation handled by UI
    
    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/members/${member.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/members'] });
        setSelectedMember(null);
        toast({
          title: "Member Removed",
          description: `${member.fullName} has been removed from the church`,
        });
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          toast({
            title: "Permission Required",
            description: "You need church leadership permissions to remove members.",
            variant: "destructive",
          });
        } else {
          throw new Error(errorData.message || 'Failed to remove member');
        }
      }
    } catch (error) {
      toast({
        title: "Unable to Remove Member",
        description: "Please check your permissions or try again later.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: async (memberData: typeof newMember) => {
      return await apiRequest("/api/members", {
        method: "POST",
        body: memberData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      setIsAddMemberOpen(false);
      setNewMember({
        fullName: "",
        email: "",
        phoneNumber: "",
        address: "",
        interests: ""
      });
      toast({
        title: "Member Added",
        description: "New member has been successfully added to the directory."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add member. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAddMember = () => {
    if (!newMember.fullName || !newMember.email) {
      toast({
        title: "Validation Error",
        description: "Full name and email are required fields.",
        variant: "destructive"
      });
      return;
    }
    addMemberMutation.mutate(newMember);
  };

  // Fetch churches
  const { data: churches = [] } = useQuery({
    queryKey: ["/api/churches"],
    queryFn: async () => {
      const response = await fetch("/api/churches");
      return response.json();
    },
  });

  // Fetch members
  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ["/api/members", churchFilter],
    queryFn: async () => {
      const url = churchFilter === "all" 
        ? "/api/members" 
        : `/api/members?churchId=${churchFilter}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.statusText}`);
      }
      return response.json();
    },
  });

  // Filter members based on search and status
  const filteredMembers = members.filter((member: any) => {
    const matchesSearch = member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.membershipStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Error loading members</p>
        </div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Member Directory</h3>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{filteredMembers.length} members</Badge>
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={newMember.fullName}
                    onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={newMember.phoneNumber}
                    onChange={(e) => setNewMember({ ...newMember, phoneNumber: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newMember.address}
                    onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interests">Interests & Ministries</Label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {[
                        "Youth Ministry", "Children's Ministry", "Worship Team", "Prayer Ministry",
                        "Missions", "Community Outreach", "Bible Study", "Teaching",
                        "Music & Arts", "Administrative", "Hospitality", "Small Groups",
                        "Discipleship", "Evangelism", "Counseling", "Media & Technology"
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            const current = newMember.interests;
                            const newValue = current ? `${current}, ${suggestion}` : suggestion;
                            setNewMember({ ...newMember, interests: newValue });
                          }}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                    <Textarea
                      id="interests"
                      value={newMember.interests}
                      onChange={(e) => setNewMember({ ...newMember, interests: e.target.value })}
                      placeholder="Select from suggestions above or enter custom interests, ministries, or areas of service"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsAddMemberOpen(false)}
                  disabled={addMemberMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMember}
                  disabled={addMemberMutation.isPending}
                >
                  {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={churchFilter} onValueChange={setChurchFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by church" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Churches</SelectItem>
            {churches.map((church: any) => (
              <SelectItem key={church.id} value={church.id.toString()}>
                {church.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="visitor">Visitors</SelectItem>
            <SelectItem value="new_member">New Members</SelectItem>
            <SelectItem value="active">Active Members</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Members Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== "all" 
              ? "No members match your current filters." 
              : "No members found for the selected church."
            }
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Church Filter: {churchFilter}</p>
            <p>Total members available: {members.length}</p>
            <p>Search term: "{searchTerm}"</p>
            <p>Status filter: {statusFilter}</p>
          </div>
        </div>
      )}

      {/* Member Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member: any) => (
          <Card key={member.id} className="hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group" onClick={() => setSelectedMember(member)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{member.fullName}</h4>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={member.membershipStatus === 'active' ? 'default' : 'secondary'}
                    className={
                      member.membershipStatus === 'active' ? 'bg-green-100 text-green-800' :
                    member.membershipStatus === 'new_member' ? 'bg-blue-100 text-blue-800' :
                    member.membershipStatus === 'visitor' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }
                  >
                    {member.membershipStatus}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {member.churchAffiliation && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{member.churchAffiliation}</span>
                </div>
              )}
              {member.phoneNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.phoneNumber}</span>
                </div>
              )}
              {member.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{member.address}</span>
                </div>
              )}
              {member.denomination && (
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{member.denomination}</span>
                </div>
              )}
              {member.interests && (
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{member.interests}</span>
                </div>
              )}
              {member.joinedDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(member.joinedDate).toLocaleDateString()}</span>
                </div>
              )}
              {member.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  {member.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Member Management Modal */}
      {selectedMember && (
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Manage Member: {selectedMember.fullName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Member Info Summary */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedMember.fullName}</h3>
                  <p className="text-gray-600">{selectedMember.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={selectedMember.membershipStatus === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {selectedMember.membershipStatus}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Joined {selectedMember.joinedDate ? new Date(selectedMember.joinedDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-12" 
                  onClick={() => handleSendMessage(selectedMember)}
                  disabled={isActionLoading}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => window.open(`tel:${selectedMember.phoneNumber}`, '_self')}
                  disabled={!selectedMember.phoneNumber}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Member
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => handleEditProfile(selectedMember)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => setShowActivityHistory(true)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Member Dashboard
                </Button>
              </div>

              {/* Administrative Actions */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm text-gray-700 mb-3">Administrative Actions</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => handleStatusChange(selectedMember, 'active')}
                    disabled={isActionLoading || selectedMember.membershipStatus === 'active'}
                  >
                    Change Status to Active
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => handleStatusChange(selectedMember, 'inactive')}
                    disabled={isActionLoading || selectedMember.membershipStatus === 'inactive'}
                  >
                    Change Status to Inactive
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => toast({ title: "Transfer Church", description: "Church transfer feature coming soon!" })}
                    disabled={isActionLoading}
                  >
                    Transfer to Different Church
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start text-yellow-700 hover:text-yellow-800"
                    onClick={() => handleSuspendMember(selectedMember)}
                    disabled={isActionLoading}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Suspend Member
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start text-red-700 hover:text-red-800"
                    onClick={() => handleRemoveMember(selectedMember)}
                    disabled={isActionLoading}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Remove Member
                  </Button>
                </div>
              </div>

              {/* Member Details */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm text-gray-700 mb-3">Member Details</h4>
                <div className="space-y-2 text-sm">
                  {selectedMember.phoneNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{selectedMember.phoneNumber}</span>
                    </div>
                  )}
                  {selectedMember.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="text-right max-w-xs">{selectedMember.address}</span>
                    </div>
                  )}
                  {selectedMember.interests && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Interests:</span>
                      <span className="text-right max-w-xs">{selectedMember.interests}</span>
                    </div>
                  )}
                  {selectedMember.churchAffiliation && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Church:</span>
                      <span>{selectedMember.churchAffiliation}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Profile Dialog */}
      {isEditingMember && (
        <Dialog open={isEditingMember} onOpenChange={setIsEditingMember}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Member Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={editingMemberData.fullName}
                  onChange={(e) => setEditingMemberData({...editingMemberData, fullName: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={editingMemberData.email}
                  onChange={(e) => setEditingMemberData({...editingMemberData, email: e.target.value})}
                  placeholder="Enter email address"
                  type="email"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  value={editingMemberData.phoneNumber}
                  onChange={(e) => setEditingMemberData({...editingMemberData, phoneNumber: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={editingMemberData.address}
                  onChange={(e) => setEditingMemberData({...editingMemberData, address: e.target.value})}
                  placeholder="Enter address"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Interests</label>
                <Input
                  value={editingMemberData.interests}
                  onChange={(e) => setEditingMemberData({...editingMemberData, interests: e.target.value})}
                  placeholder="Enter interests (comma separated)"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Membership Status</label>
                <Select 
                  value={editingMemberData.membershipStatus} 
                  onValueChange={(value) => setEditingMemberData({...editingMemberData, membershipStatus: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visitor">Visitor</SelectItem>
                    <SelectItem value="new_member">New Member</SelectItem>
                    <SelectItem value="active">Active Member</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditingMember(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={isActionLoading}>
                  {isActionLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Member Dashboard Dialog */}
      {showActivityHistory && selectedMember && (
        <Dialog open={showActivityHistory} onOpenChange={setShowActivityHistory}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Member Dashboard - {selectedMember.fullName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              
              {/* Key Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">24</div>
                  <div className="text-sm text-blue-700">Events Attended</div>
                  <div className="text-xs text-blue-500 mt-1">8 this month</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                  <div className="text-3xl font-bold text-green-600">12</div>
                  <div className="text-sm text-green-700">Prayer Requests</div>
                  <div className="text-xs text-green-500 mt-1">3 this month</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">6</div>
                  <div className="text-sm text-purple-700">Ministry Roles</div>
                  <div className="text-xs text-purple-500 mt-1">Active</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center border border-orange-200">
                  <div className="text-3xl font-bold text-orange-600">18</div>
                  <div className="text-sm text-orange-700">Volunteer Hours</div>
                  <div className="text-xs text-orange-500 mt-1">This month</div>
                </div>
              </div>

              {/* Check-in Statistics */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 text-gray-800">Check-in Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">16</div>
                    <div className="text-sm text-gray-600">This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">48</div>
                    <div className="text-sm text-gray-600">Year to Date</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">156</div>
                    <div className="text-sm text-gray-600">All Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-emerald-600">June 9, 2024</div>
                    <div className="text-sm text-gray-600">Last Check-in</div>
                  </div>
                </div>
              </div>

              {/* Ministry Involvement */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-gray-800">Current Ministries</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Youth Ministry', role: 'Team Leader', since: '2023-01' },
                      { name: 'Worship Team', role: 'Vocalist', since: '2022-08' },
                      { name: 'Community Outreach', role: 'Volunteer', since: '2024-03' },
                      { name: 'Bible Study', role: 'Small Group Leader', since: '2023-06' },
                      { name: 'Prayer Ministry', role: 'Prayer Partner', since: '2022-12' },
                      { name: 'Children\'s Ministry', role: 'Assistant', since: '2024-01' }
                    ].map((ministry, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium text-sm">{ministry.name}</div>
                          <div className="text-xs text-gray-600">{ministry.role}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Since {new Date(ministry.since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-gray-800">Recent Events</h4>
                  <div className="space-y-2">
                    {[
                      { event: 'Sunday Service', date: '2024-06-09', attended: true },
                      { event: 'Bible Study Group', date: '2024-06-07', attended: true },
                      { event: 'Community Potluck', date: '2024-06-05', attended: true },
                      { event: 'Youth Ministry Meeting', date: '2024-06-04', attended: false },
                      { event: 'Prayer Meeting', date: '2024-06-02', attended: true },
                      { event: 'Worship Night', date: '2024-05-30', attended: true },
                      { event: 'Sunday Service', date: '2024-05-26', attended: true },
                      { event: 'Volunteer Training', date: '2024-05-25', attended: false }
                    ].map((event, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium text-sm">{event.event}</div>
                          <div className="text-xs text-gray-600">{new Date(event.date).toLocaleDateString()}</div>
                        </div>
                        <Badge variant={event.attended ? 'default' : 'secondary'} className="text-xs">
                          {event.attended ? 'Attended' : 'Absent'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-gray-800">Activity Timeline</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {[
                    { date: '2024-06-09', action: 'Checked in to Sunday Service', type: 'checkin', time: '10:30 AM' },
                    { date: '2024-06-07', action: 'Led Bible Study discussion on Romans 8', type: 'ministry', time: '7:00 PM' },
                    { date: '2024-06-05', action: 'Volunteered at Community Food Drive', type: 'volunteer', time: '2:00 PM' },
                    { date: '2024-06-04', action: 'Posted prayer request for family member', type: 'prayer', time: '11:15 AM' },
                    { date: '2024-06-02', action: 'Attended Prayer Meeting', type: 'event', time: '6:30 PM' },
                    { date: '2024-05-30', action: 'Participated in Worship Team practice', type: 'ministry', time: '7:30 PM' },
                    { date: '2024-05-28', action: 'Shared testimony in community feed', type: 'community', time: '3:45 PM' },
                    { date: '2024-05-26', action: 'Checked in to Sunday Service', type: 'checkin', time: '10:30 AM' },
                    { date: '2024-05-25', action: 'Completed S.O.A.P. journal entry', type: 'spiritual', time: '8:00 AM' },
                    { date: '2024-05-23', action: 'Helped organize Youth Ministry event', type: 'ministry', time: '6:00 PM' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border-l-4 border-l-blue-200 bg-gray-50 rounded-r">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        activity.type === 'checkin' ? 'bg-blue-500' :
                        activity.type === 'ministry' ? 'bg-purple-500' :
                        activity.type === 'volunteer' ? 'bg-orange-500' :
                        activity.type === 'prayer' ? 'bg-green-500' :
                        activity.type === 'event' ? 'bg-indigo-500' :
                        activity.type === 'community' ? 'bg-pink-500' :
                        'bg-gray-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString()} at {activity.time}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize flex-shrink-0">
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Giving & Financial Overview */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-emerald-800">Giving Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">$450</div>
                    <div className="text-sm text-emerald-700">This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">$1,350</div>
                    <div className="text-sm text-emerald-700">Last 3 Months</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">$4,200</div>
                    <div className="text-sm text-emerald-700">Year to Date</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-emerald-600">June 2, 2024</div>
                    <div className="text-sm text-emerald-700">Last Gift</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setShowActivityHistory(false)}>
                  Close Dashboard
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}