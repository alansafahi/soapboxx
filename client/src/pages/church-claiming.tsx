import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Building, MapPin, Phone, Mail, Globe, User, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Church {
  id: number;
  name: string;
  denomination: string;
  city: string;
  state: string;
  phone?: string;
  email?: string;
  website?: string;
  address: string;
  description?: string;
  adminEmail?: string;
}

const DENOMINATION_OPTIONS = [
  'Presbyterian',
  'Baptist', 
  'Methodist',
  'Lutheran',
  'Episcopal',
  'Catholic',
  'Pentecostal',
  'Reformed',
  'Evangelical',
  'Congregational',
  'Adventist',
  'Nazarene',
  'Christian',
  'Community',
  'Calvary',
  'Bible',
  'Non-denominational',
  'Orthodox',
  'Assemblies of God',
  'Other'
];

export default function ChurchClaiming() {
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [verifiedDenomination, setVerifiedDenomination] = useState('');
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all Presbyterian churches for claiming
  const { data: claimableChurches, isLoading } = useQuery({
    queryKey: ['/api/churches/search', { denomination: 'Presbyterian' }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('denomination', 'Presbyterian');
      params.append('limit', '2000');
      
      const response = await fetch(`/api/churches/search?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch churches');
      }
      
      return response.json();
    },
    enabled: true
  });

  // Filter churches based on search term
  const filteredChurches = claimableChurches?.filter((church: Church) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      church.name.toLowerCase().includes(searchLower) ||
      church.city?.toLowerCase().includes(searchLower) ||
      church.state?.toLowerCase().includes(searchLower) ||
      church.address?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const remainingCount = filteredChurches.length - displayedCount;

  // Church claiming mutation
  const claimChurchMutation = useMutation({
    mutationFn: async ({ churchId, denomination }: { churchId: number; denomination: string }) => {
      const response = await fetch(`/api/churches/${churchId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ verifiedDenomination: denomination })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to claim church');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Church Claimed Successfully!',
        description: `You are now the administrator of ${data.church?.name}. You can manage members, events, and church settings.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/churches/search'] });
      setSelectedChurch(null);
      setShowClaimForm(false);
      setVerifiedDenomination('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Church Claiming Information',
        description: error.message,
        variant: 'default',
      });
    }
  });

  const handleSelectChurch = (church: Church) => {
    setSelectedChurch(church);
    setVerifiedDenomination(church.denomination); // Pre-fill with detected denomination
    setShowClaimForm(true);
  };

  const handleClaimChurch = () => {
    if (!selectedChurch || !verifiedDenomination) {
      toast({
        title: 'Missing Information',
        description: 'Please verify the denomination before claiming.',
        variant: 'destructive',
      });
      return;
    }

    claimChurchMutation.mutate({
      churchId: selectedChurch.id,
      denomination: verifiedDenomination
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Claim Your Church
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find and claim administrative access to your church in the SoapBox platform.
          {claimableChurches && claimableChurches.length > 0 && (
            <span className="block mt-1 text-sm font-medium text-purple-600 dark:text-purple-400">
              {claimableChurches.length} Presbyterian churches available for claiming
            </span>
          )}
        </p>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Church Claiming Requirements
              </h4>
              <p className="text-blue-700 dark:text-blue-300 mb-2">
                To claim a church, your email address must be registered with that church in our system. 
                If you don't see your church or cannot claim it, please contact our admin team.
              </p>
              <p className="text-blue-700 dark:text-blue-300 font-medium">
                Contact: <a href="mailto:admin@soapboxsuperapp.com" className="underline hover:no-underline">admin@soapboxsuperapp.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {!claimableChurches || claimableChurches.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Churches Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No Presbyterian churches are currently available for claiming.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Please check back later or contact support if you believe your church should be listed.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search and Pagination Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search churches by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {Math.min(displayedCount, filteredChurches.length)} of {filteredChurches.length} churches
              </div>
            </div>
          </div>

          <div className="grid gap-6 mb-8">
            {filteredChurches.slice(0, displayedCount).map((church: Church) => (
              <Card key={church.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-purple-600" />
                        {church.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {church.address}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {church.denomination}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {church.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4" />
                        {church.phone}
                      </div>
                    )}
                    {church.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="h-4 w-4" />
                        {church.email}
                      </div>
                    )}
                    {church.website && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Globe className="h-4 w-4" />
                        <a href={church.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                  {church.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {church.description}
                    </p>
                  )}
                  <Button 
                    onClick={() => handleSelectChurch(church)}
                    className="w-full sm:w-auto"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Claim Administrative Access
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {remainingCount > 0 && (
            <div className="text-center mb-8">
              <Button
                onClick={() => setDisplayedCount(prev => prev + 25)}
                variant="outline"
                size="lg"
                className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-800/30 dark:hover:to-blue-800/30"
              >
                <Building className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                Load Next 25 Churches ({remainingCount} remaining)
              </Button>
            </div>
          )}

          {/* Denomination Verification Modal */}
          {showClaimForm && selectedChurch && (
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  Verify Church Information
                </CardTitle>
                <CardDescription>
                  Please confirm the denomination for {selectedChurch.name} before claiming administrative access.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        Denomination Verification Required
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        We automatically detected the denomination as "{selectedChurch.denomination}" based on your church name. 
                        Please verify this is correct or select the appropriate denomination.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="denomination">Church Denomination</Label>
                  <Select value={verifiedDenomination} onValueChange={setVerifiedDenomination}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select denomination" />
                    </SelectTrigger>
                    <SelectContent>
                      {DENOMINATION_OPTIONS.map((denomination) => (
                        <SelectItem key={denomination} value={denomination}>
                          {denomination}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleClaimChurch}
                    disabled={!verifiedDenomination || claimChurchMutation.isPending}
                    className="flex-1"
                  >
                    {claimChurchMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Claiming Church...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm & Claim Church
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowClaimForm(false);
                      setSelectedChurch(null);
                      setVerifiedDenomination('');
                    }}
                    disabled={claimChurchMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}