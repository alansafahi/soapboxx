import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, Globe, Mail, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Church {
  id: string;
  name: string;
  denomination: string;
  description: string;
  city: string;
  state: string;
  zipCode: string;
  address: string;
  website?: string;
  phone?: string;
  email?: string;
  memberCount: number;
  rating: number;
  distance?: number;
}

interface ChurchLookupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectChurch: (church: Church) => void;
}

const DENOMINATIONS = [
  "all",
  "Baptist", "Methodist", "Presbyterian", "Lutheran", "Catholic", 
  "Pentecostal", "Episcopal", "Non-denominational", "Assembly of God",
  "Other"
];

const CHURCH_SIZES = [
  { value: "all", label: "All Sizes" },
  { value: "small", label: "Small (1-100)" },
  { value: "medium", label: "Medium (101-500)" },
  { value: "large", label: "Large (501-1000)" },
  { value: "mega", label: "Mega Church (1000+)" }
];

export default function ChurchLookupModal({ open, onOpenChange, onSelectChurch }: ChurchLookupModalProps) {
  const [searchParams, setSearchParams] = useState({
    denomination: "all",
    location: "",
    churchName: "",
    size: "all"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['/api/churches/search', searchParams, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...searchParams,
        limit: (resultsPerPage * currentPage).toString()
      });
      
      const response = await fetch(`/api/churches/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to search churches');
      }
      return response.json();
    },
    enabled: open
  });

  const churches = searchResults?.churches || [];
  const totalPages = Math.ceil((searchResults?.total || 0) / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentChurches = churches.slice(startIndex, endIndex);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleSelectChurch = (church: Church) => {
    onSelectChurch(church);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Find a Church</DialogTitle>
          <DialogDescription>
            Search for churches by denomination, location, name, or size
          </DialogDescription>
        </DialogHeader>

        {/* Search Filters */}
        <div className="space-y-4 border-b pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="denomination">Denomination</Label>
              <Select
                value={searchParams.denomination}
                onValueChange={(value) => setSearchParams(prev => ({ ...prev, denomination: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All denominations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Denominations</SelectItem>
                  {DENOMINATIONS.slice(1).map(denomination => (
                    <SelectItem key={denomination} value={denomination}>{denomination}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, State, or ZIP"
                value={searchParams.location}
                onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="churchName">Church Name</Label>
              <Input
                id="churchName"
                placeholder="Church name"
                value={searchParams.churchName}
                onChange={(e) => setSearchParams(prev => ({ ...prev, churchName: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="size">Size</Label>
              <Select
                value={searchParams.size}
                onValueChange={(value) => setSearchParams(prev => ({ ...prev, size: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sizes" />
                </SelectTrigger>
                <SelectContent>
                  {CHURCH_SIZES.map(size => (
                    <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSearch} className="w-full">
            Search Churches
          </Button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Searching churches...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Failed to search churches. Please try again.</p>
            </div>
          ) : currentChurches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No churches found. Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentChurches.map((church) => (
                <Card key={church.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleSelectChurch(church)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{church.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Badge variant="outline">{church.denomination}</Badge>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {church.memberCount} members
                          </span>
                        </div>
                        
                        {church.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                            {church.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {church.city}, {church.state} {church.zipCode}
                          </span>
                          
                          {church.website && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              Website
                            </span>
                          )}
                          
                          {church.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {church.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {currentChurches.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, churches.length)} of {churches.length} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}