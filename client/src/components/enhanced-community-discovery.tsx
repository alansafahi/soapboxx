import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Building, MapPin, Users, Search, Filter, Phone, Mail, Globe, Calendar } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";

interface Community {
  id: number;
  name: string;
  denomination: string;
  address: string;
  city: string;
  state: string;
  memberCount?: number;
  logoUrl?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  distance?: number;
  isJoined?: boolean;
}

export default function EnhancedCommunityDiscovery() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [denominationFilter, setDenominationFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [displayedCount, setDisplayedCount] = useState(6);

  const { data: communities = [], isLoading } = useQuery<Community[]>({
    queryKey: ["/api/communities/discover"],
    enabled: !!user,
  });

  const { data: userCommunities = [] } = useQuery({
    queryKey: ["/api/users/communities"],
    enabled: !!user,
  });

  const joinCommunity = useMutation({
    mutationFn: async (communityId: number) => {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to join community');
      return response.json();
    },
    onSuccess: (data, communityId) => {
      toast({
        title: "Successfully joined community!",
        description: "You're now part of this faith community.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users/communities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/communities/discover"] });
    },
    onError: (error) => {
      toast({
        title: "Unable to join",
        description: "There was an issue joining this community. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredCommunities = useMemo(() => {
    let filtered = communities;

    // Filter out communities user has already joined
    const joinedCommunityIds = Array.isArray(userCommunities) ? userCommunities.map((uc: any) => uc.id) : [];
    filtered = filtered.filter(community => !joinedCommunityIds.includes(community.id));

    if (searchQuery) {
      filtered = filtered.filter(community => 
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.denomination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(community => 
        community.city.toLowerCase().includes(locationFilter.toLowerCase()) ||
        community.state.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (denominationFilter && denominationFilter !== "all") {
      filtered = filtered.filter(community => 
        community.denomination.toLowerCase() === denominationFilter.toLowerCase()
      );
    }

    if (sizeFilter && sizeFilter !== "all") {
      filtered = filtered.filter(community => {
        const memberCount = community.memberCount || 0;
        switch (sizeFilter) {
          case "small": return memberCount < 100;
          case "medium": return memberCount >= 100 && memberCount < 500;
          case "large": return memberCount >= 500;
          default: return true;
        }
      });
    }

    return filtered;
  }, [communities, searchQuery, locationFilter, denominationFilter, sizeFilter, userCommunities]);

  const denominations = useMemo(() => {
    const unique = Array.from(new Set(communities.map(c => c.denomination)));
    return unique.sort();
  }, [communities]);

  const getDenominationColor = (denomination: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    ];
    const index = denomination.length % colors.length;
    return colors[index];
  };

  const getSizeLabel = (count?: number) => {
    if (!count) return "Small Community";
    if (count < 100) return "Small Community";
    if (count < 500) return "Medium Community";
    return "Large Community";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search communities by name, denomination, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Input
          placeholder="Filter by location..."
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />
        <Select value={denominationFilter} onValueChange={setDenominationFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All denominations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Denominations</SelectItem>
            {denominations.map((denomination) => (
              <SelectItem key={denomination} value={denomination}>
                {denomination}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Found {filteredCommunities.length} communities
          {searchQuery && ` for "${searchQuery}"`}
        </p>
        <Select value={sizeFilter} onValueChange={setSizeFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All sizes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sizes</SelectItem>
            <SelectItem value="small">Small (&lt; 100)</SelectItem>
            <SelectItem value="medium">Medium (100-500)</SelectItem>
            <SelectItem value="large">Large (500+)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Community Grid */}
      {filteredCommunities.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Building className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Communities Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                No communities match your current search criteria. Try adjusting your filters or search terms.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setLocationFilter("");
                  setDenominationFilter("");
                  setSizeFilter("");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCommunities.slice(0, displayedCount).map((community) => (
              <Card key={community.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    {community.logoUrl ? (
                      <img 
                        src={community.logoUrl} 
                        alt={`${community.name} logo`}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg leading-6 truncate">
                        {community.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${getDenominationColor(community.denomination)}`}>
                          {community.denomination}
                        </Badge>
                        {community.memberCount && (
                          <Badge variant="secondary" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {getSizeLabel(community.memberCount)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{community.address}</span>
                    </div>
                    
                    {community.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{community.phone}</span>
                      </div>
                    )}
                    
                    {community.website && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Globe className="h-4 w-4 flex-shrink-0" />
                        <a 
                          href={community.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 dark:text-purple-400 hover:underline truncate"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {community.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {community.description}
                    </p>
                  )}

                  <div className="pt-2">
                    <Button 
                      onClick={() => joinCommunity.mutate(community.id)}
                      disabled={joinCommunity.isPending}
                      className="w-full"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {joinCommunity.isPending ? "Joining..." : "Join Community"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {filteredCommunities.length > displayedCount && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setDisplayedCount(prev => prev + 6)}
              >
                Load More Communities
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}