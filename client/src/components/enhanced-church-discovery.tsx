import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { isUnauthorizedError } from "../lib/authUtils";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Star, MapPin, Phone, Globe, Users, Search, Filter, ChevronDown, Building, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Church } from "../../../shared/schema";
import ChurchFeatureSetupDialog from "./ChurchFeatureSetupDialog";

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
  const [pageSize, setPageSize] = useState(10); // User-configurable page size
  const [filters, setFilters] = useState<FilterState>({
    denomination: "Presbyterian", // Default to Presbyterian to show all 1,892 churches
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
  
  // Add Church Modal State
  const [showAddChurchModal, setShowAddChurchModal] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  // Feature Setup Dialog State
  const [showFeatureSetup, setShowFeatureSetup] = useState(false);
  const [newlyCreatedChurch, setNewlyCreatedChurch] = useState<{ id: number; name: string; size?: string } | null>(null);
  const [newChurchData, setNewChurchData] = useState({
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
    logoUrl: '',
    size: '',
    hoursOfOperation: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      tiktok: '',
      linkedin: ''
    }
  });

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
              }
              
              // Skip IP fallback to prevent interference with manual typing
              setIsDetectingLocation(false);
            },
            (error) => {
              setIsDetectingLocation(false);
            }
          );
        } else {
          // No browser geolocation available
          setIsDetectingLocation(false);
        }
      } catch (error) {
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
      // Only add location if no denomination is selected or searching by name
      if (filters.location && (filters.denomination === "all" || filters.churchName)) params.append('location', filters.location);
      if (filters.churchName) params.append('churchName', filters.churchName);
      if (filters.size && filters.size !== "all") params.append('size', filters.size);
      params.append('proximity', filters.proximity.toString());
      params.append('limit', '2000'); // Get all churches for client-side pagination
      
      const response = await apiRequest("GET", `/api/churches/search?${params}`);
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
      await apiRequest("POST", `/api/churches/${churchId}/join`);
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

  // Add Church Mutation
  // Handle logo file upload and convert to base64
  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPG, PNG, or SVG file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setNewChurchData(prev => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addChurchMutation = useMutation({
    mutationFn: async (churchData: typeof newChurchData) => {
      // Create FormData for file upload support
      const formData = new FormData();
      
      // Add all church data to FormData
      Object.entries(churchData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      // Add logo file if selected
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      // Use fetch directly to properly handle FormData
      const response = await fetch('/api/churches', {
        method: 'POST',
        credentials: 'include', // Include session cookies
        body: formData, // Don't set Content-Type, browser will set multipart/form-data
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Failed to add church');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const createdChurch = data.church;
      
      toast({
        title: "Church Added Successfully",
        description: "Now let's configure which SoapBox features you'd like to use.",
      });
      
      setShowAddChurchModal(false);
      
      // Store the newly created church info and show feature setup
      setNewlyCreatedChurch({
        id: createdChurch.id,
        name: createdChurch.name,
        size: newChurchData.size || 'small'
      });
      setShowFeatureSetup(true);
      
      // Reset form data
      setNewChurchData({
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
        logoUrl: '',
        size: '',
        hoursOfOperation: {
          monday: '',
          tuesday: '',
          wednesday: '',
          thursday: '',
          friday: '',
          saturday: '',
          sunday: ''
        },
        socialMedia: {
          facebook: '',
          twitter: '',
          instagram: '',
          youtube: '',
          tiktok: '',
          linkedin: ''
        }
      });
      setLogoFile(null);
      setLogoPreview('');
      
      queryClient.invalidateQueries({ queryKey: ['/api/churches'] });
    },
    onError: (error: any) => {
      
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please log in to add a church.",
          variant: "destructive",
        });
        return;
      }

      // Handle specific error messages from the server
      let errorMessage = "Failed to add church. Please try again.";
      
      if (error?.message) {
        if (error.message.includes('already exists')) {
          errorMessage = "A church with this name already exists in this location.";
        } else if (error.message.includes('validation')) {
          errorMessage = "Please check all required fields and try again.";
        } else if (error.message.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes('server')) {
          errorMessage = "Server error. Please try again in a few moments.";
        }
      }

      toast({
        title: "Unable to Add Church",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleAddChurch = () => {
    // Enhanced validation with specific field feedback
    const errors = [];
    
    if (!newChurchData.name?.trim()) {
      errors.push("Church name is required");
    }
    
    if (!newChurchData.denomination?.trim()) {
      errors.push("Denomination is required");
    }
    
    if (!newChurchData.city?.trim()) {
      errors.push("City is required");
    }
    
    if (!newChurchData.size?.trim()) {
      errors.push("Weekly attendance is required");
    }

    // Validate email format if provided
    if (newChurchData.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newChurchData.email)) {
        errors.push("Please enter a valid email address");
      }
    }

    // Validate website format if provided
    if (newChurchData.website?.trim()) {
      const websiteRegex = /^https?:\/\/.+\..+/;
      if (!websiteRegex.test(newChurchData.website)) {
        errors.push("Website must start with http:// or https://");
      }
    }

    if (errors.length > 0) {
      toast({
        title: "Please Check Your Information",
        description: errors.join(". "),
        variant: "destructive",
      });
      return;
    }

    addChurchMutation.mutate(newChurchData);
  };

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
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              <Button
                onClick={() => setShowAddChurchModal(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4" />
                Add Church
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('/church-claiming', '_blank')}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                <Building className="w-4 h-4" />
                Claim Church
              </Button>
            </div>
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
                              {denom} {denom === 'Presbyterian' ? '(1,892 churches)' : ''}
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
                                // Check if geolocation is supported
                                if (!navigator.geolocation) {
                                  throw new Error('Geolocation not supported');
                                }

                                // Use Promise wrapper for getCurrentPosition to handle timeouts better
                                const getCurrentPosition = () => {
                                  return new Promise<GeolocationPosition>((resolve, reject) => {
                                    navigator.geolocation.getCurrentPosition(
                                      resolve,
                                      reject,
                                      {
                                        enableHighAccuracy: true,
                                        timeout: 10000, // 10 seconds timeout
                                        maximumAge: 300000 // 5 minutes cache
                                      }
                                    );
                                  });
                                };

                                try {
                                  const position = await getCurrentPosition();
                                  const { latitude, longitude } = position.coords;
                                  
                                  // Try reverse geocoding with GPS coordinates
                                  try {
                                    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                                    if (!response.ok) throw new Error('Geocoding failed');
                                    
                                    const data = await response.json();
                                    if (data.city && data.principalSubdivision) {
                                      const detectedLocation = `${data.city}, ${data.principalSubdivision}`;
                                      setUserLocation(detectedLocation);
                                      setLocationInputValue(detectedLocation);
                                      setFilters(prev => ({ ...prev, location: detectedLocation }));
                                      toast({
                                        title: "Location Found",
                                        description: `Using your precise location: ${detectedLocation}`,
                                      });
                                      setIsDetectingLocation(false);
                                      return;
                                    }
                                  } catch (geocodeError) {
                                  }
                                } catch (gpsError: any) {
                                  
                                  // Show specific error message for GPS denial
                                  if (gpsError?.code === 1) { // PERMISSION_DENIED
                                    toast({
                                      title: "Location Permission Denied",
                                      description: "Please enable location access in your browser settings, then try again.",
                                      variant: "destructive"
                                    });
                                  } else if (gpsError?.code === 3) { // TIMEOUT
                                    toast({
                                      title: "Location Timeout",
                                      description: "GPS is taking too long. Trying alternate method...",
                                    });
                                  }
                                }

                                // Fallback to IP-based location
                                try {
                                  const response = await fetch('https://ipapi.co/json/');
                                  if (!response.ok) throw new Error('IP location service failed');
                                  
                                  const data = await response.json();
                                  if (data.city && data.region) {
                                    const detectedLocation = `${data.city}, ${data.region}`;
                                    setUserLocation(detectedLocation);
                                    setLocationInputValue(detectedLocation);
                                    setFilters(prev => ({ ...prev, location: detectedLocation }));
                                    toast({
                                      title: "Approximate Location Found",
                                      description: `Using network location: ${detectedLocation}. Adjust if needed.`,
                                    });
                                  } else {
                                    throw new Error('Invalid location data received');
                                  }
                                } catch (ipError) {
                                  toast({
                                    title: "Location Detection Failed",
                                    description: "Unable to detect location. Please enter your city manually.",
                                    variant: "destructive"
                                  });
                                }
                              } catch (error) {
                                toast({
                                  title: "Location Error",
                                  description: "Something went wrong. Please enter your location manually.",
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

              {/* Enhanced Pagination Controls */}
              {allChurches.length > pageSize && (
                <div className="text-center py-8 space-y-4">
                  {/* Page Size Selector */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Show per page:
                    </label>
                    <Select value={pageSize.toString()} onValueChange={(value) => {
                      const newPageSize = parseInt(value);
                      setPageSize(newPageSize);
                      setDisplayedCount(newPageSize);
                    }}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="250">250</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Current Results Info */}
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Showing {Math.min(displayedCount, allChurches.length)} of {allChurches.length} churches
                    {filters.denomination !== 'all' && (
                      <span className="font-medium text-purple-600 dark:text-purple-400">
                        {' '}• {filters.denomination} denomination
                      </span>
                    )}
                  </div>
                  
                  {/* Load More Button */}
                  {remainingCount > 0 && (
                    <Button
                      onClick={() => setDisplayedCount(prev => prev + pageSize)}
                      variant="outline"
                      size="lg"
                      className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-800/30 dark:hover:to-blue-800/30"
                    >
                      <Building className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                      Load Next {Math.min(remainingCount, pageSize)} Churches
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Church Modal */}
      <Dialog open={showAddChurchModal} onOpenChange={setShowAddChurchModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-600" />
              Add New Church
            </DialogTitle>
            <DialogDescription>
              Add a new church to our directory. All submissions are reviewed before being published.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Church Name */}
            <div className="grid gap-2">
              <Label htmlFor="churchName">Church Name *</Label>
              <Input
                id="churchName"
                value={newChurchData.name}
                onChange={(e) => setNewChurchData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="First Baptist Church"
              />
            </div>

            {/* Denomination */}
            <div className="grid gap-2">
              <Label htmlFor="denomination">Denomination *</Label>
              <Select value={newChurchData.denomination} onValueChange={(value) => setNewChurchData(prev => ({ ...prev, denomination: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select denomination" />
                </SelectTrigger>
                <SelectContent>
                  {denominations.map((denom) => (
                    <SelectItem key={denom} value={denom}>
                      {denom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newChurchData.description}
                onChange={(e) => setNewChurchData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the church's mission and values..."
                rows={3}
              />
            </div>

            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={newChurchData.address}
                onChange={(e) => setNewChurchData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main Street"
              />
            </div>

            {/* City, State, ZIP */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={newChurchData.city}
                  onChange={(e) => setNewChurchData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="San Francisco"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={newChurchData.state}
                  onChange={(e) => setNewChurchData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="CA"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={newChurchData.zipCode}
                onChange={(e) => setNewChurchData(prev => ({ ...prev, zipCode: e.target.value }))}
                placeholder="94102"
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newChurchData.phone}
                  onChange={(e) => setNewChurchData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newChurchData.email}
                  onChange={(e) => setNewChurchData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="info@church.org"
                />
              </div>
            </div>

            {/* Website */}
            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={newChurchData.website}
                onChange={(e) => setNewChurchData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://www.church.org"
              />
            </div>

            {/* Church Logo Upload */}
            <div className="grid gap-2">
              <Label htmlFor="logoFile">Church Logo</Label>
              <div className="space-y-3">
                <Input
                  id="logoFile"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                  onChange={handleLogoFileChange}
                  className="cursor-pointer"
                />
                {logoPreview && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="w-12 h-12 object-cover rounded border"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{logoFile?.name}</p>
                      <p className="text-xs text-gray-500">
                        {logoFile ? Math.round(logoFile.size / 1024) : 0}KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview('');
                        setNewChurchData(prev => ({ ...prev, logoUrl: '' }));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Optional: Upload JPG, PNG, or SVG file (max 5MB)
                </p>
              </div>
            </div>

            {/* Church Size */}
            <div className="grid gap-2">
              <Label htmlFor="churchSize">Weekly Attendance *</Label>
              <Select value={newChurchData.size} onValueChange={(value) => setNewChurchData(prev => ({ ...prev, size: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select weekly attendance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-50">1-50 (Micro - House church)</SelectItem>
                  <SelectItem value="51-100">51-100 (Small - Close-knit)</SelectItem>
                  <SelectItem value="101-250">101-250 (Medium - Community)</SelectItem>
                  <SelectItem value="251-500">251-500 (Large - Multi-ministry)</SelectItem>
                  <SelectItem value="501-1000">501-1000 (Very Large - Multi-staff)</SelectItem>
                  <SelectItem value="1001-2000">1001-2000 (Mega - Extensive programming)</SelectItem>
                  <SelectItem value="2001-10000">2001-10000 (Giga - High tech)</SelectItem>
                  <SelectItem value="10000+">10000+ (Meta - National reach)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Hours of Operation */}
            <div className="grid gap-3">
              <Label className="text-sm font-medium">Hours of Operation</Label>
              <div className="space-y-2">
                {Object.entries(newChurchData.hoursOfOperation).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-3">
                    <div className="w-20 text-sm capitalize">{day}:</div>
                    <Input
                      value={hours}
                      onChange={(e) => setNewChurchData(prev => ({
                        ...prev,
                        hoursOfOperation: {
                          ...prev.hoursOfOperation,
                          [day]: e.target.value
                        }
                      }))}
                      placeholder="9:00 AM - 5:00 PM"
                      className="flex-1 text-sm"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Enter service times and office hours for each day
              </p>
            </div>

            {/* Social Media Links */}
            <div className="grid gap-3">
              <Label className="text-sm font-medium">Social Media Links</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="facebook" className="text-xs">Facebook</Label>
                  <Input
                    id="facebook"
                    value={newChurchData.socialMedia.facebook}
                    onChange={(e) => setNewChurchData(prev => ({
                      ...prev,
                      socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                    }))}
                    placeholder="https://facebook.com/church"
                    className="text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="instagram" className="text-xs">Instagram</Label>
                  <Input
                    id="instagram"
                    value={newChurchData.socialMedia.instagram}
                    onChange={(e) => setNewChurchData(prev => ({
                      ...prev,
                      socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                    }))}
                    placeholder="https://instagram.com/church"
                    className="text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="twitter" className="text-xs">Twitter</Label>
                  <Input
                    id="twitter"
                    value={newChurchData.socialMedia.twitter}
                    onChange={(e) => setNewChurchData(prev => ({
                      ...prev,
                      socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                    }))}
                    placeholder="https://twitter.com/church"
                    className="text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="youtube" className="text-xs">YouTube</Label>
                  <Input
                    id="youtube"
                    value={newChurchData.socialMedia.youtube}
                    onChange={(e) => setNewChurchData(prev => ({
                      ...prev,
                      socialMedia: { ...prev.socialMedia, youtube: e.target.value }
                    }))}
                    placeholder="https://youtube.com/church"
                    className="text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tiktok" className="text-xs">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={newChurchData.socialMedia.tiktok}
                    onChange={(e) => setNewChurchData(prev => ({
                      ...prev,
                      socialMedia: { ...prev.socialMedia, tiktok: e.target.value }
                    }))}
                    placeholder="https://tiktok.com/@church"
                    className="text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="linkedin" className="text-xs">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={newChurchData.socialMedia.linkedin}
                    onChange={(e) => setNewChurchData(prev => ({
                      ...prev,
                      socialMedia: { ...prev.socialMedia, linkedin: e.target.value }
                    }))}
                    placeholder="https://linkedin.com/company/church"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddChurchModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddChurch}
              disabled={addChurchMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {addChurchMutation.isPending ? "Adding..." : "Add Church"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Church Feature Setup Dialog */}
      {newlyCreatedChurch && (
        <ChurchFeatureSetupDialog
          isOpen={showFeatureSetup}
          onClose={() => {
            setShowFeatureSetup(false);
            setNewlyCreatedChurch(null);
          }}
          churchId={newlyCreatedChurch.id}
          churchName={newlyCreatedChurch.name}
          churchSize={newlyCreatedChurch.size}
        />
      )}
    </div>
  );
}