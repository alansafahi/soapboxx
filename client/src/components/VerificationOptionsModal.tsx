import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Mail, Smartphone, Shield, CheckCircle, Clock, Users } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import SMSVerificationModal from "./SMSVerificationModal";
import { useQuery } from "@tanstack/react-query";

interface VerificationOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  currentUser?: {
    emailVerified?: boolean;
    phoneVerified?: boolean;
    hasPhoneNumber?: boolean;
  };
  onVerificationComplete?: () => void;
}

export default function VerificationOptionsModal({
  isOpen,
  onClose,
  userEmail,
  currentUser,
  onVerificationComplete
}: VerificationOptionsModalProps) {
  const [showSMSModal, setShowSMSModal] = useState(false);
  const { toast } = useToast();

  // Get verification status
  const { data: verificationStatus, refetch } = useQuery({
    queryKey: ['/api/auth/sms-verification-status'],
    enabled: isOpen,
  });

  const emailVerified = currentUser?.emailVerified || false;
  const phoneVerified = currentUser?.phoneVerified || verificationStatus?.phoneVerified || false;
  const hasPhoneNumber = currentUser?.hasPhoneNumber || verificationStatus?.hasPhoneNumber || false;

  const handleSMSVerificationSuccess = () => {
    refetch();
    onVerificationComplete?.();
    toast({
      title: "Verification Complete!",
      description: "Your phone number has been verified successfully.",
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  const resendEmailVerification = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      
      if (response.ok) {
        toast({
          title: "Email Sent",
          description: "Check your inbox for the verification link.",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to Send",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Account Verification Options
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Choose your preferred verification method to secure your account and unlock all features.
              </AlertDescription>
            </Alert>

            {/* Email Verification Option */}
            <Card className={`transition-all ${emailVerified ? 'border-green-200 bg-green-50' : 'border-purple-200'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-purple-600" />
                    Email Verification
                  </div>
                  {emailVerified ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {emailVerified 
                    ? "Your email address has been verified."
                    : "Verify your email address to secure your account."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Required for password reset</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Basic account security</span>
                </div>
                
                {!emailVerified && (
                  <Button 
                    onClick={resendEmailVerification}
                    variant="outline" 
                    className="w-full"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Email Verification
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* SMS Verification Option */}
            <Card className={`transition-all ${phoneVerified ? 'border-green-200 bg-green-50' : 'border-orange-200'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-orange-600" />
                    Phone Verification
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                      Enhanced Security
                    </Badge>
                  </div>
                  {phoneVerified ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      Optional
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {phoneVerified 
                    ? `Your phone number (${verificationStatus?.formattedPhone}) has been verified.`
                    : "Add an extra layer of security with phone verification."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-orange-600" />
                  <span>Enhanced account security</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span>Required for leadership roles</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-orange-600" />
                  <span>Two-factor authentication ready</span>
                </div>
                
                {!phoneVerified && (
                  <Button 
                    onClick={() => setShowSMSModal(true)}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    {hasPhoneNumber ? 'Verify Phone Number' : 'Add & Verify Phone'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Verification Level Indicator */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
                  <Shield className="w-4 h-4" />
                  Current Security Level: {
                    emailVerified && phoneVerified ? 'Maximum Security' :
                    emailVerified ? 'Basic Security' :
                    'Incomplete'
                  }
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: emailVerified && phoneVerified ? '100%' : 
                             emailVerified ? '60%' : '20%' 
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SMSVerificationModal
        isOpen={showSMSModal}
        onClose={() => setShowSMSModal(false)}
        userEmail={userEmail}
        onVerificationSuccess={handleSMSVerificationSuccess}
      />
    </>
  );
}