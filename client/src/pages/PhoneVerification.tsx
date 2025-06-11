import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Mail, Shield, CheckCircle, AlertTriangle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function PhoneVerification() {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  // Check SMS service configuration
  const { data: smsConfig } = useQuery({
    queryKey: ["/api/auth/sms/config"],
    retry: false,
  });

  // Send phone verification
  const sendVerificationMutation = useMutation({
    mutationFn: async (phone: string) => {
      return apiRequest("/api/auth/phone/send-verification", "POST", { phoneNumber: phone });
    },
    onSuccess: () => {
      setVerificationSent(true);
      toast({
        title: "Verification Code Sent",
        description: "Check your phone for the verification code",
      });
    },
    onError: (error) => {
      toast({
        title: "Send Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Verify phone number
  const verifyPhoneMutation = useMutation({
    mutationFn: async ({ code, phone }: { code: string; phone: string }) => {
      return apiRequest("/api/auth/phone/verify", "POST", { verificationCode: code, phoneNumber: phone });
    },
    onSuccess: () => {
      toast({
        title: "Phone Verified",
        description: "Your phone number has been successfully verified",
      });
      setVerificationSent(false);
      setPhoneNumber("");
      setVerificationCode("");
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendVerification = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    sendVerificationMutation.mutate(phoneNumber);
  };

  const handleVerifyCode = () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Verification Code Required",
        description: "Please enter the 6-digit code",
        variant: "destructive",
      });
      return;
    }
    verifyPhoneMutation.mutate({ code: verificationCode, phone: phoneNumber });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Smartphone className="h-8 w-8 text-[#5A2671]" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Phone Verification
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Add and verify your phone number for enhanced security and SMS notifications in the SoapBox Super App.
          </p>
        </div>

        {/* Two-Tier Authentication Explanation */}
        <Card className="border-[#5A2671]/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-[#5A2671]" />
              <span>Two-Tier Authentication System</span>
            </CardTitle>
            <CardDescription>
              Understanding the security levels in SoapBox Super App
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Regular Members</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Email verification for account security and communications
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-[#5A2671]/10 rounded-lg">
                <Smartphone className="h-5 w-5 text-[#5A2671] mt-0.5" />
                <div>
                  <p className="font-medium text-[#5A2671]">Enhanced Security (Optional)</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Phone verification via Twilio SMS for additional protection
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Privileged Roles</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    TOTP authenticator apps required for Admin, Pastor, and leadership roles
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMS Configuration Status */}
        {smsConfig && (
          <Card className={`border-2 ${smsConfig.configured ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className={`h-5 w-5 ${smsConfig.configured ? 'text-green-600' : 'text-amber-600'}`} />
                <span>SMS Service Status</span>
                <Badge variant={smsConfig.configured ? "default" : "secondary"}>
                  {smsConfig.configured ? "Ready" : "Setup Required"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {smsConfig.configured ? (
                <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="h-4 w-4" />
                  <span>Twilio SMS service is properly configured and ready to use</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start space-x-2 text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    <div>
                      <p>SMS verification requires Twilio configuration</p>
                      <p className="text-sm">Missing: {smsConfig.missingCredentials?.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Phone Verification Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Phone Number</CardTitle>
            <CardDescription>
              Verify your phone number to enable SMS notifications and enhanced security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!verificationSent ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="text-lg"
                  />
                  <p className="text-xs text-gray-500">
                    Include country code (e.g., +1 for US numbers)
                  </p>
                </div>

                <Button
                  onClick={handleSendVerification}
                  disabled={sendVerificationMutation.isPending || !smsConfig?.configured}
                  className="w-full bg-[#5A2671] hover:bg-[#4A1F61] text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendVerificationMutation.isPending ? "Sending..." : "Send Verification Code"}
                </Button>

                {!smsConfig?.configured && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      SMS verification is not available until Twilio credentials are configured.
                      Contact your administrator to enable this feature.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    We've sent a 6-digit verification code to {phoneNumber}. 
                    Enter the code below to verify your phone number.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="text-center text-xl tracking-widest"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleVerifyCode}
                    disabled={verifyPhoneMutation.isPending || verificationCode.length !== 6}
                    className="flex-1 bg-[#5A2671] hover:bg-[#4A1F61] text-white"
                  >
                    {verifyPhoneMutation.isPending ? "Verifying..." : "Verify Phone Number"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setVerificationSent(false);
                      setVerificationCode("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Didn't receive a code? Check your phone and try again, or contact support.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-[#5A2671]" />
                <span>Security Benefits</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#5A2671] rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Account Protection</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Additional verification layer for sensitive actions
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#5A2671] rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive important updates and alerts via text
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#5A2671] rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Emergency Contact</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Alternative communication method for church leadership
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-[#5A2671]" />
                <span>How It Works</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#5A2671] text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <p className="font-medium">Enter Phone Number</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Provide your mobile number with country code
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#5A2671] text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <p className="font-medium">Receive SMS Code</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get a 6-digit verification code via Twilio SMS
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#5A2671] text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <p className="font-medium">Verify & Activate</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enter the code to verify and activate SMS features
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}