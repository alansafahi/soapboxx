import { useState, useEffect } from "react";
import { useImmediateAuth } from "../lib/immediateAuth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";
import { formatErrorForToast } from "../lib/errorUtils";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Separator } from "../components/ui/separator";
import { useLocation } from "wouter";
import AutomatedChurchClaiming from "../components/AutomatedChurchClaiming";

export default function LoginPage() {
  const { isAuthenticated, isLoading: authLoading } = useImmediateAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      window.location.replace('/');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [claimableChurch, setClaimableChurch] = useState(null);
  const [showChurchClaiming, setShowChurchClaiming] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    firstName: "",
    lastName: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Direct login with session establishment
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        }).catch(err => {
          throw new Error('Network error during login. Please check your connection.');
        });

        if (loginResponse.ok) {
          const userData = await loginResponse.json().catch(err => {
            throw new Error('Invalid response from server');
          });
          
          toast({
            title: "Welcome back!",
            description: `Logged in as ${userData.user.firstName} ${userData.user.lastName}`,
          });
          
          // Force authentication state refresh
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          
          // Immediate redirect with authentication state refresh
          window.location.replace('/');
          return;
        } else {
          let errorMessage = 'Login failed';
          let toastVariant: "default" | "destructive" = "destructive";
          let toastTitle = "Login Failed";
          
          try {
            const errorData = await loginResponse.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
            
            // Handle email verification required with friendly message
            if (loginResponse.status === 403 && errorData.requiresVerification) {
              toastTitle = "📧 Email Verification Required";
              errorMessage = errorData.userFriendlyMessage || "Please check your email and click the verification link before logging in. Don't forget to check your spam folder!";
              toastVariant = "default";
            }
          } catch (parseError) {
          }
          
          toast({
            title: toastTitle,
            description: errorMessage,
            variant: toastVariant
          });
        }
      } else {
        // Registration
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            username: formData.username,
            firstName: formData.firstName,
            lastName: formData.lastName,
          })
        });

        const registerData = await registerResponse.json();
        
        if (registerResponse.ok) {
          toast({
            title: "Welcome to SoapBox!",
            description: "Your account has been created. Please check your email to verify your account before signing in.",
          });

          // Check if there's a claimable church
          if (registerData.claimableChurch) {
            setClaimableChurch(registerData.claimableChurch);
            setShowChurchClaiming(true);
          } else {
            setIsLogin(true);
            setFormData(prev => ({ ...prev, password: "", username: "", firstName: "", lastName: "" }));
          }
        } else {
          throw new Error(registerData.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error: any) {
      toast({
        title: isLogin ? "Login Error" : "Registration Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Password reset email sent",
          description: "Check your email for password reset instructions.",
        });

        setShowForgotPassword(false);
        setForgotPasswordEmail("");
      } else {
        throw new Error(result.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Redirect to Google OAuth
      window.location.href = '/api/auth/google';
    } catch (error: any) {
      toast({
        title: "Google sign-in unavailable",
        description: "We couldn't connect to Google right now. Please try email login or try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      // Redirect to Apple OAuth  
      window.location.href = '/api/auth/apple';
    } catch (error: any) {
      toast({
        title: "Apple sign-in unavailable",
        description: "We couldn't connect to Apple right now. Please try email login or try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleChurchClaimed = () => {
    setShowChurchClaiming(false);
    setClaimableChurch(null);
    setIsLogin(true);
    setFormData({
      email: "",
      password: "",
      username: "",
      firstName: "",
      lastName: "",
    });
  };

  const handleSkipClaiming = () => {
    setShowChurchClaiming(false);
    setClaimableChurch(null);
    setIsLogin(true);
    setFormData(prev => ({ ...prev, password: "", username: "", firstName: "", lastName: "" }));
  };

  if (showChurchClaiming && claimableChurch) {
    return (
      <AutomatedChurchClaiming
        claimableChurch={claimableChurch}
        userEmail={formData.email}
        onChurchClaimed={handleChurchClaimed}
        onSkip={handleSkipClaiming}
      />
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Reset Password
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-400">
              Enter your email to receive reset instructions
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgotEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="forgotEmail"
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Email"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="inline-flex items-center text-sm text-purple-600 hover:text-purple-500 font-medium"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <p className="text-slate-600 dark:text-slate-400">
            {isLogin ? "Sign in to your SoapBox account" : "Join the SoapBox community"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required={!isLogin}
                      placeholder="John"
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
                      required={!isLogin}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      required={!isLogin}
                      placeholder="johndoe"
                      className="pl-10"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="john@example.com"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
            </Button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-purple-600 hover:text-purple-500 font-medium"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* TEMPORARILY HIDDEN - Google and Apple Sign-In (preserve code for future use)
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-800 px-2 text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleAppleLogin}
                disabled={isLoading}
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </Button>
            </div>
          </div>
          */}

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-purple-600 hover:text-purple-500 font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}