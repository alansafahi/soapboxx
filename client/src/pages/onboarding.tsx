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

  // Fetch invite details if token exists
  const { data: inviteData } = useQuery({
    queryKey: ['/api/invites/details', inviteToken],
    enabled: !!inviteToken,
    retry: false
  });

  const handleOnboardingComplete = async (userData: any) => {
    try {
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
          toast({
            title: "Welcome to SoapBox!",
            description: "Your account has been created and you're now logged in.",
          });
          
          // Redirect to dashboard
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
    } catch (error) {
      console.error('Onboarding error:', error);
      throw error; // Re-throw so OnboardingFlow can handle it
    }
  };

  return (
    <OnboardingFlow
      inviteToken={inviteToken}
      inviterName={inviteData?.inviterName}
      churchName={inviteData?.churchName}
      onComplete={handleOnboardingComplete}
    />
  );
}