import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Smartphone, Mail, Key, QrCode, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TwoFactorStatus {
  enabled: boolean;
  method: string | null;
  availableMethods: string[];
}

interface TotpSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export default function SecuritySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [totpToken, setTotpToken] = useState("");
  const [emailToken, setEmailToken] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [setupStep, setSetupStep] = useState<"choose" | "totp" | "email" | "verify">("choose");
  const [selectedMethod, setSelectedMethod] = useState<"totp" | "email">("totp");
  const [totpSetupData, setTotpSetupData] = useState<TotpSetup | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Get 2FA status
  const { data: twoFactorStatus, isLoading } = useQuery<TwoFactorStatus>({
    queryKey: ["/api/auth/2fa/status"],
  });

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
      setSetupStep("verify");
      toast({
        title: "TOTP Setup",
        description: "Scan the QR code with your authenticator app",
      });
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
      queryClient.invalidateQueries({ queryKey: ["/api/auth/2fa/status"] });
      setSetupStep("choose");
      setTotpToken("");
      toast({
        title: "2FA Enabled",
        description: "TOTP authentication has been enabled successfully",
      });
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
      setSetupStep("verify");
      toast({
        title: "Email Sent",
        description: "Verification code sent to your email",
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
      queryClient.invalidateQueries({ queryKey: ["/api/auth/2fa/status"] });
      setSetupStep("choose");
      setEmailToken("");
      toast({
        title: "2FA Enabled",
        description: "Email authentication has been enabled successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Disable 2FA mutation
  const disable2FAMutation = useMutation({
    mutationFn: async ({ token, method }: { token: string; method: string }) => {
      return apiRequest("/api/auth/2fa/disable", {
        method: "POST",
        body: JSON.stringify({ token, method }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/2fa/status"] });
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled",
      });
    },
    onError: (error) => {
      toast({
        title: "Disable Failed",
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

  const handleSetupMethod = (method: "totp" | "email") => {
    setSelectedMethod(method);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A2671]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Security Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account security and two-factor authentication</p>
      </div>

      <div className="grid gap-6">
        {/* 2FA Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-[#5A2671]" />
              <CardTitle>Two-Factor Authentication</CardTitle>
            </div>
            {twoFactorStatus?.enabled && (
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                Enabled
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </CardDescription>

            {!twoFactorStatus?.enabled ? (
              <Dialog open={setupStep !== "choose"} onOpenChange={() => setSetupStep("choose")}>
                <DialogTrigger asChild>
                  <Button className="bg-[#5A2671] hover:bg-[#4A1F61] text-white">
                    Enable Two-Factor Authentication
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                    <DialogDescription>
                      Choose your preferred authentication method
                    </DialogDescription>
                  </DialogHeader>

                  {setupStep === "choose" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          className="h-24 flex flex-col items-center justify-center space-y-2 border-2 hover:border-[#5A2671] hover:bg-[#5A2671]/5"
                          onClick={() => handleSetupMethod("totp")}
                          disabled={setupTotpMutation.isPending}
                        >
                          <Smartphone className="h-6 w-6" />
                          <span className="font-medium">Authenticator App</span>
                          <span className="text-xs text-gray-500">Google Authenticator, Authy, etc.</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="h-24 flex flex-col items-center justify-center space-y-2 border-2 hover:border-[#5A2671] hover:bg-[#5A2671]/5"
                          onClick={() => handleSetupMethod("email")}
                          disabled={sendEmailMutation.isPending}
                        >
                          <Mail className="h-6 w-6" />
                          <span className="font-medium">Email Verification</span>
                          <span className="text-xs text-gray-500">Receive codes via email</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {setupStep === "verify" && selectedMethod === "totp" && totpSetupData && (
                    <div className="space-y-6">
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
                              Scan this QR code with your authenticator app
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

                      <div className="space-y-2">
                        <Label htmlFor="totp-token">Enter verification code</Label>
                        <Input
                          id="totp-token"
                          value={totpToken}
                          onChange={(e) => setTotpToken(e.target.value)}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                        />
                      </div>

                      <Button
                        onClick={handleVerifyToken}
                        disabled={!totpToken || verifyTotpMutation.isPending}
                        className="w-full bg-[#5A2671] hover:bg-[#4A1F61] text-white"
                      >
                        {verifyTotpMutation.isPending ? "Verifying..." : "Verify and Enable"}
                      </Button>
                    </div>
                  )}

                  {setupStep === "verify" && selectedMethod === "email" && (
                    <div className="space-y-4">
                      <Alert>
                        <Mail className="h-4 w-4" />
                        <AlertDescription>
                          We've sent a verification code to your email. Enter it below to enable email 2FA.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <Label htmlFor="email-token">Enter verification code</Label>
                        <Input
                          id="email-token"
                          value={emailToken}
                          onChange={(e) => setEmailToken(e.target.value)}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                        />
                      </div>

                      <Button
                        onClick={handleVerifyToken}
                        disabled={!emailToken || verifyEmailMutation.isPending}
                        className="w-full bg-[#5A2671] hover:bg-[#4A1F61] text-white"
                      >
                        {verifyEmailMutation.isPending ? "Verifying..." : "Verify and Enable"}
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">
                        Two-Factor Authentication is enabled
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Method: {twoFactorStatus.method === 'totp' ? 'Authenticator App' : 'Email Verification'}
                      </p>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Disable
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                        <DialogDescription>
                          Enter a verification code to disable 2FA
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Verification Code</Label>
                          <Input
                            value={totpToken}
                            onChange={(e) => setTotpToken(e.target.value)}
                            placeholder="Enter verification code"
                          />
                        </div>
                        <Button
                          onClick={() => disable2FAMutation.mutate({ 
                            token: totpToken, 
                            method: twoFactorStatus.method! 
                          })}
                          disabled={!totpToken || disable2FAMutation.isPending}
                          variant="destructive"
                          className="w-full"
                        >
                          {disable2FAMutation.isPending ? "Disabling..." : "Disable 2FA"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Backup Codes Card - Only show if TOTP is enabled */}
        {twoFactorStatus?.enabled && twoFactorStatus.method === 'totp' && totpSetupData?.backupCodes && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-[#5A2671]" />
                <CardTitle>Backup Codes</CardTitle>
              </div>
              <CardDescription>
                Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {totpSetupData.backupCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-gray-100 dark:bg-gray-800 rounded border">
                    {code}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => copyToClipboard(totpSetupData.backupCodes.join('\n'))}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All Codes
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}