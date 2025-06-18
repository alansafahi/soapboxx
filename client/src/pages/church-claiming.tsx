import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Building, MapPin, Phone, Mail, Globe, User } from 'lucide-react';
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch claimable churches for current user
  const { data: claimableChurches, isLoading } = useQuery({
    queryKey: ['/api/churches/claimable'],
    enabled: true
  });

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
      queryClient.invalidateQueries({ queryKey: ['/api/churches/claimable'] });
      setSelectedChurch(null);
      setShowClaimForm(false);
      setVerifiedDenomination('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Claiming Failed',
        description: error.message,
        variant: 'destructive',
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
        </p>
      </div>

      {!claimableChurches || claimableChurches.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Claimable Churches Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We couldn't find any churches associated with your email address.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                If you believe this is an error, please contact support or ensure you're using the correct email address.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 mb-8">
            {claimableChurches.map((church: Church) => (
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