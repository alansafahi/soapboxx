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
  zipCode?: string;
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
  const [proximityFilter, setProximityFilter] = useState("");
  const [zipCodeFilter, setZipCodeFilter] = useState("");
  const [communityTypeFilter, setCommunityTypeFilter] = useState("churches"); // Primary filter: churches, groups, ministries
  const [denominationFilter, setDenominationFilter] = useState(""); // Secondary filter based on type
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

    // Primary filter by community type (churches, groups, ministries)
    if (communityTypeFilter && communityTypeFilter !== "all") {
      filtered = filtered.filter(community => {
        // For now, classify all as churches since we're dealing with church data
        // This can be expanded when we have actual community type data
        return communityTypeFilter === "churches";
      });
    }

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
        community.state.toLowerCase().includes(locationFilter.toLowerCase()) ||
        community.address?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (zipCodeFilter) {
      filtered = filtered.filter(community => 
        community.zipCode?.includes(zipCodeFilter) ||
        community.address?.includes(zipCodeFilter)
      );
    }

    // Enhanced proximity filtering with ZIP code-based distance estimation
    if (proximityFilter && proximityFilter !== "all" && zipCodeFilter) {
      const maxDistance = parseInt(proximityFilter);
      filtered = filtered.filter(community => {
        if (!community.zipCode) return false;
        
        // Enhanced ZIP code distance estimation
        const userZipPrefix = zipCodeFilter.substring(0, 3);
        const communityZipPrefix = community.zipCode.substring(0, 3);
        
        // Same ZIP prefix = within 10 miles typically
        if (userZipPrefix === communityZipPrefix) {
          return maxDistance >= 5;
        }
        
        // Adjacent ZIP prefixes = within 25-50 miles typically
        const zipDiff = Math.abs(parseInt(userZipPrefix) - parseInt(communityZipPrefix));
        if (zipDiff <= 1) {
          return maxDistance >= 25;
        }
        
        // Regional ZIP codes = within 50-100 miles for larger differences
        if (zipDiff <= 3) {
          return maxDistance >= 50;
        }
        
        // Wider regional = within 100+ miles
        if (zipDiff <= 10) {
          return maxDistance >= 100;
        }
        
        return false;
      });
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
  }, [communities, searchQuery, locationFilter, zipCodeFilter, proximityFilter, communityTypeFilter, denominationFilter, sizeFilter, userCommunities]);

  // Adaptive secondary filter options based on primary selection
  const getSecondaryFilterOptions = useMemo(() => {
    switch (communityTypeFilter) {
      case "churches":
        return {
          label: "Denomination",
          options: [
            // Traditional Protestant Denominations
            "Baptist", "Methodist", "Presbyterian", "Lutheran", "Episcopal", "Anglican", 
            "Pentecostal", "Assembly of God", "Church of God", "Nazarene", "Wesleyan",
            "Reformed", "Calvinist", "Congregational", "Disciples of Christ", "United Church of Christ",
            "Adventist", "Mennonite", "Brethren", "Quaker", "Friends",
            
            // Catholic and Orthodox
            "Roman Catholic", "Eastern Orthodox", "Greek Orthodox", "Russian Orthodox", 
            "Coptic Orthodox", "Armenian Orthodox", "Ethiopian Orthodox",
            
            // Evangelical and Fundamentalist
            "Evangelical", "Fundamentalist", "Independent Baptist", "Bible Church", 
            "Community Church", "Calvary Chapel", "Vineyard", "Foursquare Gospel",
            
            // Charismatic and Pentecostal
            "Charismatic", "Full Gospel", "Apostolic", "United Pentecostal", 
            "Church of God in Christ", "International Church of the Foursquare Gospel",
            
            // Historic Churches
            "Moravian", "Waldensian", "Coptic", "Maronite", "Chaldean", 
            "Syriac Orthodox", "Malankara Orthodox",
            
            // Modern Movements
            "Non-denominational", "Interdenominational", "Multi-denominational", 
            "Emerging Church", "House Church", "Organic Church",
            
            // Restorationist
            "Church of Christ", "Christian Church", "Stone-Campbell", "Restoration Movement",
            
            // Holiness and Sanctification
            "Church of the Nazarene", "Salvation Army", "Christian and Missionary Alliance",
            
            // Reformed Traditions
            "Presbyterian Church (USA)", "Presbyterian Church in America", "Orthodox Presbyterian Church",
            "Christian Reformed Church", "Reformed Church in America", "Protestant Reformed Churches",
            
            // Baptist Varieties
            "Southern Baptist", "American Baptist", "Independent Fundamental Baptist", 
            "Missionary Baptist", "Primitive Baptist", "Free Will Baptist", "Reformed Baptist",
            
            // Lutheran Varieties
            "Lutheran Church-Missouri Synod", "Evangelical Lutheran Church in America", 
            "Wisconsin Evangelical Lutheran Synod", "Lutheran Church-Canada",
            
            // Methodist Varieties
            "United Methodist", "Free Methodist", "African Methodist Episcopal", 
            "Christian Methodist Episcopal", "Primitive Methodist",
            
            // Other Significant Groups
            "Seventh-day Adventist", "Jehovah's Witnesses", "Church of Jesus Christ of Latter-day Saints",
            "Unity", "Unitarian Universalist", "Christian Science", "New Thought"
          ].sort()
        };
      case "groups": 
        return {
          label: "Affiliation",
          options: [
            // Bible Study Groups
            "Bible Study", "Scripture Study", "Verse by Verse Study", "Topical Bible Study", 
            "Inductive Bible Study", "Expository Study", "Book Study", "Character Study",
            "Prophecy Study", "Doctrinal Study", "Apologetics Study", "Hebrew Roots Study",
            
            // Prayer Groups
            "Prayer Group", "Intercessory Prayer", "Prayer Warriors", "Prayer Chain", 
            "Contemplative Prayer", "Healing Prayer", "Prayer Walk", "24/7 Prayer Room",
            "Mothers in Prayer", "Men's Prayer Group", "Prayer and Fasting",
            
            // Fellowship Groups
            "Fellowship Group", "Home Fellowship", "Cell Group", "Life Group", 
            "Connect Group", "Community Group", "Covenant Group", "Accountability Group",
            "Discipleship Circle", "Mentorship Group", "Spiritual Formation Group",
            
            // Support and Recovery
            "Support Group", "Grief Support", "Addiction Recovery", "Celebrate Recovery", 
            "Divorce Recovery", "Cancer Support", "Mental Health Support", "Caregivers Support",
            "Military Support", "Widows Support", "Single Parents Support", "Special Needs Support",
            
            // Service and Outreach
            "Community Service", "Homeless Ministry", "Food Pantry", "Soup Kitchen", 
            "Prison Ministry", "Hospital Ministry", "Nursing Home Ministry", "Missions Group",
            "Evangelism Team", "Street Ministry", "Refugee Ministry", "Disaster Relief",
            
            // Age-Specific Groups
            "Youth Group", "Teen Group", "Young Adults", "College Group", "Singles Group", 
            "Young Professionals", "Married Couples", "Parents Group", "Seniors Group", 
            "Golden Agers", "Empty Nesters", "Grandparents Group",
            
            // Interest-Based Groups
            "Book Club", "Christian Book Club", "Movie Discussion", "Theology Discussion", 
            "Philosophy Group", "History Group", "Art Group", "Cooking Group", "Gardening Group",
            "Sports Group", "Hiking Group", "Crafts Group", "Photography Group",
            
            // Women's and Men's Groups
            "Women's Group", "Ladies Bible Study", "Women's Fellowship", "Proverbs 31 Women", 
            "Women's Retreat Group", "Men's Group", "Men's Fellowship", "Men's Breakfast", 
            "Promise Keepers", "Iron Sharpens Iron", "Men's Retreat Group",
            
            // Family Groups
            "Family Group", "Parenting Group", "Marriage Group", "Couples Group", 
            "Homeschool Group", "Christian Families", "Adoption Support", "Foster Care Support",
            
            // Spiritual Growth
            "Spiritual Growth", "Discipleship Group", "Spiritual Direction", "Contemplative Group", 
            "Meditation Group", "Lectio Divina", "Centering Prayer", "Spiritual Disciplines"
          ].sort()
        };
      case "ministries":
        return {
          label: "Ministry Type", 
          options: [
            // Worship and Music Ministries
            "Worship", "Music Ministry", "Choir", "Praise Team", "Orchestra", "Instrumental", 
            "Piano Ministry", "Guitar Ministry", "Drums Ministry", "Sound Ministry", 
            "Media Ministry", "Video Ministry", "Livestream Ministry", "Lighting Ministry",
            "Creative Arts", "Dance Ministry", "Drama Ministry", "Mime Ministry",
            
            // Children's Ministries
            "Children", "Kids Ministry", "Sunday School", "Vacation Bible School", "AWANA", 
            "Children's Church", "Nursery Ministry", "Preschool Ministry", "Elementary Ministry",
            "Children's Choir", "Kids Worship", "Puppet Ministry", "Children's Drama",
            
            // Youth Ministries
            "Youth", "Student Ministry", "High School Ministry", "Middle School Ministry", 
            "Youth Group", "Youth Worship", "Youth Missions", "Youth Camps", "Youth Sports",
            "Youth Discipleship", "Confirmation Class", "Teen Leadership",
            
            // Young Adult Ministries
            "Young Adults", "College Ministry", "Young Professionals", "Singles Ministry", 
            "Campus Ministry", "University Outreach", "Graduate Student Ministry",
            
            // Adult Ministries
            "Adult Ministry", "Men's Ministry", "Women's Ministry", "Couples Ministry", 
            "Marriage Ministry", "Parenting Ministry", "Seniors Ministry", "Prime Time Ministry",
            "50+ Ministry", "Golden Years Ministry", "Retirement Ministry",
            
            // Outreach and Evangelism
            "Outreach", "Evangelism", "Street Ministry", "Neighborhood Outreach", 
            "Community Outreach", "Homeless Ministry", "Food Bank", "Soup Kitchen", 
            "Clothing Closet", "Angel Tree", "Adopt-a-Family", "Backpack Ministry",
            
            // Missions
            "Missions", "Local Missions", "Foreign Missions", "Short-term Missions", 
            "Mission Trips", "Cross-cultural Ministry", "International Ministry", 
            "Refugee Ministry", "ESL Ministry", "Immigrant Ministry", "Global Missions",
            
            // Pastoral Care
            "Pastoral Care", "Hospital Ministry", "Nursing Home Ministry", "Shut-in Ministry", 
            "Grief Ministry", "Counseling Ministry", "Prayer Ministry", "Healing Ministry",
            "Deliverance Ministry", "Restoration Ministry", "Recovery Ministry",
            
            // Education and Discipleship
            "Education", "Bible Study", "Discipleship", "Small Groups", "Sunday School", 
            "Christian Education", "Leadership Development", "Mentoring", "Coaching",
            "Seminary Extension", "Theological Education", "Bible College Ministry",
            
            // Special Needs and Support
            "Special Needs", "Disability Ministry", "Autism Ministry", "Mental Health Ministry", 
            "Addiction Recovery", "Celebrate Recovery", "Support Groups", "Crisis Ministry",
            "Counseling", "Family Counseling", "Marriage Counseling",
            
            // Sports and Recreation
            "Sports Ministry", "Recreation Ministry", "Church Softball", "Basketball Ministry", 
            "Soccer Ministry", "Golf Ministry", "Fitness Ministry", "Outdoor Ministry",
            "Adventure Ministry", "Camping Ministry", "Hiking Ministry",
            
            // Technology and Media
            "Technology Ministry", "Website Ministry", "Social Media Ministry", "IT Ministry", 
            "Computer Ministry", "Audio/Visual Ministry", "Photography Ministry", 
            "Communications Ministry", "Publications Ministry",
            
            // Administrative and Support
            "Administration", "Finance Ministry", "Stewardship Ministry", "Facilities Ministry", 
            "Maintenance Ministry", "Security Ministry", "Transportation Ministry", 
            "Kitchen Ministry", "Hospitality Ministry", "Ushering Ministry", "Greeting Ministry",
            
            // Special Events
            "Events Ministry", "Wedding Ministry", "Funeral Ministry", "Holiday Ministry", 
            "Festival Ministry", "Conference Ministry", "Retreat Ministry", "Camp Ministry"
          ].sort()
        };
      default:
        return {
          label: "Denomination",
          options: Array.from(new Set(communities.map(c => c.denomination))).sort()
        };
    }
  }, [communityTypeFilter, communities]);

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
      <div className="space-y-6">
        {/* Global Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search communities by name, denomination, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Location-Based Search Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Find Communities Near You
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* City/State Location Filter */}
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by city, state, or address..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* ZIP Code Filter */}
          <Input
            placeholder="Enter ZIP code..."
            value={zipCodeFilter}
            onChange={(e) => setZipCodeFilter(e.target.value)}
            maxLength={5}
          />

          {/* Proximity Filter */}
          <Select value={proximityFilter} onValueChange={setProximityFilter}>
            <SelectTrigger>
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Distance from me" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Distance</SelectItem>
              <SelectItem value="5">Within 5 miles</SelectItem>
              <SelectItem value="10">Within 10 miles</SelectItem>
              <SelectItem value="25">Within 25 miles</SelectItem>
              <SelectItem value="50">Within 50 miles</SelectItem>
              <SelectItem value="100">Within 100 miles</SelectItem>
            </SelectContent>
          </Select>
        </div>
        </div>

        {/* Community Type and Detailed Filters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Refine Your Search
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Can't find your community? 
              <Button 
                variant="link" 
                className="h-auto p-0 ml-1 text-purple-600 dark:text-purple-400"
                onClick={() => window.location.href = '/community-management'}
              >
                Create one
              </Button>
            </div>
          </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Primary Filter: Community Type */}
          <Select value={communityTypeFilter} onValueChange={(value) => {
            setCommunityTypeFilter(value);
            setDenominationFilter(""); // Reset secondary filter when primary changes
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Community Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="churches">Churches</SelectItem>
              <SelectItem value="ministries">Ministries</SelectItem>
              <SelectItem value="groups">Groups</SelectItem>
            </SelectContent>
          </Select>

          {/* Secondary Filter: Adaptive based on primary selection */}
          <Select value={denominationFilter} onValueChange={setDenominationFilter}>
            <SelectTrigger>
              <SelectValue placeholder={`All ${getSecondaryFilterOptions.label.toLowerCase()}s`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {getSecondaryFilterOptions.label}s</SelectItem>
              {getSecondaryFilterOptions.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Name Search */}
          <Input
            placeholder="Search by community name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Size Filter */}
          <Select value={sizeFilter} onValueChange={setSizeFilter}>
            <SelectTrigger>
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
        </div>
      </div>

      {/* Enhanced Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Found {filteredCommunities.length} communities
          {searchQuery && ` for "${searchQuery}"`}
          {zipCodeFilter && proximityFilter && proximityFilter !== "all" && 
            ` within ${proximityFilter} miles of ${zipCodeFilter}`}
        </p>
        {(searchQuery || locationFilter || zipCodeFilter || denominationFilter || sizeFilter !== "all") && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setLocationFilter("");
              setZipCodeFilter("");
              setProximityFilter("");
              setCommunityTypeFilter("churches");
              setDenominationFilter("");
              setSizeFilter("");
            }}
          >
            Clear Filters
          </Button>
        )}
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
                  setZipCodeFilter("");
                  setProximityFilter("");
                  setCommunityTypeFilter("churches");
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