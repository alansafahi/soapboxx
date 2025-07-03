import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Shield, Smartphone, Mail, Key, QrCode, Copy, Check, AlertTriangle, Crown } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

interface TwoFactorOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
  userRole: string;
  churchName?: string;
}

interface TotpSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export default function TwoFactorOnboarding({ 
  isOpen, 
  onComplete, 
  userRole, 
  churchName 
}: TwoFactorOnboardingProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"intro" | "choose" | "setup" | "verify" | "complete">("intro");
  const [selectedMethod, setSelectedMethod] = useState<"totp" | "email">("totp");
  const [totpSetupData, setTotpSetupData] = useState<TotpSetup | null>(null);
  const [totpToken, setTotpToken] = useState("");
  const [emailToken, setEmailToken] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [backupCodesSaved, setBackupCodesSaved] = useState(false);

  const roleDisplayNames: Record<string, string> = {
    'super_admin': 'Super Administrator',
    'lead_pastor': 'Lead Pastor',
    'pastor': 'Pastor',
    'minister': 'Minister',
    'admin': 'Administrator',
    'staff': 'Staff Member'
  };

  // Setup TOTP mutation
  const setupTotpMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/auth/2fa/setup/totp", {
        method: "POST",
      });
      return response;
    },
    onSuccess: (data: TotpSetup) => {
      setTotpSetupData(data);
      setStep("verify");
    },
    onError: (error) => {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Verify TOTP mutation
  const verifyTotpMutation = useMutation({
    mutationFn: async (token: string) => {
      return apiRequest("/api/auth/2fa/verify/totp", {
        method: "POST",
        body: JSON.stringify({ token }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      setStep("complete");
      setTimeout(() => {
        onComplete();
      }, 3000);
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send email token mutation
  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/auth/2fa/send-email", {
        method: "POST",
      });
    },
    onSuccess: () => {
      setStep("verify");
    },
    onError: (error) => {
      toast({
        title: "Send Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Verify email token mutation
  const verifyEmailMutation = useMutation({
    mutationFn: async (token: string) => {
      return apiRequest("/api/auth/2fa/verify/email", {
        method: "POST",
        body: JSON.stringify({ token }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      setStep("complete");
      setTimeout(() => {
        onComplete();
      }, 3000);
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
      toast({
        title: "Copied",
        description: "Secret key copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleMethodSelection = (method: "totp" | "email") => {
    setSelectedMethod(method);
    setStep("setup");
    if (method === "totp") {
      setupTotpMutation.mutate();
    } else {
      sendEmailMutation.mutate();
    }
  };

  const handleVerifyToken = () => {
    if (selectedMethod === "totp" && totpToken) {
      verifyTotpMutation.mutate(totpToken);
    } else if (selectedMethod === "email" && emailToken) {
      verifyEmailMutation.mutate(emailToken);
    }
  };

  const saveBackupCodes = () => {
    if (totpSetupData?.backupCodes) {
      const codesText = totpSetupData.backupCodes.join('\n');
      const blob = new Blob([codesText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `soapbox-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setBackupCodesSaved(true);
      toast({
        title: "Backup Codes Saved",
        description: "Store these codes in a secure location",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center space-x-3 mb-2">
            <img 
              src="/attached_assets/SoapBox logo_1749686315479.jpeg" 
              alt="SoapBox Logo" 
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-[#5A2671]" />
              <DialogTitle className="text-[#5A2671]">Security Requirement: Two-Factor Authentication</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-center">
            Enhanced security is required for your new role as {roleDisplayNames[userRole] || userRole}
            {churchName && ` at ${churchName}`}
          </DialogDescription>
        </DialogHeader>

        {step === "intro" && (
          <div className="space-y-6">
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>Security Enhancement Required</strong><br />
                Your account has been upgraded to <strong>{roleDisplayNames[userRole] || userRole}</strong>, 
                which requires two-factor authentication for enhanced security.
              </AlertDescription>
            </Alert>

            <Card className="border-[#5A2671]/20">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-[#5A2671]" />
                  <CardTitle className="text-lg">Why 2FA is Required</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#5A2671] rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Protect Church Data</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Administrative roles have access to sensitive member information
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#5A2671] rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Financial Security</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Access to donation records and financial data requires extra protection
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#5A2671] rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Pastoral Confidentiality</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Prayer requests and private communications need secure access
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => setStep("choose")}
              className="w-full bg-[#5A2671] hover:bg-[#4A1F61] text-white"
            >
              Set Up Two-Factor Authentication
            </Button>
          </div>
        )}

        {step === "choose" && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Choose Your Authentication Method</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Select how you'd like to receive verification codes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-32 flex flex-col items-center justify-center space-y-3 border-2 hover:border-[#5A2671] hover:bg-[#5A2671]/5"
                onClick={() => handleMethodSelection("totp")}
                disabled={setupTotpMutation.isPending}
              >
                <Smartphone className="h-8 w-8 text-[#5A2671]" />
                <div className="text-center">
                  <p className="font-medium">Authenticator App</p>
                  <p className="text-xs text-gray-500">Google Authenticator, Authy, etc.</p>
                  <Badge variant="secondary" className="mt-1">Recommended</Badge>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-32 flex flex-col items-center justify-center space-y-3 border-2 hover:border-[#5A2671] hover:bg-[#5A2671]/5"
                onClick={() => handleMethodSelection("email")}
                disabled={sendEmailMutation.isPending}
              >
                <Mail className="h-8 w-8 text-[#5A2671]" />
                <div className="text-center">
                  <p className="font-medium">Email Verification</p>
                  <p className="text-xs text-gray-500">Receive codes via email</p>
                </div>
              </Button>
            </div>
          </div>
        )}

        {step === "setup" && selectedMethod === "totp" && setupTotpMutation.isPending && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A2671] mx-auto"></div>
              <p>Setting up authenticator app...</p>
            </div>
          </div>
        )}

        {step === "setup" && selectedMethod === "email" && sendEmailMutation.isPending && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A2671] mx-auto"></div>
              <p>Sending verification email...</p>
            </div>
          </div>
        )}

        {step === "verify" && selectedMethod === "totp" && totpSetupData && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Use your authenticator app to scan this code
              </p>
            </div>

            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qr">QR Code</TabsTrigger>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              </TabsList>
              
              <TabsContent value="qr" className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <img 
                      src={totpSetupData.qrCodeUrl} 
                      alt="QR Code for 2FA setup"
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Open your authenticator app and scan this QR code
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={totpSetupData.manualEntryKey} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(totpSetupData.manualEntryKey)}
                    >
                      {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter this key manually in your authenticator app
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totp-token">Enter verification code from your app</Label>
                <Input
                  id="totp-token"
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <Button
                onClick={handleVerifyToken}
                disabled={!totpToken || totpToken.length !== 6 || verifyTotpMutation.isPending}
                className="w-full bg-[#5A2671] hover:bg-[#4A1F61] text-white"
              >
                {verifyTotpMutation.isPending ? "Verifying..." : "Verify and Complete Setup"}
              </Button>
            </div>

            {/* Backup Codes Section */}
            {totpSetupData.backupCodes && (
              <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Key className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-lg">Backup Codes</CardTitle>
                  </div>
                  <CardDescription>
                    Save these codes now - you'll need them if you lose access to your authenticator
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm mb-4">
                    {totpSetupData.backupCodes.map((code, index) => (
                      <div key={index} className="p-2 bg-white dark:bg-gray-800 rounded border">
                        {code}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={saveBackupCodes}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {backupCodesSaved ? "Codes Saved ✓" : "Download Backup Codes"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {step === "verify" && selectedMethod === "email" && (
          <div className="space-y-6">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                We've sent a verification code to your email. Enter it below to complete setup.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-token">Enter verification code from email</Label>
                <Input
                  id="email-token"
                  value={emailToken}
                  onChange={(e) => setEmailToken(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <Button
                onClick={handleVerifyToken}
                disabled={!emailToken || emailToken.length !== 6 || verifyEmailMutation.isPending}
                className="w-full bg-[#5A2671] hover:bg-[#4A1F61] text-white"
              >
                {verifyEmailMutation.isPending ? "Verifying..." : "Verify and Complete Setup"}
              </Button>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
                <Shield className="h-12 w-12 text-green-600" />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                Two-Factor Authentication Enabled!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your account is now secured with {selectedMethod === 'totp' ? 'authenticator app' : 'email'} verification.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                You can now access all features available to {roleDisplayNames[userRole] || userRole} members.
                Your next login will require verification.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}