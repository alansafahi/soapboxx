import { useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Mail, X, AlertCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

export default function EmailVerificationBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { toast } = useToast();

  // Check user's email verification status
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false
  });

  // Resend verification email mutation
  const resendVerification = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/auth/resend-verification', 'POST');
    },
    onSuccess: () => {
      toast({
        title: "Verification Email Sent",
        description: "Check your inbox for the verification email.",
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

  // Don't show banner if dismissed, user is verified, or no user data
  if (dismissed || !user || user.emailVerified) {
    return null;
  }

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
      <AlertCircle className="h-4 w-4" />
      <div className="flex items-center justify-between w-full">
        <AlertDescription className="flex-1">
          <strong>Verify your email address</strong> to secure your account and receive important notifications about your faith community.
        </AlertDescription>
        <div className="flex items-center space-x-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => resendVerification.mutate()}
            disabled={resendVerification.isPending}
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            <Mail className="h-3 w-3 mr-1" />
            {resendVerification.isPending ? "Sending..." : "Resend Email"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
            className="text-amber-600 hover:text-amber-800 hover:bg-amber-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
}