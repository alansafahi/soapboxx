import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { 
  Smartphone, 
  MessageSquare, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Users,
  BarChart3,
  Send,
  Copy,
  QrCode,
  CreditCard,
  Heart,
  Gift
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

// Donation amounts for different frequencies  
const DONATION_AMOUNTS_ONETIME = [25, 50, 100, 250, 500, 1000];
const DONATION_AMOUNTS_RECURRING = [10, 25, 50, 100, 250, 500];

// Payment Form Component
function PaymentForm({ 
  amount, 
  donationData, 
  onSuccess 
}: { 
  amount: number; 
  donationData: any; 
  onSuccess: (paymentIntentId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required'
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg bg-gray-50">
        <PaymentElement />
      </div>
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        {isProcessing ? "Processing..." : `Complete ${donationData.isRecurring ? `${donationData.recurringFrequency} ` : ''}Donation ($${amount})`}
      </Button>
    </form>
  );
}

export default function SMSGiving() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedFund, setSelectedFund] = useState("general");
  const [isSettingUp, setIsSettingUp] = useState(false);
  
  // Recurring donation state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("monthly");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch SMS giving configuration
  const { data: smsConfig, isLoading } = useQuery({
    queryKey: ['/api/sms-giving/config'],
  });

  // Fetch SMS giving statistics
  const { data: smsStats } = useQuery({
    queryKey: ['/api/sms-giving/stats'],
  });

  // Create payment intent mutation
  const createPaymentIntent = useMutation({
    mutationFn: async (donationData: any) => {
      return apiRequest('POST', '/api/create-payment-intent', {
        ...donationData,
        recurringFrequency: isRecurring ? recurringFrequency : undefined
      });
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setShowPayment(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to initialize payment",
        variant: "destructive",
      });
    }
  });

  // Send SMS giving instruction
  const sendSMSMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; amount: string; fund: string }) => {
      return apiRequest('POST', '/api/sms-giving/send-instructions', data);
    },
    onSuccess: () => {
      toast({
        title: "SMS Sent Successfully",
        description: "Giving instructions have been sent to the provided phone number.",
      });
      setPhoneNumber("");
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ['/api/sms-giving/stats'] });
    },
    onError: () => {
      toast({
        title: "Failed to Send SMS",
        description: "Please check the phone number and try again.",
        variant: "destructive",
      });
    }
  });

  // Setup SMS giving service
  const setupSMSMutation = useMutation({
    mutationFn: async (config: any) => {
      return apiRequest('/api/sms-giving/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
    },
    onSuccess: () => {
      toast({
        title: "SMS Giving Configured",
        description: "SMS giving service has been successfully set up.",
      });
      setIsSettingUp(false);
      queryClient.invalidateQueries({ queryKey: ['/api/sms-giving/config'] });
    }
  });

  const handleSendSMS = () => {
    if (!phoneNumber || !amount) {
      toast({
        title: "Missing Information",
        description: "Please provide both phone number and amount.",
        variant: "destructive",
      });
      return;
    }

    sendSMSMutation.mutate({
      phoneNumber,
      amount,
      fund: selectedFund
    });
  };

  const getCurrentAmount = () => {
    return selectedAmount || parseFloat(customAmount) || 0;
  };

  const getDonationAmounts = () => {
    return isRecurring ? DONATION_AMOUNTS_RECURRING : DONATION_AMOUNTS_ONETIME;
  };

  const handleDonateNow = () => {
    const amount = getCurrentAmount();
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount",
        variant: "destructive",
      });
      return;
    }

    const donationData = {
      amount,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
    };

    createPaymentIntent.mutate(donationData);
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    toast({
      title: "Donation Successful!",
      description: `Thank you for your ${isRecurring ? `${recurringFrequency} ` : ''}donation of $${getCurrentAmount()}`,
    });
    
    // Reset form
    setSelectedAmount(null);
    setCustomAmount("");
    setShowPayment(false);
    setClientSecret(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "The information has been copied to your clipboard.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Donation</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enable convenient mobile giving through text messages. Perfect for tech-forward churches.
          </p>
        </div>

        {/* SMS Service Status */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-6 w-6 text-blue-600" />
              <span>Donation Service Status</span>
              {smsConfig?.isActive ? (
                <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Current status of your donation service and configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            {smsConfig?.isActive ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{smsConfig.shortCode}</div>
                  <div className="text-sm text-gray-600">SMS Short Code</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{smsStats?.totalDonors || 0}</div>
                  <div className="text-sm text-gray-600">Active SMS Donors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">${(smsStats?.totalAmount || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total SMS Donations</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Donation Service Not Configured</h3>
                <p className="text-gray-600 mb-4">Set up donation service to enable mobile donations</p>
                <Button 
                  onClick={() => setIsSettingUp(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Donation Service
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="donate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="donate">Donate Now</TabsTrigger>
            <TabsTrigger value="send">Send Instructions</TabsTrigger>
            <TabsTrigger value="keywords">Donation Keywords</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Donate Now Tab */}
          <TabsContent value="donate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="h-6 w-6 text-blue-600" />
                  <span>Make a Donation</span>
                </CardTitle>
                <CardDescription>
                  Support our mission through secure online giving
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!showPayment ? (
                  <>
                    {/* Recurring Toggle */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Recurring Donation</Label>
                        <p className="text-xs text-gray-600 mt-1">Make a lasting impact with regular giving</p>
                      </div>
                      <Switch
                        checked={isRecurring}
                        onCheckedChange={setIsRecurring}
                      />
                    </div>

                    {/* Frequency Selection */}
                    {isRecurring && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Frequency</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {['weekly', 'monthly', 'quarterly', 'annually'].map((freq) => (
                            <Button
                              key={freq}
                              variant={recurringFrequency === freq ? "default" : "outline"}
                              onClick={() => setRecurringFrequency(freq)}
                              className="text-sm"
                            >
                              {freq.charAt(0).toUpperCase() + freq.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Amount Selection */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">
                        {isRecurring ? `Suggested ${recurringFrequency} amounts for sustained impact` : 'Suggested amounts'}
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        {getDonationAmounts().map((presetAmount) => (
                          <Button
                            key={presetAmount}
                            variant={selectedAmount === presetAmount ? "default" : "outline"}
                            onClick={() => {
                              setSelectedAmount(presetAmount);
                              setCustomAmount("");
                            }}
                            className="h-12 text-base"
                          >
                            ${presetAmount}
                          </Button>
                        ))}
                      </div>

                      {/* Custom Amount */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Custom Amount</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            placeholder="Enter custom amount"
                            value={customAmount}
                            onChange={(e) => {
                              setCustomAmount(e.target.value);
                              setSelectedAmount(null);
                            }}
                            className="pl-10"
                            min="1"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Donate Button */}
                    <Button
                      onClick={handleDonateNow}
                      disabled={getCurrentAmount() <= 0 || createPaymentIntent.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      {createPaymentIntent.isPending ? (
                        "Processing..."
                      ) : (
                        <>
                          <Heart className="h-4 w-4 mr-2" />
                          {isRecurring ? `Set up ${recurringFrequency} donation` : 'Donate now'} 
                          {getCurrentAmount() > 0 && ` ($${getCurrentAmount()})`}
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <h3 className="text-lg font-semibold mb-2">
                        Complete Your {isRecurring ? `${recurringFrequency.charAt(0).toUpperCase() + recurringFrequency.slice(1)} ` : ''}Donation
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">${getCurrentAmount()}</p>
                    </div>
                    
                    {clientSecret && (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <PaymentForm
                          amount={getCurrentAmount()}
                          donationData={{ isRecurring, recurringFrequency }}
                          onSuccess={handlePaymentSuccess}
                        />
                      </Elements>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPayment(false);
                        setClientSecret(null);
                      }}
                      className="w-full"
                    >
                      ← Back to donation options
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Send SMS Instructions */}
          <TabsContent value="send" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="h-5 w-5" />
                    <span>Send Donation Instructions</span>
                  </CardTitle>
                  <CardDescription>
                    Send personalized donation instructions to a member
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Suggested Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="100"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fund">Fund</Label>
                    <select
                      id="fund"
                      value={selectedFund}
                      onChange={(e) => setSelectedFund(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">General Fund</option>
                      <option value="building">Building Fund</option>
                      <option value="missions">Missions</option>
                      <option value="youth">Youth Ministry</option>
                    </select>
                  </div>

                  <Button 
                    onClick={handleSendSMS}
                    disabled={sendSMSMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {sendSMSMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <MessageSquare className="h-4 w-4 mr-2" />
                    )}
                    Send Instructions
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How Donation Works</CardTitle>
                  <CardDescription>
                    Simple steps for your congregation to give via text
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                      <div>
                        <div className="font-medium">Text Your Amount</div>
                        <div className="text-sm text-gray-600">Send "GIVE 50" to {smsConfig?.shortCode || '12345'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                      <div>
                        <div className="font-medium">Secure Payment Link</div>
                        <div className="text-sm text-gray-600">Receive a secure link to complete your donation</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                      <div>
                        <div className="font-medium">Instant Confirmation</div>
                        <div className="text-sm text-gray-600">Get immediate confirmation and receipt</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium text-gray-700 mb-2">Quick Share</div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`Text GIVE [amount] to ${smsConfig?.shortCode || '12345'} to donate instantly!`)}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm">
                        <QrCode className="h-4 w-4 mr-1" />
                        QR Code
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Donation Keywords */}
          <TabsContent value="keywords" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { keyword: "GIVE", description: "General donation", example: "GIVE 50", fund: "General Fund" },
                { keyword: "BUILDING", description: "Building fund donation", example: "BUILDING 100", fund: "Building Fund" },
                { keyword: "MISSIONS", description: "Missions donation", example: "MISSIONS 25", fund: "Missions" },
                { keyword: "YOUTH", description: "Youth ministry donation", example: "YOUTH 30", fund: "Youth Ministry" },
                { keyword: "TITHE", description: "Tithe payment", example: "TITHE 200", fund: "Tithe" },
                { keyword: "OFFERING", description: "Special offering", example: "OFFERING 75", fund: "Special Offering" }
              ].map((item, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {item.keyword}
                      </span>
                      <Badge variant="outline">{item.fund}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Example:</div>
                      <div className="font-mono text-sm">{item.example}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Donations Today</p>
                      <p className="text-2xl font-bold">${(smsStats?.todayAmount || 0).toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold">{smsStats?.activeUsers || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                      <p className="text-2xl font-bold">{smsStats?.avgResponseTime || '2.3'}s</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold">{smsStats?.successRate || 98}%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>Latest donations received</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: "2 min ago", amount: "$50", fund: "General", phone: "***-***-1234" },
                    { time: "15 min ago", amount: "$100", fund: "Building", phone: "***-***-5678" },
                    { time: "1 hour ago", amount: "$25", fund: "Youth", phone: "***-***-9012" },
                    { time: "2 hours ago", amount: "$200", fund: "Tithe", phone: "***-***-3456" }
                  ].map((donation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">{donation.amount}</div>
                          <div className="text-sm text-gray-600">{donation.fund} • {donation.phone}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{donation.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Donation Service Configuration</CardTitle>
                <CardDescription>
                  Configure your donation service settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="shortcode">SMS Short Code</Label>
                      <Input
                        id="shortcode"
                        value={smsConfig?.shortCode || "12345"}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Contact support to change your short code</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="response-template">Default Response Template</Label>
                      <textarea
                        id="response-template"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue="Thank you for your donation! Click here to complete: [LINK]"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Auto-Receipt Settings</Label>
                      <div className="space-y-2 mt-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Send email receipts automatically</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Send SMS confirmation</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Enable recurring donation setup via SMS</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="min-amount">Minimum Donation Amount</Label>
                      <Input
                        id="min-amount"
                        type="number"
                        defaultValue="5"
                        className="max-w-20"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Settings className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}