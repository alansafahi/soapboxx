import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, User, Building, BookOpen, Heart, Calendar, Search, 
  UserPlus, AlertCircle, Phone, Mail, MapPin 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  const [newMember, setNewMember] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    interests: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
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
        throw new Error('Failed to update status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSuspendMember = async (member: any) => {
    if (!confirm(`Are you sure you want to suspend ${member.fullName}? This action can be reversed later.`)) {
      return;
    }
    
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
        throw new Error('Failed to suspend member');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRemoveMember = async (member: any) => {
    if (!confirm(`Are you sure you want to remove ${member.fullName} from the church? This action cannot be undone.`)) {
      return;
    }
    
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
        throw new Error('Failed to remove member');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
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
          <Card key={member.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3" onClick={() => setSelectedMember(member)}>
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
                  onClick={() => toast({ title: "Edit Profile", description: "Profile editing feature coming soon!" })}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => toast({ title: "View Activity", description: "Activity tracking feature coming soon!" })}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View Activity
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
    </div>
  );
}