import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Phone, Globe, Users, Search, Filter, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Church } from "@shared/schema";

interface FilterState {
  denomination: string;
  location: string;
  size: string;
  proximity: number;
  churchName: string;
}

interface ChurchWithDistance extends Church {
  distance?: number;
  memberCount: number | null;
}

export default function EnhancedChurchDiscovery() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [joinedChurches, setJoinedChurches] = useState<Set<number>>(new Set());
  const [animatingButtons, setAnimatingButtons] = useState<Set<number>>(new Set());
  const [displayedCount, setDisplayedCount] = useState(10);
  const [filters, setFilters] = useState<FilterState>({
    denomination: "all",
    location: "",
    size: "all",
    proximity: 25, // Default 25 miles
    churchName: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Search mode: 'location' or 'name'
  const [searchMode, setSearchMode] = useState<'location' | 'name'>('location');
  const [locationInputValue, setLocationInputValue] = useState("");
  const [churchNameInput, setChurchNameInput] = useState("");
  const [userLocation, setUserLocation] = useState<string>("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Auto-detect user location on component mount (only if user hasn't interacted)
  useEffect(() => {
    if (hasUserInteracted) return; // Skip entirely if user has interacted
    
    const detectLocation = async () => {
      setIsDetectingLocation(true);
      try {
        // Try browser geolocation first for more accuracy
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                // Reverse geocoding using a simple service
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                const data = await response.json();
                if (data.city && data.principalSubdivision && !hasUserInteracted) {
                  const detectedLocation = `${data.city}, ${data.principalSubdivision}`;
                  setUserLocation(detectedLocation);
                  setLocationInputValue(detectedLocation);
                  setFilters(prev => ({ ...prev, location: detectedLocation }));
                  toast({
                    title: "Precise Location Detected",
                    description: `Using GPS location: ${detectedLocation}`,
                  });
                  setIsDetectingLocation(false);
                  return;
                }
              } catch (error) {
                console.log('Reverse geocoding failed, trying IP location...');
              }
              
              // Skip IP fallback to prevent interference with manual typing
              setIsDetectingLocation(false);
            },
            (error) => {
              console.log('Browser geolocation denied');
              setIsDetectingLocation(false);
            }
          );
        } else {
          // No browser geolocation available
          setIsDetectingLocation(false);
        }
      } catch (error) {
        console.log('All location detection failed');
        toast({
          title: "Location Detection Failed",
          description: "Please enter your location manually",
          variant: "destructive"
        });
      } finally {
        setIsDetectingLocation(false);
      }
    };

    detectLocation();
  }, [toast, hasUserInteracted]);

  // Handle location input changes with debounced filter updates
  const handleLocationChange = useCallback((value: string) => {
    // Immediately set user interaction flag to prevent any auto-detection
    setHasUserInteracted(true);
    setLocationInputValue(value);
    
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only update filters after user stops typing
    debounceTimerRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, location: value, churchName: "" }));
    }, 1000); // Increased debounce time to 1000ms for better typing experience
  }, []);

  // Handle church name search
  const handleChurchNameChange = useCallback((value: string) => {
    setChurchNameInput(value);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, churchName: value, location: "" }));
    }, 1000); // Increased debounce time to 1000ms for better typing experience
  }, []);

  // Fetch churches with filtering
  const { data: allChurches = [], isLoading } = useQuery<ChurchWithDistance[]>({
    queryKey: ["/api/churches/search", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.denomination && filters.denomination !== "all") params.append('denomination', filters.denomination);
      if (filters.location) params.append('location', filters.location);
      if (filters.churchName) params.append('churchName', filters.churchName);
      if (filters.size && filters.size !== "all") params.append('size', filters.size);
      params.append('proximity', filters.proximity.toString());
      params.append('limit', '1000'); // Get all for client-side pagination
      
      const response = await apiRequest(`/api/churches/search?${params}`);
      return response as ChurchWithDistance[];
    },
  });

  // Get unique denominations for filter dropdown
  const { data: denominations = [] } = useQuery<string[]>({
    queryKey: ["/api/churches/denominations"],
  });

  // Join church mutation
  const joinChurchMutation = useMutation({
    mutationFn: async (churchId: number) => {
      await apiRequest(`/api/churches/${churchId}/join`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/churches/search"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/churches"] });
      toast({
        title: "Church Joined",
        description: "You have successfully connected with this church!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to join churches.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to join church. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleJoinChurch = (churchId: number) => {
    setAnimatingButtons(prev => new Set([...Array.from(prev), churchId]));
    setJoinedChurches(prev => new Set([...Array.from(prev), churchId]));

    setTimeout(() => {
      setAnimatingButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete(churchId);
        return newSet;
      });
    }, 400);

    joinChurchMutation.mutate(churchId);
  };

  const handleViewMoreChurches = () => {
    setDisplayedCount(prev => Math.min(prev + 10, allChurches.length));
  };

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setDisplayedCount(10); // Reset to first 10 when filters change
  };

  const clearFilters = () => {
    setFilters({
      denomination: "all",
      location: "",
      size: "all",
      proximity: 25,
      churchName: ""
    });
    // Clear input values
    setLocationInputValue("");
    setChurchNameInput("");
    setDisplayedCount(10);
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-3 h-3 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />
      );
    }

    return stars;
  };

  const getDenominationColor = (denomination?: string) => {
    if (!denomination) return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    
    const colors = [
      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
      "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
    ];
    
    const hash = denomination.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const getSizeLabel = (memberCount?: number) => {
    if (!memberCount) return "Community";
    if (memberCount >= 1 && memberCount <= 50) return "Micro";
    if (memberCount >= 51 && memberCount <= 100) return "Small";
    if (memberCount >= 101 && memberCount <= 250) return "Medium";
    if (memberCount >= 251 && memberCount <= 500) return "Large";
    if (memberCount >= 501 && memberCount <= 1000) return "Very Large";
    if (memberCount >= 1001 && memberCount <= 2000) return "Mega";
    if (memberCount >= 2001 && memberCount <= 10000) return "Giga";
    if (memberCount >= 10001) return "Meta";
    return "Community";
  };

  const handleWebsiteClick = (websiteUrl?: string) => {
    if (!websiteUrl) return;
    
    let url = websiteUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Get displayed churches (top 10 by proximity, then paginated)
  const displayedChurches = allChurches.slice(0, displayedCount);

  // Helper function to get church size category with nickname
  const getChurchSizeDisplay = (memberCount: number) => {
    if (memberCount >= 1 && memberCount <= 50) return "Micro Church (House church)";
    if (memberCount >= 51 && memberCount <= 100) return "Small Church (Close-knit)";
    if (memberCount >= 101 && memberCount <= 250) return "Medium Church (Community)";
    if (memberCount >= 251 && memberCount <= 500) return "Large Church (Multi-ministry)";
    if (memberCount >= 501 && memberCount <= 1000) return "Very Large Church (Multi-staff)";
    if (memberCount >= 1001 && memberCount <= 2000) return "Mega Church (Extensive programming)";
    if (memberCount >= 2001 && memberCount <= 10000) return "Giga Church (High tech)";
    if (memberCount >= 10001) return "Meta Church (National reach)";
    return "Size not specified";
  };
  const remainingCount = allChurches.length - displayedCount;
  const hasUserDenomination = user && (user as any).denomination;
  const userDenominationMatches = hasUserDenomination 
    ? allChurches.filter(church => church.denomination === (user as any).denomination).length
    : 0;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse border border-gray-100 dark:border-gray-600 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Discover Churches
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Find churches by denomination, location, or size - showing top 10 by proximity
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0">
                <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {/* First row: Denomination and Church Size side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Denomination
                      </label>
                      <Select value={filters.denomination} onValueChange={(value) => handleFilterChange('denomination', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any denomination" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any denomination</SelectItem>
                          {denominations.map((denom) => (
                            <SelectItem key={denom} value={denom}>
                              {denom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Church Size
                      </label>
                      <Select value={filters.size} onValueChange={(value) => handleFilterChange('size', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any size</SelectItem>
                          <SelectItem value="micro">Micro Church (1-50)</SelectItem>
                          <SelectItem value="small">Small Church (51-100)</SelectItem>
                          <SelectItem value="medium">Medium Church (101-250)</SelectItem>
                          <SelectItem value="large">Large Church (251-500)</SelectItem>
                          <SelectItem value="very-large">Very Large Church (501-1,000)</SelectItem>
                          <SelectItem value="mega">Mega Church (1,001-2,000)</SelectItem>
                          <SelectItem value="giga">Giga Church (2,001-10,000)</SelectItem>
                          <SelectItem value="meta">Meta Church (10,000+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Second row: Search mode toggle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search Method
                    </label>
                    <div className="flex gap-2 mb-3">
                      <Button
                        variant={searchMode === 'location' ? 'default' : 'outline'}
                        onClick={() => setSearchMode('location')}
                        size="sm"
                        className="flex-1"
                      >
                        📍 By Location
                      </Button>
                      <Button
                        variant={searchMode === 'name' ? 'default' : 'outline'}
                        onClick={() => setSearchMode('name')}
                        size="sm"
                        className="flex-1"
                      >
                        🏛️ By Church Name
                      </Button>
                    </div>
                    
                    {searchMode === 'location' ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder={userLocation ? `Current: ${userLocation}` : "Enter city, state, or zip code..."}
                            value={locationInputValue}
                            onChange={(e) => handleLocationChange(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              setIsDetectingLocation(true);
                              setHasUserInteracted(false); // Reset to allow location update
                              try {
                                // Try GPS first for accuracy
                                if (navigator.geolocation) {
                                  navigator.geolocation.getCurrentPosition(
                                    async (position) => {
                                      try {
                                        const { latitude, longitude } = position.coords;
                                        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                                        const data = await response.json();
                                        if (data.city && data.principalSubdivision) {
                                          const detectedLocation = `${data.city}, ${data.principalSubdivision}`;
                                          setUserLocation(detectedLocation);
                                          setLocationInputValue(detectedLocation);
                                          setFilters(prev => ({ ...prev, location: detectedLocation }));
                                          toast({
                                            title: "Precise Location Updated",
                                            description: `Using GPS location: ${detectedLocation}`,
                                          });
                                          setIsDetectingLocation(false);
                                          return;
                                        }
                                      } catch (error) {
                                        console.log('GPS reverse geocoding failed, trying IP...');
                                      }
                                      
                                      // Fallback to IP location
                                      try {
                                        const response = await fetch('https://ipapi.co/json/');
                                        const data = await response.json();
                                        if (data.city && data.region) {
                                          const detectedLocation = `${data.city}, ${data.region}`;
                                          setUserLocation(detectedLocation);
                                          setLocationInputValue(detectedLocation);
                                          setFilters(prev => ({ ...prev, location: detectedLocation }));
                                          toast({
                                            title: "Approximate Location Updated",
                                            description: `Using ISP location: ${detectedLocation}. Please correct if this isn't accurate.`,
                                          });
                                        }
                                      } catch (error) {
                                        toast({
                                          title: "Location Error",
                                          description: "Could not detect your location. Please enter manually.",
                                          variant: "destructive"
                                        });
                                      } finally {
                                        setIsDetectingLocation(false);
                                      }
                                    },
                                    async (error) => {
                                      // GPS denied, try IP location
                                      try {
                                        const response = await fetch('https://ipapi.co/json/');
                                        const data = await response.json();
                                        if (data.city && data.region) {
                                          const detectedLocation = `${data.city}, ${data.region}`;
                                          setUserLocation(detectedLocation);
                                          setLocationInputValue(detectedLocation);
                                          setFilters(prev => ({ ...prev, location: detectedLocation }));
                                          toast({
                                            title: "Approximate Location Updated",
                                            description: `Using ISP location: ${detectedLocation}. Please correct if this isn't accurate.`,
                                          });
                                        }
                                      } catch (error) {
                                        toast({
                                          title: "Location Error",
                                          description: "Could not detect your location. Please enter manually.",
                                          variant: "destructive"
                                        });
                                      } finally {
                                        setIsDetectingLocation(false);
                                      }
                                    }
                                  );
                                } else {
                                  // No GPS available, use IP
                                  const response = await fetch('https://ipapi.co/json/');
                                  const data = await response.json();
                                  if (data.city && data.region) {
                                    const detectedLocation = `${data.city}, ${data.region}`;
                                    setUserLocation(detectedLocation);
                                    setLocationInputValue(detectedLocation);
                                    setFilters(prev => ({ ...prev, location: detectedLocation }));
                                    toast({
                                      title: "Approximate Location Updated",
                                      description: `Using ISP location: ${detectedLocation}. Please correct if this isn't accurate.`,
                                    });
                                  }
                                }
                              } catch (error) {
                                toast({
                                  title: "Location Error",
                                  description: "Could not detect your location. Please enter manually.",
                                  variant: "destructive"
                                });
                              } finally {
                                setIsDetectingLocation(false);
                              }
                            }}
                            disabled={isDetectingLocation}
                            className="whitespace-nowrap"
                          >
                            {isDetectingLocation ? (
                              <>
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mr-1"></div>
                                Detecting...
                              </>
                            ) : (
                              <>
                                <MapPin className="w-4 h-4 mr-1" />
                                Use My Location
                              </>
                            )}
                          </Button>
                        </div>
                        {userLocation && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            ✓ Auto-detected your location from device IP
                          </p>
                        )}
                      </div>
                    ) : (
                      <Input
                        placeholder="Enter church name..."
                        value={churchNameInput}
                        onChange={(e) => handleChurchNameChange(e.target.value)}
                        className="w-full"
                      />
                    )}
                  </div>
                  
                  {/* Third row: Distance slider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Distance: {filters.proximity} miles
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={filters.proximity}
                      onChange={(e) => handleFilterChange('proximity', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {allChurches.length} churches found
                    {hasUserDenomination && userDenominationMatches > 0 && (
                      <span className="ml-2 text-purple-600 dark:text-purple-400">
                        • {userDenominationMatches} match your {(user as any).denomination} preference
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Churches List */}
      <Card>
        <CardContent className="p-6">
          {allChurches.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No churches found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm max-w-md mx-auto">
                Try adjusting your filters or expanding your search radius to find more churches in your area.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {displayedChurches.map((church, index) => (
                  <motion.div
                    key={church.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-100 dark:border-gray-600 rounded-xl p-6 hover:border-purple-600 dark:hover:border-purple-400 transition-all duration-200 bg-white dark:bg-gray-800 hover:shadow-lg"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Church Avatar */}
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
                        {(church as any).imageUrl ? (
                          <img 
                            src={(church as any).imageUrl} 
                            alt={`${church.name} building`} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-purple-600">
                                {church.name[0]}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Church Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                              {church.name}
                            </h3>
                            <div className="flex items-center gap-3 mb-2">
                              {church.denomination && (
                                <Badge className={`text-xs ${getDenominationColor(church.denomination)}`}>
                                  {church.denomination}
                                </Badge>
                              )}
                              {church.memberCount && (
                                <Badge variant="secondary" className="text-xs">
                                  <Users className="w-3 h-3 mr-1" />
                                  {getSizeLabel(church.memberCount)}
                                </Badge>
                              )}
                              {church.distance && (
                                <Badge variant="outline" className="text-xs">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {church.distance.toFixed(1)} mi
                                </Badge>
                              )}
                            </div>
                            
                            {/* Rating */}
                            {(church as any).rating && (
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center">
                                  {renderStarRating((church as any).rating)}
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {(church as any).rating.toFixed(1)} ({(church as any).reviewCount || 0} reviews)
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 ml-4">
                            {church.website && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleWebsiteClick(church.website ?? undefined)}
                                className="flex items-center gap-1"
                              >
                                <Globe className="w-3 h-3" />
                                Website
                              </Button>
                            )}
                            <motion.div
                              animate={animatingButtons.has(church.id) ? { scale: [1, 0.95, 1] } : {}}
                              transition={{ duration: 0.4 }}
                            >
                              <Button
                                onClick={() => handleJoinChurch(church.id)}
                                disabled={joinedChurches.has(church.id) || joinChurchMutation.isPending}
                                className={`${
                                  joinedChurches.has(church.id)
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-purple-600 hover:bg-purple-700'
                                } text-white`}
                              >
                                {joinedChurches.has(church.id) ? 'Joined ✓' : 'Connect'}
                              </Button>
                            </motion.div>
                          </div>
                        </div>

                        {/* Church Description */}
                        {church.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                            {church.description}
                          </p>
                        )}

                        {/* Location and Contact */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          {church.address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{church.city}, {church.state}</span>
                            </div>
                          )}
                          {(church as any).phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{(church as any).phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Load More Button */}
              {remainingCount > 0 && (
                <div className="text-center pt-6">
                  <Button
                    onClick={handleViewMoreChurches}
                    variant="outline"
                    size="lg"
                    className="w-full max-w-md"
                  >
                    View 10 More Churches ({remainingCount} remaining)
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}