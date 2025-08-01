import { useState, useEffect } from "react";
import { useLocation, useRouter } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { formatErrorForToast } from "../lib/errorUtils";
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Building2 } from "lucide-react";
import { useImmediateAuth } from "../lib/immediateAuth";

export default function SignupPage() {
  const { isAuthenticated, isLoading: authLoading } = useImmediateAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const inviteType = urlParams.get('invite');
  const communityId = urlParams.get('community');
  const role = urlParams.get('role');
  
  const isStaffInvite = inviteType === 'staff';

  // Redirect authenticated users who are accepting staff invitations
  useEffect(() => {
    if (!authLoading && isAuthenticated && isStaffInvite) {
      handleStaffInviteAcceptance();
    } else if (!authLoading && isAuthenticated && !isStaffInvite) {
      setLocation('/');
    }
  }, [isAuthenticated, authLoading, isStaffInvite]);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleStaffInviteAcceptance = async () => {
    if (!communityId || !role) {
      toast({
        title: "Invalid Invitation", 
        description: "This invitation link appears to be invalid or expired.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiRequest(`/api/communities/${communityId}/staff/accept`, 'POST', {
        role
      });

      if (response.success) {
        toast({
          title: "Position Accepted!",
          description: `You have successfully accepted the ${response.title} position. Welcome to the team!`,
          variant: "default",
        });
        
        // Redirect to staff management or community dashboard
        setLocation(`/community-administration?communityId=${communityId}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: formatErrorForToast(error),
        variant: "destructive", 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Register the new user
      const signupResponse = await apiRequest('/api/auth/register', 'POST', {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        // Include staff invitation context if present
        ...(isStaffInvite && { 
          staffInvite: { communityId, role } 
        })
      });

      if (signupResponse.success) {
        if (isStaffInvite && communityId && role) {
          toast({
            title: "Registration Successful!",
            description: "Your account has been created with a pending staff invitation. Please log in to activate your position.",
            variant: "default",
          });
          // Redirect to login with staff invitation context
          setLocation(`/login?staffInvite=true&communityId=${communityId}&role=${role}`);
        } else {
          // Regular signup - redirect to onboarding flow with pre-populated data
          toast({
            title: "Let's Get You Started!",
            description: "Complete your profile setup to personalize your SoapBox experience.",
            variant: "default",
          });
          // Pass registration data to onboarding for auto-population
          const onboardingParams = new URLSearchParams({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            mobileNumber: formData.mobileNumber || ''
          });
          setLocation(`/onboarding?${onboardingParams.toString()}`);
        }
      }
    } catch (error: any) {
      console.log('Signup error caught:', error);
      console.log('Error status:', error.status);
      console.log('Error response:', error.response);
      console.log('Error message:', error.message);
      
      // Handle account already exists scenario
      if (error.status === 409 || (error.response && error.response.errorType === 'account_exists')) {
        toast({
          title: "Account Already Exists",
          description: "It looks like you already have an account with this email. Would you like to sign in instead?",
          variant: "default",
        });
        return;
      }
      
      // Handle case where user already exists with staff invitation
      if (error.message && error.message.includes('already exists') && isStaffInvite) {
        toast({
          title: "Account Already Exists",
          description: "You already have an account. Please log in to accept your staff position.",
          variant: "default",
        });
        setLocation('/login');
        return;
      }
      
      toast({
        title: "Registration Failed",
        description: formatErrorForToast(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated user with staff invite, show acceptance flow
  if (isAuthenticated && isStaffInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Accept Staff Position
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              You've been invited to join as a staff member
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Staff Position Details
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Role: <span className="font-medium">{role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Community ID: {communityId}
                </p>
              </div>
              
              <Button 
                onClick={handleStaffInviteAcceptance}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Accepting Position...
                  </>
                ) : (
                  "Accept Position"
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setLocation('/')}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular signup form for new users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {isStaffInvite ? "Join as Staff Member" : "Join SoapBox Super App"}
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isStaffInvite 
              ? "Create your account to accept your staff position" 
              : "Create your account to get started"
            }
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className="pl-10"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {isStaffInvite && (
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Staff Invitation
                  </span>
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  After creating your account, you'll automatically be added as a staff member.
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                isStaffInvite ? "Create Account & Accept Position" : "Create Account"
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setLocation('/login')}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}