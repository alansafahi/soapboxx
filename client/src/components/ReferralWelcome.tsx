import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Gift, Heart, Users, Star } from "lucide-react";

interface ReferralWelcomeProps {
  referralCode?: string;
}

export function ReferralWelcome({ referralCode }: ReferralWelcomeProps) {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [hasProcessedReferral, setHasProcessedReferral] = useState(false);

  // Validate referral code
  const { data: referralValidation, isLoading: validating } = useQuery({
    queryKey: ['/api/referrals/validate', referralCode],
    enabled: !!referralCode && !hasProcessedReferral,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Process referral mutation
  const processReferralMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/referrals/process', {
        method: 'POST',
        body: { referralCode }
      });
    },
    onSuccess: (data) => {
      setHasProcessedReferral(true);
      toast({
        title: "Welcome to SoapBox! 🎉",
        description: data.message,
        duration: 5000,
      });
    },
    onError: (error) => {
      console.error('Error processing referral:', error);
      toast({
        title: "Welcome to SoapBox!",
        description: "You've joined our spiritual community. Start your journey today!",
        duration: 3000,
      });
    }
  });

  // Auto-process referral when user authenticates
  useEffect(() => {
    if (
      isAuthenticated && 
      user && 
      referralCode && 
      referralValidation?.valid && 
      !hasProcessedReferral
    ) {
      processReferralMutation.mutate();
    }
  }, [isAuthenticated, user, referralCode, referralValidation?.valid, hasProcessedReferral]);

  // Don't show anything if no referral code or already processed
  if (!referralCode || hasProcessedReferral || !referralValidation?.valid) {
    return null;
  }

  // Show welcome screen for new users with valid referral
  if (isAuthenticated && user) {
    return (
      <Card className="mb-6 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Gift className="w-16 h-16 text-purple-600" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-purple-800">
            Welcome to SoapBox! 
          </CardTitle>
          <p className="text-purple-600">
            You've been invited to join our spiritual community
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {processReferralMutation.isPending ? (
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
              <p className="text-purple-700">Processing your welcome bonus...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center space-x-4">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Gift className="w-4 h-4 mr-1" />
                  250 Welcome Points
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Heart className="w-4 h-4 mr-1" />
                  Friend Bonus
                </Badge>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-800">Join the Community</span>
                </div>
                <p className="text-sm text-gray-600">
                  Someone special invited you to grow in faith together. 
                  Start your daily Bible reading journey and earn rewards!
                </p>
              </div>
              
              <Button 
                onClick={() => processReferralMutation.mutate()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
                disabled={processReferralMutation.isPending}
              >
                Claim Welcome Bonus
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show invitation preview for non-authenticated users
  return (
    <Card className="mb-6 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Users className="w-16 h-16 text-purple-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-purple-800">
          You've Been Invited!
        </CardTitle>
        <p className="text-purple-600">
          Join SoapBox and start your spiritual journey with friends
        </p>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="bg-white rounded-lg p-4 border border-purple-100">
          <p className="text-sm text-gray-600 mb-3">
            Someone you know wants to grow in faith together. 
            Sign up now to get started!
          </p>
          <div className="flex justify-center space-x-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Gift className="w-4 h-4 mr-1" />
              250 Welcome Points
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Daily Bible Reading
            </Badge>
          </div>
        </div>
        
        <Button 
          onClick={() => window.location.href = '/api/login'}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
        >
          Join SoapBox Now
        </Button>
      </CardContent>
    </Card>
  );
}