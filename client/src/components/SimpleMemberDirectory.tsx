import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, User, Building, BookOpen, Heart, Calendar, Search, 
  UserPlus, AlertCircle, Phone, Mail, MapPin 
} from "lucide-react";

interface SimpleMemberDirectoryProps {
  selectedChurch?: number | null;
}

export function SimpleMemberDirectory({ selectedChurch }: SimpleMemberDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [churchFilter, setChurchFilter] = useState("all");

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
        <Badge variant="outline">{filteredMembers.length} members</Badge>
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
          <Card key={member.id} className="hover:shadow-md transition-shadow">
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
    </div>
  );
}