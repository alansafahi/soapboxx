import { useState, useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Shield, Church, CreditCard, Lock, CheckCircle, Users, Gift, MessageCircle, Trophy, Star, Share2, Copy, Target, Zap } from "lucide-react";

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
  const [honorType, setHonorType] = useState("");
  const [honorName, setHonorName] = useState("");
  const [shareNewsletter, setShareNewsletter] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<string | null>(null);
  const [showBadgeAnimation, setShowBadgeAnimation] = useState(false);

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
    // Check for badge unlocking
    const amount = getCurrentAmount();
    const eligibleBadge = GIVING_BADGES.find(badge => amount >= badge.threshold && !earnedBadge);
    
    if (eligibleBadge) {
      setEarnedBadge(eligibleBadge.name);
      setShowBadgeAnimation(true);
    }
    
    // Simulate donation processing
    setTimeout(() => {
      setShowConfirmation(true);
    }, 2000);
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
                <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                  <span>Receipt #:</span>
                  <span>DON-{Date.now().toString().slice(-6)}</span>
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