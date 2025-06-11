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
  const { toast } = useToast();

  // Get email verification status
  const { data: verificationStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/auth/email-verification-status'],
  });

  // Get development token for testing
  const { data: devToken } = useQuery({
    queryKey: ['/api/auth/dev/verification-token'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Check for token in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, []);

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
          {verifyEmailMutation.isSuccess ? (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Email verified successfully! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Development Helper - Show verification code */}
              {devToken && (
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>Testing Mode:</strong> Latest verification code: <span className="font-mono text-lg">{devToken}</span>
                    <br />
                    <small>Check your email spam folder or use this code directly.</small>
                  </AlertDescription>
                </Alert>
              )}

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