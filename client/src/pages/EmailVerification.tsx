import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function EmailVerification() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState("");
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const { toast } = useToast();

  // Get email verification status
  const { data: verificationStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/auth/email-verification-status'],
  });



  // Check for URL parameters from email verification links
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    
    if (urlToken) {
      setToken(urlToken);
    }
    
    // Handle direct verification results from email links
    if (success === 'true') {
      setVerificationComplete(true);
      setVerificationSuccess(true);
      toast({
        title: "Email Verified Successfully!",
        description: "Your email has been verified. You can now log in to your account.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      setTimeout(() => navigate("/login"), 3000);
    } else if (error) {
      setVerificationComplete(true);
      setVerificationSuccess(false);
      
      let errorMessage = "Email verification failed. Please try again.";
      let errorTitle = "Verification Failed";
      
      switch (error) {
        case 'missing_token':
          errorTitle = "Missing Verification Token";
          errorMessage = "The verification link is missing a token. Please use the resend button below.";
          break;
        case 'invalid_token':
          errorTitle = "Invalid Verification Token";
          errorMessage = "This verification link is invalid or has already been used.";
          break;
        case 'expired_token':
          errorTitle = "Verification Link Expired";
          errorMessage = "This verification link has expired. Please request a new one.";
          break;
        case 'verification_failed':
          errorTitle = "Verification Failed";
          errorMessage = "Email verification failed due to a system error. Please try again.";
          break;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [navigate, toast]);

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: async (verificationToken: string) => {
      return await apiRequest('/api/auth/verify-email', 'POST', { token: verificationToken });
    },
    onSuccess: () => {
      toast({
        title: "Email Verified",
        description: "Your email has been verified successfully!",
      });
      setTimeout(() => navigate("/"), 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify email",
        variant: "destructive",
      });
    },
  });

  // Resend verification email mutation
  const resendMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/auth/resend-verification', 'POST');
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Verification email has been sent to your inbox.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
    },
  });

  const handleVerifyEmail = () => {
    if (!token.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter your verification token",
        variant: "destructive",
      });
      return;
    }
    verifyEmailMutation.mutate(token);
  };

  const handleResendEmail = () => {
    resendMutation.mutate();
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#5A2671]" />
          <span className="text-gray-600 dark:text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  // If email is already verified, redirect to home
  if (verificationStatus?.emailVerified) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-[#5A2671] rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
              We've sent a verification link to your email address. Please check your inbox and enter the verification token below.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {verificationComplete ? (
            <div className="text-center space-y-6">
              {verificationSuccess ? (
                <div className="space-y-4">
                  <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                      Email Verified Successfully!
                    </h2>
                    <p className="text-green-700 dark:text-green-300 mb-4">
                      Your email has been verified. You can now access your SoapBox account.
                    </p>
                    <Button 
                      onClick={() => navigate("/login")}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Continue to Login
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-12 w-12 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
                      Verification Failed
                    </h2>
                    <p className="text-red-700 dark:text-red-300 mb-4">
                      There was an issue verifying your email. Please try requesting a new verification link.
                    </p>
                    <Button 
                      onClick={handleResendEmail}
                      disabled={resendMutation.isPending}
                      className="bg-[#5A2671] hover:bg-[#4A1F5A] text-white"
                    >
                      {resendMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send New Verification Email"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : verifyEmailMutation.isSuccess ? (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Email verified successfully! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Gmail Delivery Issue:</strong> If you don't receive the email within 5 minutes, 
                  check your spam folder or use verification code: <span className="font-mono font-bold">836987</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Verification Token
                </Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Enter your verification token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="border-gray-300 dark:border-gray-600 focus:border-[#5A2671] focus:ring-[#5A2671]"
                />
              </div>

              {verifyEmailMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {verifyEmailMutation.error?.message || "Failed to verify email"}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleVerifyEmail}
                disabled={verifyEmailMutation.isPending || !token.trim()}
                className="w-full bg-[#5A2671] hover:bg-[#4A1F5A] text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {verifyEmailMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>

              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Didn't receive the email?
                </p>
                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  disabled={resendMutation.isPending}
                  className="text-[#5A2671] border-[#5A2671] hover:bg-[#5A2671] hover:text-white"
                >
                  {resendMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/")}
                  className="text-gray-600 dark:text-gray-400 hover:text-[#5A2671]"
                >
                  Back to Dashboard
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}