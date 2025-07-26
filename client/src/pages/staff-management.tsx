import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { StaffManagement } from "../components/StaffManagement";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { UserCog, Building2 } from "lucide-react";

export default function StaffManagementPage() {
  const { user } = useAuth();
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(null);

  // Fetch user's admin communities
  const { data: adminCommunities = [], isLoading } = useQuery({
    queryKey: ["/api/user/admin-communities"],
    enabled: !!user
  });

  // Auto-select first community if only one exists
  if (!selectedCommunityId && adminCommunities.length === 1) {
    setSelectedCommunityId(adminCommunities[0].id);
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (adminCommunities.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <UserCog className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Administrative Access</h2>
          <p className="text-gray-600">
            You don't have administrative permissions for any communities. 
            Contact your community administrator to request staff management access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <UserCog className="h-8 w-8 text-blue-600" />
            Staff Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage staff members, roles, and permissions across your communities
          </p>
        </div>
      </div>

      {/* Community Selection (if multiple) */}
      {adminCommunities.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Select Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select
                value={selectedCommunityId?.toString() || ""}
                onValueChange={(value) => setSelectedCommunityId(parseInt(value))}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Choose a community to manage" />
                </SelectTrigger>
                <SelectContent>
                  {adminCommunities.map((community: any) => (
                    <SelectItem key={community.id} value={community.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{community.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {community.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Management Component */}
      {selectedCommunityId && (
        <StaffManagement communityId={selectedCommunityId} />
      )}

      {/* Placeholder for community selection */}
      {!selectedCommunityId && adminCommunities.length > 1 && (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCog className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Community</h3>
            <p className="text-gray-600">
              Choose a community from the dropdown above to manage its staff members and roles.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}