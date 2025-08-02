import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Shield, Phone, MessageSquare, Clock, RefreshCw } from 'lucide-react';

interface SMSVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber?: string;
  onVerificationComplete?: () => void;
  mode?: 'initial' | 'profile' | 'security';
}

export function SMSVerificationModal({ 
  isOpen, 
  onClose, 
  phoneNumber: initialPhoneNumber = '', 
  onVerificationComplete,
  mode = 'profile'
}: SMSVerificationModalProps) {
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [verificationCode, setVerificationCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [attempts, setAttempts] = useState(3);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Timer for code expiration
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  // Send SMS verification code
  const sendCodeMutation = useMutation({
    mutationFn: (data: { phoneNumber: string }) => 
      apiRequest('/api/auth/send-sms-verification', 'POST', data),
    onSuccess: (data) => {
      setStep('verify');
      setTimeLeft(600); // 10 minutes
      setAttempts(data.attemptsRemaining || 3);
      toast({
        title: "Verification Code Sent",
        description: `We've sent a 6-digit code to ${phoneNumber}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Code",
        description: error.message || "Please check your phone number and try again.",
        variant: "destructive",
      });
    }
  });

  // Verify SMS code
  const verifyCodeMutation = useMutation({
    mutationFn: (data: { code: string }) => 
      apiRequest('/api/auth/verify-sms-code', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Phone Verified!",
        description: "Your phone number has been successfully verified.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      onVerificationComplete?.();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid code. Please try again.",
        variant: "destructive",
      });
      setVerificationCode('');
    }
  });

  // Resend verification code
  const resendCodeMutation = useMutation({
    mutationFn: () => apiRequest('/api/auth/resend-sms-verification', 'POST', {}),
    onSuccess: (data) => {
      setTimeLeft(600); // Reset to 10 minutes
      setAttempts(data.attemptsRemaining || 3);
      setVerificationCode('');
      toast({
        title: "Code Resent",
        description: `A new verification code has been sent to ${phoneNumber}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Resend",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleSendCode = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }
    
    // Clean phone number for API
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    sendCodeMutation.mutate({ phoneNumber: cleanPhone });
  };

  const handleVerifyCode = () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }
    
    verifyCodeMutation.mutate({ code: verificationCode });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'initial': return 'Verify Your Phone Number';
      case 'security': return 'Security Verification';
      default: return 'Phone Verification';
    }
  };

  const getModalDescription = () => {
    switch (mode) {
      case 'initial': 
        return 'Phone verification helps keep your account secure and enables SMS notifications for prayer requests and community updates.';
      case 'security': 
        return 'For your security, please verify your phone number to continue.';
      default: 
        return 'Verify your phone number to enable SMS notifications and enhance account security.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getModalDescription()}
          </p>

          {step === 'phone' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="pl-10"
                    maxLength={14}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  We'll send a 6-digit verification code to this number
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendCode}
                  disabled={sendCodeMutation.isPending || !phoneNumber.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {sendCodeMutation.isPending ? "Sending..." : "Send Code"}
                </Button>
              </div>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  We've sent a 6-digit code to <strong>{phoneNumber}</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>

              {timeLeft > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  Code expires in {formatTime(timeLeft)}
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('phone')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleVerifyCode}
                  disabled={verifyCodeMutation.isPending || !verificationCode.trim() || verificationCode.length !== 6}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {verifyCodeMutation.isPending ? "Verifying..." : "Verify"}
                </Button>
              </div>

              {timeLeft === 0 || attempts < 3 ? (
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => resendCodeMutation.mutate()}
                    disabled={resendCodeMutation.isPending || attempts <= 0}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${resendCodeMutation.isPending ? 'animate-spin' : ''}`} />
                    {resendCodeMutation.isPending ? "Resending..." : "Resend Code"}
                  </Button>
                  {attempts <= 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Maximum attempts reached. Please try again later.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}