import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Smartphone, MessageSquare, Shield, CheckCircle, Loader2, X } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface SMSVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  onVerificationSuccess?: () => void;
  title?: string;
  description?: string;
}

export default function SMSVerificationModal({
  isOpen,
  onClose,
  userEmail,
  onVerificationSuccess,
  title = "Verify Your Phone Number",
  description = "Add an extra layer of security to your account by verifying your phone number."
}: SMSVerificationModalProps) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [formattedPhone, setFormattedPhone] = useState('');
  const { toast } = useToast();

  // Countdown timer for resend
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) {
      return phoneNumber;
    } else if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  // Send SMS verification code
  const sendCodeMutation = useMutation({
    mutationFn: async () => {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      return await apiRequest('/api/auth/send-sms-verification', 'POST', { 
        phoneNumber: cleanPhone,
        email: userEmail
      });
    },
    onSuccess: (data) => {
      setFormattedPhone(data.formattedPhone);
      setStep('code');
      setTimeRemaining(60); // 1 minute cooldown
      toast({
        title: "Code Sent!",
        description: `Verification code sent to ${data.formattedPhone}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Code",
        description: error.message || "Please check your phone number and try again.",
        variant: "destructive",
      });
    },
  });

  // Verify SMS code
  const verifyCodeMutation = useMutation({
    mutationFn: async () => {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      return await apiRequest('/api/auth/verify-sms', 'POST', { 
        code: verificationCode,
        phoneNumber: cleanPhone,
        email: userEmail
      });
    },
    onSuccess: () => {
      toast({
        title: "Phone Verified!",
        description: "Your phone number has been successfully verified.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      onVerificationSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired verification code.",
        variant: "destructive",
      });
    },
  });

  const handleSendCode = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }
    sendCodeMutation.mutate();
  };

  const handleVerifyCode = () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }
    verifyCodeMutation.mutate();
  };

  const handleResendCode = () => {
    if (timeRemaining === 0) {
      sendCodeMutation.mutate();
    }
  };

  const resetModal = () => {
    setStep('phone');
    setPhoneNumber('');
    setVerificationCode('');
    setTimeRemaining(0);
    setFormattedPhone('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'phone' ? (
              <>
                <Smartphone className="w-5 h-5 text-purple-600" />
                {title}
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5 text-purple-600" />
                Enter Verification Code
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'phone' ? (
            // Phone number input step
            <>
              <div className="text-center space-y-2">
                <Shield className="w-12 h-12 text-purple-600 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  We'll send a 6-digit code to verify your phone number. Standard message rates may apply.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  maxLength={14}
                />
              </div>

              <Button 
                onClick={handleSendCode}
                disabled={sendCodeMutation.isPending || phoneNumber.length < 14}
                className="w-full"
              >
                {sendCodeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </>
          ) : (
            // Verification code input step
            <>
              <div className="text-center space-y-2">
                <MessageSquare className="w-12 h-12 text-purple-600 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit code to {formattedPhone}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg letter-spacing-wide"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setStep('phone')}
                  className="flex-1"
                >
                  Change Number
                </Button>
                <Button 
                  onClick={handleVerifyCode}
                  disabled={verifyCodeMutation.isPending || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {verifyCodeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={handleResendCode}
                  disabled={timeRemaining > 0 || sendCodeMutation.isPending}
                  className="text-sm"
                >
                  {timeRemaining > 0 ? (
                    `Resend code in ${timeRemaining}s`
                  ) : sendCodeMutation.isPending ? (
                    'Sending...'
                  ) : (
                    'Resend code'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}