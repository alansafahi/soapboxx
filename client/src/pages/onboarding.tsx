import React from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import OnboardingFlow from '@/components/OnboardingFlow';
import { useToast } from '@/hooks/use-toast';

export default function OnboardingPage() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute('/onboarding/:token?');
  const { toast } = useToast();

  // Extract invite token from URL
  const inviteToken = params?.token;
  
  // Extract registration data from URL parameters for auto-population
  const urlParams = new URLSearchParams(window.location.search);
  const prefilledData = {
    firstName: urlParams.get('firstName') || '',
    lastName: urlParams.get('lastName') || '',
    email: urlParams.get('email') || '',
    mobileNumber: urlParams.get('mobileNumber') || ''
  };

  // Fetch invite details if token exists
  const { data: inviteData } = useQuery({
    queryKey: ['/api/invites/details', inviteToken],
    enabled: !!inviteToken,
    retry: false
  });

  const handleOnboardingComplete = async (userData: any) => {
    try {
      // Check if user came from registration (has prefilled data) vs direct onboarding access
      const isFromRegistration = prefilledData.email !== '';
      
      if (isFromRegistration) {
        // User came from registration flow - complete profile update instead of re-registering
        const profileResponse = await fetch('/api/auth/complete-onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            role: userData.role,
            gender: userData.gender,
            ageRange: userData.ageRange,
            spiritualStage: userData.spiritualStage,
            ministryInterests: userData.ministryInterests,
            volunteerInterest: userData.volunteerInterest,
            churchAffiliation: userData.churchAffiliation,
            inviteToken: inviteToken
          })
        });

        if (profileResponse.ok) {
          // If user completed spiritual assessment, save it
          if (userData.spiritualAssessment) {
            try {
              await fetch('/api/users/spiritual-onboarding', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                  assessmentData: userData.spiritualAssessment.assessmentData,
                  baselineEMIState: userData.spiritualAssessment.baselineEMIState,
                  generateWelcomeContent: true
                }),
              });
            } catch (assessmentError) {
              
              // Don't fail the entire onboarding for this
            }
          }

          toast({
            title: "Welcome to SoapBox!",
            description: userData.spiritualAssessment 
              ? "Your profile and spiritual assessment have been completed successfully."
              : "Your profile has been completed successfully.",
          });
          setLocation('/dashboard');
        } else {
          throw new Error('Failed to complete profile setup');
        }
      } else {
        // Direct onboarding access - attempt full registration
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            ...userData,
            inviteToken: inviteToken
          })
        });

        if (response.ok) {
          const result = await response.json();
          
          // If registration successful, attempt login
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              email: userData.email,
              password: userData.password
            })
          });

          if (loginResponse.ok) {
            // If user completed spiritual assessment, save it
            if (userData.spiritualAssessment) {
              try {
                await fetch('/api/users/spiritual-onboarding', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                  body: JSON.stringify({
                    assessmentData: userData.spiritualAssessment.assessmentData,
                    baselineEMIState: userData.spiritualAssessment.baselineEMIState,
                    generateWelcomeContent: true
                  }),
                });
              } catch (assessmentError) {
                
                // Don't fail the entire onboarding for this
              }
            }

            toast({
              title: "Welcome to SoapBox!",
              description: userData.spiritualAssessment 
                ? "Your account and spiritual assessment have been saved successfully."
                : "Your account has been created and you're now logged in.",
            });
            setLocation('/dashboard');
          } else {
            // Registration succeeded but login failed - redirect to login
            toast({
              title: "Account Created!",
              description: "Please log in with your new credentials.",
            });
            setLocation('/login');
          }
        } else {
          const error = await response.json();
          throw new Error(error.message || 'Registration failed');
        }
      }
    } catch (error) {
      
      throw error; // Re-throw so OnboardingFlow can handle it
    }
  };

  return (
    <OnboardingFlow
      inviteToken={inviteToken}
      inviterName={inviteData?.inviterName || ''}
      churchName={inviteData?.churchName || ''}
      prefilledData={prefilledData}
      onComplete={handleOnboardingComplete}
    />
  );
}