import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Heart, Shield, Church, CreditCard, Lock, CheckCircle, Users, Gift, MessageCircle } from "lucide-react";

interface Church {
  id: number;
  name: string;
  denomination: string;
}

const DONATION_AMOUNTS = [10, 25, 50, 100, 250];

const DONATION_PURPOSES = [
  { value: "general", label: "General Fund" },
  { value: "missions", label: "Missions & Outreach" },
  { value: "youth", label: "Youth Ministry" },
  { value: "worship", label: "Worship & Music" },
  { value: "building", label: "Building Fund" },
  { value: "charity", label: "Community Service" },
];

export default function DonationDemo() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [prayerNote, setPrayerNote] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { data: churches = [] } = useQuery<Church[]>({
    queryKey: ["/api/churches"],
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
    // Simulate donation processing
    setTimeout(() => {
      setShowConfirmation(true);
    }, 2000);
  };

  if (showConfirmation) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
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
                <div className="flex justify-between">
                  <span>Church:</span>
                  <span className="font-medium">
                    {churches.find(c => c.id.toString() === selectedChurch)?.name || "General"}
                  </span>
                </div>
                {purpose && (
                  <div className="flex justify-between">
                    <span>Purpose:</span>
                    <span className="font-medium">
                      {DONATION_PURPOSES.find(p => p.value === purpose)?.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1">
                <Gift className="h-4 w-4 mr-2" />
                View Receipt
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Share Prayer
              </Button>
            </div>
            
            <Button onClick={() => setShowConfirmation(false)} className="w-full">
              Make Another Donation
            </Button>
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
              {/* Amount Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Donation Amount</Label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {DONATION_AMOUNTS.map((amount) => (
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

              {/* Church Selection */}
              <div className="space-y-3">
                <Label htmlFor="church">Select Church</Label>
                <Select value={selectedChurch} onValueChange={setSelectedChurch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a church to support" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Fund (All Churches)</SelectItem>
                    {churches.map((church) => (
                      <SelectItem key={church.id} value={church.id.toString()}>
                        {church.name}
                        {church.denomination && (
                          <span className="text-gray-500 ml-2">• {church.denomination}</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Impact Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Community Support</p>
                    <p className="text-sm text-gray-600">Help families in need</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Church className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Ministry Growth</p>
                    <p className="text-sm text-gray-600">Expand outreach programs</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Lives Transformed</p>
                    <p className="text-sm text-gray-600">Support spiritual growth</p>
                  </div>
                </div>
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
                <Badge variant="outline">PCI DSS Compliant</Badge>
                <Badge variant="outline">SSL Encrypted</Badge>
                <Badge variant="outline">Stripe Secured</Badge>
              </div>
              <p className="text-sm text-gray-600">
                We use bank-level security to protect your donation. Your card details are never stored on our servers.
              </p>
            </CardContent>
          </Card>

          {/* Tax Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tax Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Your donation may be tax-deductible. You'll receive a receipt for your records and tax filing purposes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}