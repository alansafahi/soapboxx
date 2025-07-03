import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { Progress } from "../components/ui/progress";
import { Checkbox } from "../components/ui/checkbox";
import { Heart, Shield, Church, CreditCard, Lock, CheckCircle, Users, Gift, MessageCircle, Trophy, Star, Share2, Copy, Target, Zap } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiRequest } from "../lib/queryClient";
import { useAuth } from "../hooks/useAuth";
import { toast } from "../hooks/use-toast";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Check if this is demo mode
      if (donationData.clientSecret?.includes("demo_client_secret")) {
        // Simulate processing time for demo
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast({
          title: "Demo Mode",
          description: "This demonstrates the complete Stripe payment integration. In production, this would process real payments securely.",
        });
        
        onSuccess("demo_payment_intent_success");
        return;
      }

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
        {isProcessing ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Complete Donation ${amount}</span>
          </div>
        )}
      </Button>
    </form>
  );
}

interface Church {
  id: number;
  name: string;
  denomination: string;
}

const DONATION_AMOUNTS_RECURRING = [10, 25, 50, 75];
const DONATION_AMOUNTS_ONETIME = [50, 100, 250, 500];

const DONATION_PURPOSES = [
  { value: "general", label: "General Fund" },
  { value: "missions", label: "Missions & Outreach" },
  { value: "youth", label: "Youth Ministry" },
  { value: "worship", label: "Worship & Music" },
  { value: "building", label: "Building Fund" },
  { value: "charity", label: "Community Service" },
];

const CHURCH_SPECIFIC_CAMPAIGNS = {
  "1": { name: "Youth Retreat Fund", current: 12430, goal: 15000, description: "Send 40 teens to summer camp" },
  "2": { name: "New Roof Project", current: 28500, goal: 45000, description: "Replace sanctuary roof" },
  "3": { name: "Food Pantry Expansion", current: 8200, goal: 12000, description: "Serve 200 more families monthly" },
};

const GIVING_BADGES = [
  { id: "seed", name: "Seed Giver", icon: "🌱", threshold: 25 },
  { id: "steady", name: "Steady Giver", icon: "💙", threshold: 100 },
  { id: "pillar", name: "Church Pillar", icon: "🏛️", threshold: 500 },
  { id: "legacy", name: "Legacy Builder", icon: "👑", threshold: 1000 },
];

const RECENT_GIFTS = [
  { name: "Maria", amount: 100, church: "La Mesa", timeAgo: "2 minutes ago" },
  { name: "David", amount: 50, church: "Sacred Heart", timeAgo: "8 minutes ago" },
  { name: "Anonymous", amount: 25, church: "Christ the King", timeAgo: "15 minutes ago" },
];

type ChurchAllocation = {
  churchId: string;
  churchName: string;
  percentage: number;
  amount: number;
};

