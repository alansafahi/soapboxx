import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import OnboardingSpiritualFlow from '../components/OnboardingSpiritualFlow';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

export default function SpiritualAssessmentPage() {
  const [isStarted, setIsStarted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveSpiritualDataMutation = useMutation({
    mutationFn: async (spiritualData: any) => {
      return apiRequest('POST', '/api/users/spiritual-onboarding', {
        assessmentData: spiritualData.assessment,
        baselineEMIState: spiritualData.baseline,
        generateWelcomeContent: true
      });
    },
    onSuccess: () => {
      toast({
        title: "Spiritual Profile Updated",
        description: "Your personalized spiritual content has been generated.",
      });
      // Redirect to dashboard or profile
      window.location.href = '/dashboard';
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to save your spiritual assessment. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAssessmentComplete = async (spiritualData: any) => {
    await saveSpiritualDataMutation.mutateAsync(spiritualData);
  };

  if (isStarted) {
    return (
      <OnboardingSpiritualFlow
        onComplete={handleAssessmentComplete}
        onBack={() => setIsStarted(false)}
        userProfile={{
          firstName: "User", // Will be populated from actual user data
          lastName: "",
          role: "member"
        }}
        isRoleBasedMandatory={false} // Direct access - optional for all roles
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Spiritual Assessment
            </CardTitle>
            <p className="text-lg text-muted-foreground">
              Complete 120-question spiritual evaluation for personalized ministry placement and growth planning
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Comprehensive Assessment Benefits:</h3>
                <ul className="text-left space-y-2 text-sm text-muted-foreground">
                  <li>• Detailed spiritual gifts analysis with rankings (1-20)</li>
                  <li>• Ministry role matchings and placement recommendations</li>
                  <li>• Leadership development insights and growth pathways</li>
                  <li>• Shadow gifts and hidden strengths identification</li>
                  <li>• Personalized discipleship and mentoring guidance</li>
                  <li>• Community placement for optimal ministry fit</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Time Required:</strong> About 20-25 minutes<br/>
                  <strong>Questions:</strong> 120 comprehensive questions across 12 sections<br/>
                  <strong>Privacy:</strong> Your responses are kept confidential
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Button 
                onClick={() => setIsStarted(true)}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Start Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}