import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import SpiritualAssessmentResults from '../components/SpiritualAssessmentResults';

export default function SpiritualAssessmentResultsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/users/spiritual-assessment-results'],
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Debug logging
  React.useEffect(() => {
    if (error) {
      
    }
    if (data) {
      
    }
  }, [data, error]);

  const handleContinue = () => {
    // Check if user came from profile edit page
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo');
    
    if (returnTo === 'profile' || referrer.includes('/profile')) {
      window.location.href = '/profile';
    } else {
      window.location.href = '/dashboard';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <h3 className="text-lg font-semibold">Loading Your Results</h3>
              <p className="text-muted-foreground text-center">
                Retrieving your spiritual assessment results...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">No Results Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              You haven't completed a spiritual assessment yet.
            </p>
            <Button 
              onClick={() => window.location.href = '/spiritual-assessment'}
              className="w-full"
            >
              Take Assessment Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || !data.assessmentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">No Assessment Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              No spiritual assessment data found. Please complete the assessment first.
            </p>
            <Button 
              onClick={() => window.location.href = '/spiritual-assessment'}
              className="w-full"
            >
              Take Assessment Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get returnTo parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('returnTo');

  return (
    <SpiritualAssessmentResults
      assessmentData={data.assessmentData}
      spiritualGifts={data.spiritualGifts || []}
      spiritualProfile={data.spiritualProfile || {}}
      welcomeContent={data.welcomeContent}
      spiritualMaturityLevel={data.spiritualMaturityLevel || 'growing'}
      onContinue={handleContinue}
      returnTo={returnTo || undefined}
    />
  );
}