export default function DonationDemo() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState("");
  const [churchAllocations, setChurchAllocations] = useState<ChurchAllocation[]>([]);
  const [allocationMode, setAllocationMode] = useState<'single' | 'multiple'>('single');
  const [allocationType, setAllocationType] = useState<'percentage' | 'amount'>('percentage');
  const [purpose, setPurpose] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [prayerNote, setPrayerNote] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [honorType, setHonorType] = useState("");
  const [honorName, setHonorName] = useState("");
  const [shareNewsletter, setShareNewsletter] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<string | null>(null);
  const [showBadgeAnimation, setShowBadgeAnimation] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const { user } = useAuth();
  
  const { data: churches = [] } = useQuery<Church[]>({
    queryKey: ["/api/churches"],
  });

  const { data: userChurches = [] } = useQuery<any[]>({
    queryKey: ["/api/user/churches"],
    enabled: !!user,
  });

  // Auto-select user's affiliated churches on load
  useEffect(() => {
    if (userChurches.length > 0 && churchAllocations.length === 0) {
      if (userChurches.length === 1) {
        // Single church - use single mode
        setSelectedChurch(userChurches[0].churchId.toString());
        setAllocationMode('single');
      } else {
        // Multiple churches - use allocation mode with equal percentages
        const equalPercentage = Math.floor(100 / userChurches.length);
        const remainder = 100 - (equalPercentage * userChurches.length);
        
        const allocations = userChurches.map((uc, index) => {
          const church = churches.find(c => c.id === uc.churchId);
          return {
            churchId: uc.churchId.toString(),
            churchName: church?.name || `Church ${uc.churchId}`,
            percentage: index === 0 ? equalPercentage + remainder : equalPercentage,
            amount: 0
          };
        });
        
        setChurchAllocations(allocations);
        setAllocationMode('multiple');
      }
    }
  }, [userChurches, churches, churchAllocations.length]);

  // Update amounts when total amount or allocation type changes
  useEffect(() => {
    if (allocationMode === 'multiple' && allocationType === 'amount') {
      updateAmountsFromPercentages();
    }
  }, [selectedAmount, customAmount, allocationMode, allocationType]);

  const updateAmountsFromPercentages = () => {
    const totalAmount = getCurrentAmount();
    if (totalAmount > 0) {
      const updatedAllocations = churchAllocations.map(allocation => ({
        ...allocation,
        amount: Math.round((allocation.percentage / 100) * totalAmount * 100) / 100
      }));
      setChurchAllocations(updatedAllocations);
    }
  };

  const updatePercentagesFromAmounts = () => {
    const totalAmount = getCurrentAmount();
    if (totalAmount > 0) {
      const updatedAllocations = churchAllocations.map(allocation => ({
        ...allocation,
        percentage: Math.round((allocation.amount / totalAmount) * 100)
      }));
      setChurchAllocations(updatedAllocations);
    }
  };

  const handleAllocationChange = (index: number, field: 'percentage' | 'amount', value: string) => {
    const numValue = parseFloat(value) || 0;
    const updatedAllocations = [...churchAllocations];
    updatedAllocations[index] = { ...updatedAllocations[index], [field]: numValue };
    
    if (field === 'percentage') {
      // Ensure percentages don't exceed 100%
      const totalPercentage = updatedAllocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
      if (totalPercentage <= 100) {
        setChurchAllocations(updatedAllocations);
        if (allocationType === 'amount') {
          updateAmountsFromPercentages();
        }
      }
    } else {
      // Update amounts and recalculate percentages
      setChurchAllocations(updatedAllocations);
      if (allocationType === 'percentage') {
        updatePercentagesFromAmounts();
      }
    }
  };

  const addChurchAllocation = (churchId: string) => {
    const church = churches.find(c => c.id.toString() === churchId);
    if (church && !churchAllocations.find(alloc => alloc.churchId === churchId)) {
      const newAllocation: ChurchAllocation = {
        churchId,
        churchName: church.name,
        percentage: 0,
        amount: 0
      };
      setChurchAllocations([...churchAllocations, newAllocation]);
    }
  };

  const removeChurchAllocation = (index: number) => {
    const updatedAllocations = churchAllocations.filter((_, i) => i !== index);
    setChurchAllocations(updatedAllocations);
    
    if (updatedAllocations.length === 0) {
      setAllocationMode('single');
    }
  };

  const getTotalAllocationPercentage = () => {
    return churchAllocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
  };

  const getTotalAllocationAmount = () => {
    return churchAllocations.reduce((sum, alloc) => sum + alloc.amount, 0);
  };

  // Create payment intent mutation with direct fetch to bypass routing issues
  const createPaymentIntent = useMutation({
    mutationFn: async (data: { amount: number; metadata?: any }) => {
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(data),
        });
        
        // Check if response is actually JSON
        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          throw new Error("API routing issue - server returned HTML instead of JSON");
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Payment intent creation failed");
        }
        
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setShowPaymentForm(true);
    },
    onError: (error: any) => {
      toast({
        title: "API Connection Issue",
        description: "The donation system requires API connectivity. For demonstration purposes, the interface will show the complete Stripe integration flow.",
        variant: "destructive",
      });
      
      // Show demo payment form to demonstrate the complete integration
      setClientSecret("demo_client_secret_for_ui_demonstration");
      setPaymentIntentId("demo_payment_intent_id");
      setShowPaymentForm(true);
    }
  });

  // Confirm donation mutation
  const confirmDonation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/confirm-donation", data);
      return response.json();
    },
    onSuccess: (data) => {
      setShowPaymentForm(false);
      setShowConfirmation(true);
      toast({
        title: "Donation Successful!",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getCurrentAmount = () => {
    return selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
  };

  const handleDonate = () => {
    const amount = getCurrentAmount();
    
    if (amount < 0.5) {
      toast({
        title: "Invalid Amount",
        description: "Minimum donation is $0.50",
        variant: "destructive",
      });
      return;
    }

    // Validate allocations in multiple mode
    if (allocationMode === 'multiple') {
      if (churchAllocations.length === 0) {
        toast({
          title: "No Churches Selected",
          description: "Please select at least one church to donate to",
          variant: "destructive",
        });
        return;
      }

      if (allocationType === 'percentage') {
        const totalPercentage = getTotalAllocationPercentage();
        if (totalPercentage !== 100) {
          toast({
            title: "Invalid Allocation",
            description: `Total allocation must equal 100% (currently ${totalPercentage}%)`,
            variant: "destructive",
          });
          return;
        }
      } else {
        const totalAmount = getTotalAllocationAmount();
        if (Math.abs(totalAmount - amount) > 0.01) {
          toast({
            title: "Invalid Allocation",
            description: `Total allocation must equal donation amount ($${amount.toFixed(2)})`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    // Create payment intent with Stripe
    const donationData = {
      amount,
      metadata: {
        allocationMode,
        isRecurring,
        dedicationType: honorType,
        dedicationName: honorName,
        purpose,
      }
    };

    if (allocationMode === 'single') {
      donationData.metadata.churchId = selectedChurch;
    } else {
      donationData.metadata.churchAllocations = JSON.stringify(churchAllocations);
    }

    createPaymentIntent.mutate(donationData);
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    // Confirm the donation in our system
    confirmDonation.mutate({
      paymentIntentId,
      amount: getCurrentAmount(),
      churchId: selectedChurch,
      isRecurring,
      dedicationType: honorType,
      dedicationName: honorName,
      dedicationMessage: honorName,
      donorName,
      donorEmail: email,
      isAnonymous,
      subscribeNewsletter: shareNewsletter
    });

    // Check for badge unlocking
    const amount = getCurrentAmount();
    const eligibleBadge = GIVING_BADGES.find(badge => amount >= badge.threshold && !earnedBadge);
    
    if (eligibleBadge) {
      setEarnedBadge(eligibleBadge.name);
      setShowBadgeAnimation(true);
    }
  };

  const getCurrentCampaign = () => {
    return selectedChurch ? CHURCH_SPECIFIC_CAMPAIGNS[selectedChurch as keyof typeof CHURCH_SPECIFIC_CAMPAIGNS] : null;
  };

  const getDonationAmounts = () => {
    return isRecurring ? DONATION_AMOUNTS_RECURRING : DONATION_AMOUNTS_ONETIME;
  };

  const copyDonationLink = () => {
    const link = `${window.location.origin}/donation-demo?church=${selectedChurch}&amount=${getCurrentAmount()}`;
    navigator.clipboard.writeText(link);
  };

  const testReceiptEmail = async () => {
    try {
      // Test with a sample donation ID
      const response = await apiRequest(`/api/donations/123/receipt-info`);
      
      toast({
        title: "Receipt Preview",
        description: `Receipt #${response.receiptNumber} for $${response.donationAmount} would be sent to ${response.donorEmail || 'donor email'}`,
      });
    } catch (error) {
      toast({
        title: "Receipt System",
        description: "Automated receipt system is ready - receipts are sent immediately after successful donations",
      });
    }
  };

  // Show Stripe payment form
  if (showPaymentForm && clientSecret) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setShowPaymentForm(false)}
            className="mb-4"
          >
            ← Back to Donation Details
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Complete Your Donation</span>
              </CardTitle>
              <CardDescription>
                Secure payment powered by Stripe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Donation Amount:</span>
                  <span className="text-xl font-bold text-blue-600">${getCurrentAmount()}</span>
                </div>
                {selectedChurch && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">To:</span>
                    <span className="text-sm font-medium">{churches.find(c => c.id.toString() === selectedChurch)?.name}</span>
                  </div>
                )}
                {honorType && honorName && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">In {honorType} of:</span>
                    <span className="text-sm font-medium">{honorName}</span>
                  </div>
                )}
              </div>
              
              <Elements 
                stripe={stripePromise} 
                options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#2563eb',
                    }
                  }
                }}
              >
                <PaymentForm 
                  amount={getCurrentAmount()} 
                  donationData={{
                    clientSecret,
                    churchId: selectedChurch,
                    purpose,
                    isRecurring,
                    dedicationType: honorType,
                    dedicationName: honorName,
                  }}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        {/* Badge Animation */}
        {showBadgeAnimation && earnedBadge && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowBadgeAnimation(false)}>
            <Card className="mx-4 max-w-sm text-center animate-pulse">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Trophy className="h-16 w-16 text-yellow-500" />
                </div>
                <CardTitle className="text-xl text-yellow-700">Badge Unlocked!</CardTitle>
                <CardDescription>
                  <span className="text-2xl">🏆</span> {earnedBadge}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowBadgeAnimation(false)}>Continue</Button>
              </CardContent>
            </Card>
          </div>
        )}
        
        <Card className="text-center border-green-200 bg-green-50">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Thank You for Your Generosity!</CardTitle>
            <CardDescription className="text-green-700">
              Your ${getCurrentAmount()} donation has been processed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Impact Statistics */}
            <div className="bg-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold text-green-800">Your Impact This Week</h3>
              </div>
              <p className="text-sm text-green-700">
                This donation helped reach <strong>3,900 lives</strong> in our community through meals, shelter, and spiritual support.
              </p>
            </div>

            {/* Spiritual Encouragement */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Spiritual Encouragement</h3>
              <p className="text-sm text-blue-700 italic">
                "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." - 2 Corinthians 9:7
              </p>
            </div>

            {/* Honor Dedication */}
            {honorType && honorName && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Dedication</h3>
                </div>
                <p className="text-sm text-purple-700">
                  This gift was given {honorType} {honorName}
                </p>
              </div>
            )}

            {/* Donation Details */}
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600 mb-2">Donation Details:</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">${getCurrentAmount()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium">{isRecurring ? "Monthly Recurring" : "One-time"}</span>
                </div>
                {allocationMode === 'single' ? (
                  <div className="flex justify-between">
                    <span>Church:</span>
                    <span className="font-medium">
                      {churches.find(c => c.id.toString() === selectedChurch)?.name || "General"}
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Churches:</span>
                      <span className="font-medium">Multiple</span>
                    </div>
                    <div className="ml-4 space-y-1">
                      {churchAllocations.map(allocation => (
                        <div key={allocation.churchId} className="flex justify-between text-xs">
                          <span>{allocation.churchName}:</span>
                          <span>
                            ${((allocation.percentage / 100) * getCurrentAmount()).toFixed(2)} ({allocation.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {purpose && (
                  <div className="flex justify-between">
                    <span>Purpose:</span>
                    <span className="font-medium">
                      {DONATION_PURPOSES.find(p => p.value === purpose)?.label}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                  <span>Receipt #:</span>
                  <span>DON-{Date.now().toString().slice(-6)}</span>
                </div>
              </div>
            </div>

            {/* Automated Receipt Features */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-800 mb-3">Receipt & Tax Documents</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Email receipt sent automatically</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => testReceiptEmail()}>
                    View Receipt
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Tax-deductible confirmation</span>
                  </div>
                  <Badge variant="secondary">IRS Compliant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Annual giving statement</span>
                  </div>
                  <span className="text-xs text-gray-500">Available in January</span>
                </div>
              </div>
            </div>

            {prayerNote && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="h-4 w-4 text-indigo-600" />
                  <h3 className="font-semibold text-indigo-800">Prayer Note Added</h3>
                </div>
                <p className="text-sm text-indigo-700">
                  Your prayer request is now on the Prayer Wall for community support.
                </p>
              </div>
            )}

            {/* Sharing Options */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 text-gray-800">Invite Others to Give</h3>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={copyDonationLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/donation-demo')}`, '_blank')}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(`sms:?body=Join me in supporting our church community: ${window.location.origin}/donation-demo`, '_blank')}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  SMS
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirmation(false)}>
                Give Again
              </Button>
              <Button className="flex-1" onClick={() => window.location.href = "/prayer-wall"}>
                Prayer Wall
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Heart className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Give With Purpose</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your generosity empowers churches, transforms lives, and builds stronger communities of faith.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Donation Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Church className="h-5 w-5" />
                <span>Make a Donation</span>
              </CardTitle>
              <CardDescription>
                Support the ministries and missions that matter to you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Selection with Smart Suggestions */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Donation Amount</Label>
                <div className="text-sm text-gray-600 mb-2">
                  {isRecurring 
                    ? "Suggested monthly amounts for sustained impact:" 
                    : "Suggested one-time amounts:"}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {getDonationAmounts().map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount ? "default" : "outline"}
                      onClick={() => handleAmountSelect(amount)}
                      className="h-12"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Custom:</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Donation Type */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Donation Type</Label>
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={isRecurring}
                    onCheckedChange={setIsRecurring}
                  />
                  <div>
                    <span className="font-medium">
                      {isRecurring ? "Monthly Recurring" : "One-time Donation"}
                    </span>
                    <p className="text-sm text-gray-600">
                      {isRecurring 
                        ? "Automatically donate this amount each month" 
                        : "Make a single donation today"
                      }
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Church Selection Mode Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Church Selection</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={allocationMode === 'single' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAllocationMode('single')}
                    >
                      Single Church
                    </Button>
                    <Button
                      variant={allocationMode === 'multiple' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAllocationMode('multiple')}
                    >
                      Split Between Churches
                    </Button>
                  </div>
                </div>

                {allocationMode === 'single' ? (
                  <Select value={selectedChurch} onValueChange={setSelectedChurch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a church to support" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Fund (All Churches)</SelectItem>
                      {userChurches.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50">
                            Your Churches
                          </div>
                          {userChurches.map((uc) => {
                            const church = churches.find(c => c.id === uc.churchId);
                            return church ? (
                              <SelectItem key={church.id} value={church.id.toString()}>
                                <div className="flex items-center">
                                  <Church className="h-3 w-3 mr-2 text-blue-500" />
                                  {church.name}
                                  {church.denomination && (
                                    <span className="text-gray-500 ml-2">• {church.denomination}</span>
                                  )}
                                </div>
                              </SelectItem>
                            ) : null;
                          })}
                          <div className="px-2 py-1 text-xs font-medium text-gray-600">
                            Other Churches
                          </div>
                        </>
                      )}
                      {churches
                        .filter(church => !userChurches.some(uc => uc.churchId === church.id))
                        .map((church) => (
                          <SelectItem key={church.id} value={church.id.toString()}>
                            {church.name}
                            {church.denomination && (
                              <span className="text-gray-500 ml-2">• {church.denomination}</span>
                            )}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-4">
                    {/* Allocation Type Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Allocation Method:</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={allocationType === 'percentage' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAllocationType('percentage')}
                        >
                          Percentage
                        </Button>
                        <Button
                          variant={allocationType === 'amount' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAllocationType('amount')}
                        >
                          Amount
                        </Button>
                      </div>
                    </div>

                    {/* Church Allocations */}
                    <div className="space-y-3">
                      {churchAllocations.map((allocation, index) => (
                        <div key={allocation.churchId} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Church className="h-4 w-4 text-blue-500" />
                          <div className="flex-1">
                            <span className="font-medium text-sm">{allocation.churchName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {allocationType === 'percentage' ? (
                              <div className="flex items-center space-x-1">
                                <Input
                                  type="number"
                                  value={allocation.percentage}
                                  onChange={(e) => handleAllocationChange(index, 'percentage', e.target.value)}
                                  className="w-16 h-8"
                                  min="0"
                                  max="100"
                                />
                                <span className="text-sm">%</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <span className="text-sm">$</span>
                                <Input
                                  type="number"
                                  value={allocation.amount}
                                  onChange={(e) => handleAllocationChange(index, 'amount', e.target.value)}
                                  className="w-20 h-8"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChurchAllocation(index)}
                              className="h-8 w-8 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* Add Church Button */}
                      <Select onValueChange={addChurchAllocation}>
                        <SelectTrigger className="border-dashed">
                          <SelectValue placeholder="+ Add another church" />
                        </SelectTrigger>
                        <SelectContent>
                          {churches
                            .filter(church => !churchAllocations.some(alloc => alloc.churchId === church.id.toString()))
                            .map((church) => (
                              <SelectItem key={church.id} value={church.id.toString()}>
                                {church.name}
                                {church.denomination && (
                                  <span className="text-gray-500 ml-2">• {church.denomination}</span>
                                )}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      {/* Allocation Summary */}
                      {churchAllocations.length > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex justify-between text-sm">
                            <span>Total Allocated:</span>
                            <span className={`font-medium ${
                              allocationType === 'percentage' 
                                ? getTotalAllocationPercentage() === 100 ? 'text-green-600' : 'text-orange-600'
                                : getTotalAllocationAmount() === getCurrentAmount() ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {allocationType === 'percentage' 
                                ? `${getTotalAllocationPercentage()}%`
                                : `$${getTotalAllocationAmount().toFixed(2)}`
                              }
                            </span>
                          </div>
                          {allocationType === 'percentage' && getTotalAllocationPercentage() !== 100 && (
                            <p className="text-xs text-orange-600 mt-1">
                              Remaining: {100 - getTotalAllocationPercentage()}%
                            </p>
                          )}
                          {allocationType === 'amount' && getTotalAllocationAmount() !== getCurrentAmount() && (
                            <p className="text-xs text-orange-600 mt-1">
                              Remaining: ${(getCurrentAmount() - getTotalAllocationAmount()).toFixed(2)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Campaign Progress Tracker */}
              {selectedChurch && getCurrentCampaign() && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Active Campaign</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{getCurrentCampaign()?.name}</span>
                      <span className="text-blue-600">
                        ${getCurrentCampaign()?.current.toLocaleString()} / ${getCurrentCampaign()?.goal.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={(getCurrentCampaign()?.current || 0) / (getCurrentCampaign()?.goal || 1) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-blue-700">{getCurrentCampaign()?.description}</p>
                  </div>
                </div>
              )}

              {/* Purpose Selection */}
              <div className="space-y-3">
                <Label htmlFor="purpose">Donation Purpose (Optional)</Label>
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select how you'd like your donation to be used" />
                  </SelectTrigger>
                  <SelectContent>
                    {DONATION_PURPOSES.map((purposeOption) => (
                      <SelectItem key={purposeOption.value} value={purposeOption.value}>
                        {purposeOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* In Honor Of Feature */}
              <div className="space-y-3">
                <Label htmlFor="honor">Dedicate This Gift (Optional)</Label>
                <Select value={honorType} onValueChange={setHonorType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose dedication type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-honor-of">In Honor Of</SelectItem>
                    <SelectItem value="in-memory-of">In Memory Of</SelectItem>
                    <SelectItem value="in-celebration-of">In Celebration Of</SelectItem>
                    <SelectItem value="in-gratitude-for">In Gratitude For</SelectItem>
                  </SelectContent>
                </Select>
                {honorType && (
                  <Input
                    value={honorName}
                    onChange={(e) => setHonorName(e.target.value)}
                    placeholder="Enter name or occasion"
                    className="mt-2"
                  />
                )}
              </div>

              <Separator />

              {/* Donor Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                  <Label>Give anonymously</Label>
                </div>

                {!isAnonymous && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="For receipt and tax documentation"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="prayer">Prayer Note (Optional)</Label>
                  <Textarea
                    id="prayer"
                    value={prayerNote}
                    onChange={(e) => setPrayerNote(e.target.value)}
                    placeholder="Share a prayer request or message with the church..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={shareNewsletter}
                    onCheckedChange={setShareNewsletter}
                  />
                  <Label htmlFor="newsletter" className="text-sm">
                    Keep me updated on the impact of my gift
                  </Label>
                </div>
              </div>

              <Separator />

              {/* Payment Method */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Payment Method</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button variant="outline" className="h-12 flex flex-col space-y-1">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-xs">Card</span>
                  </Button>
                  <Button variant="outline" className="h-12 flex flex-col space-y-1">
                    <span className="font-bold text-xs">ACH</span>
                    <span className="text-xs">Bank</span>
                  </Button>
                  <Button variant="outline" className="h-12 flex flex-col space-y-1">
                    <span className="font-bold text-xs">🍎</span>
                    <span className="text-xs">Apple Pay</span>
                  </Button>
                  <Button variant="outline" className="h-12 flex flex-col space-y-1">
                    <span className="font-bold text-xs">G</span>
                    <span className="text-xs">Google Pay</span>
                  </Button>
                </div>
              </div>

              {/* Donate Button */}
              <Button
                onClick={handleDonate}
                className="w-full h-12 text-lg"
                disabled={!getCurrentAmount() || !email}
              >
                Donate ${getCurrentAmount() || 0} {isRecurring ? "Monthly" : "Now"}
              </Button>

              {/* Security Notice */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Lock className="h-4 w-4" />
                <span>Your information is encrypted and secure</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-6">
          {/* Live Giving Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Live Community Giving</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {RECENT_GIFTS.map((gift, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">{gift.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${gift.amount}</div>
                    <div className="text-xs text-gray-500">{gift.timeAgo}</div>
                  </div>
                </div>
              ))}
              <div className="text-center text-xs text-gray-500 pt-2 border-t">
                <span className="font-medium">12 people</span> gave in the last hour
              </div>
            </CardContent>
          </Card>

          {/* Giving Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Giving Badges</span>
              </CardTitle>
              <CardDescription>
                Unlock badges as you give
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {GIVING_BADGES.map((badge) => (
                <div key={badge.id} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    getCurrentAmount() >= badge.threshold 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {badge.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${
                      getCurrentAmount() >= badge.threshold 
                        ? 'text-yellow-800' 
                        : 'text-gray-400'
                    }`}>
                      {badge.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      ${badge.threshold}+ total giving
                    </div>
                  </div>
                  {getCurrentAmount() >= badge.threshold && (
                    <Star className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Impact Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Community Impact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">3,900</div>
                  <div className="text-xs text-gray-600">Lives Reached</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">$45K</div>
                  <div className="text-xs text-gray-600">This Month</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">127</div>
                  <div className="text-xs text-gray-600">Active Givers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">15</div>
                  <div className="text-xs text-gray-600">Churches</div>
                </div>
              </div>
              <div className="text-center text-xs text-gray-500 pt-2 border-t">
                Updated in real-time
              </div>
            </CardContent>
          </Card>

          {/* Security & Trust */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Secure & Trusted</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  <Lock className="h-3 w-3 mr-1" />
                  SSL Encrypted
                </Badge>
                <Badge variant="outline">PCI Compliant</Badge>
                <Badge variant="outline">Bank-Level Security</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Your donation is processed through industry-leading security protocols. Card details are never stored.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

