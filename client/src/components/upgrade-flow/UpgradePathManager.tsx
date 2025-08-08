import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Star, Lock, Crown, BookOpenText, ArrowRight, BadgeCheck, Users, Sparkles, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UpgradeFlowProps {
  trigger: "complete" | "mid-plan" | "locked-feature" | "pastor-invite" | null;
  planData?: {
    id: number;
    name: string;
    currentDay?: number;
    totalDays?: number;
    completionPercentage?: number;
  };
  onClose: () => void;
  onUpgrade?: (tier: string) => void;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  subscriptionTier?: string;
}

interface ReadingPlan {
  id: number;
  name: string;
  subscriptionTier: string;
  duration: number;
  description: string;
}

const ScreenWrapper: React.FC<{ children: React.ReactNode; keyId: string }> = ({ children, keyId }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={keyId}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-2xl p-4 flex flex-col gap-4"
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

const FeatureRow: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 shrink-0 text-primary">{icon}</div>
    <div>
      <p className="font-medium leading-tight">{title}</p>
      <p className="text-sm text-muted-foreground leading-snug">{desc}</p>
    </div>
  </div>
);

function PlanCompletionCelebrate({ 
  user, 
  planData, 
  nextTierPlans, 
  onStartTrial, 
  onBrowsePlans 
}: {
  user: User;
  planData: any;
  nextTierPlans: ReadingPlan[];
  onStartTrial: (planId: number) => void;
  onBrowsePlans: () => void;
}) {
  const nextTier = user.subscriptionTier === 'disciple' ? 'servant' : 'torchbearer';
  const suggestedPlan = nextTierPlans[0];

  return (
    <ScreenWrapper keyId="complete">
      <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader className="text-center">
          <motion.div 
            className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <BadgeCheck className="h-8 w-8 text-white" />
          </motion.div>
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Well done, {user.firstName}!
          </CardTitle>
          <CardDescription className="text-base">
            You just completed <span className="font-medium text-blue-600">"{planData.name}"</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur rounded-lg p-3">
            <Star className="h-5 w-5 text-yellow-500" />
            <p className="text-sm">Congratulations on building your daily reading habit! Keep the momentum going.</p>
          </div>
          
          <div className="rounded-xl bg-white/40 backdrop-blur p-5 border border-white/20">
            <p className="text-sm font-semibold mb-4 text-center">
              Ready to go deeper? Upgrade to <span className="text-primary capitalize">{nextTier} Plan</span>
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {nextTier === 'servant' ? (
                <>
                  <FeatureRow 
                    icon={<BookOpenText className="h-4 w-4" />} 
                    title="Character Studies" 
                    desc="Journey of Paul, Story of David, and biblical heroes." 
                  />
                  <FeatureRow 
                    icon={<Users className="h-4 w-4" />} 
                    title="Group Plan Sync" 
                    desc="Read the same plan with your church or small group." 
                  />
                  <FeatureRow 
                    icon={<Sparkles className="h-4 w-4" />} 
                    title="AI Life Application" 
                    desc="Daily prompts to live out God's Word practically." 
                  />
                  <FeatureRow 
                    icon={<PlayCircle className="h-4 w-4" />} 
                    title="Weekly Recaps" 
                    desc="Big picture summaries with cross-references." 
                  />
                </>
              ) : (
                <>
                  <FeatureRow 
                    icon={<Crown className="h-4 w-4" />} 
                    title="Scholar Mode" 
                    desc="Historical timelines, maps, and deep context." 
                  />
                  <FeatureRow 
                    icon={<PlayCircle className="h-4 w-4" />} 
                    title="AI Audio Bible" 
                    desc="Listen to Scripture with commentary on your commute." 
                  />
                  <FeatureRow 
                    icon={<BookOpenText className="h-4 w-4" />} 
                    title="Parallel Translations" 
                    desc="Compare multiple Bible versions side by side." 
                  />
                  <FeatureRow 
                    icon={<Sparkles className="h-4 w-4" />} 
                    title="Advanced Commentary" 
                    desc="AI-powered theological insights from trusted sources." 
                  />
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
              onClick={() => suggestedPlan && onStartTrial(suggestedPlan.id)}
            >
              Start "{suggestedPlan?.name || 'Next Plan'}" <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex-1 border-blue-200" onClick={onBrowsePlans}>
              Browse {nextTier} Plans
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            7-day {nextTier} trial included • Cancel anytime
          </p>
        </CardContent>
      </Card>
    </ScreenWrapper>
  );
}

function MidPlanNudge({ 
  user, 
  planData, 
  onStartTrial, 
  onDismiss 
}: {
  user: User;
  planData: any;
  onStartTrial: () => void;
  onDismiss: () => void;
}) {
  const nextTier = user.subscriptionTier === 'disciple' ? 'servant' : 'torchbearer';
  const progressPercentage = planData.completionPercentage || 50;

  return (
    <ScreenWrapper keyId="mid">
      <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpenText className="h-5 w-5 text-orange-600" /> 
            You're making great progress!
          </CardTitle>
          <CardDescription>
            You're {progressPercentage}% through "{planData.name}". Ready to unlock more?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressPercentage} className="h-3" />
          
          <div className="rounded-xl bg-white/50 backdrop-blur p-4">
            <p className="text-sm font-semibold mb-3 text-center">
              Available in <span className="text-primary capitalize">{nextTier} Plan</span>
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {nextTier === 'servant' ? (
                <>
                  <FeatureRow 
                    icon={<Sparkles className="h-4 w-4" />} 
                    title="AI Application Prompts" 
                    desc="Turn today's reading into practical next steps." 
                  />
                  <FeatureRow 
                    icon={<Users className="h-4 w-4" />} 
                    title="Group Sync" 
                    desc="Connect with your church or small group." 
                  />
                </>
              ) : (
                <>
                  <FeatureRow 
                    icon={<Crown className="h-4 w-4" />} 
                    title="Historical Context" 
                    desc="Maps, timelines, and cultural background." 
                  />
                  <FeatureRow 
                    icon={<PlayCircle className="h-4 w-4" />} 
                    title="Audio Commentary" 
                    desc="Listen while commuting or walking." 
                  />
                </>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500" onClick={onStartTrial}>
              Try {nextTier} Free
            </Button>
            <Button variant="outline" className="flex-1" onClick={onDismiss}>
              Continue Reading
            </Button>
          </div>
        </CardContent>
      </Card>
    </ScreenWrapper>
  );
}

function LockedFeatureModal({ 
  user, 
  featureName = "Advanced Features",
  onUpgrade, 
  onClose 
}: {
  user: User;
  featureName?: string;
  onUpgrade: () => void;
  onClose: () => void;
}) {
  const requiredTier = user.subscriptionTier === 'disciple' ? 'servant' : 'torchbearer';

  return (
    <ScreenWrapper keyId="locked">
      <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-600" /> 
            Feature Locked
          </CardTitle>
          <CardDescription>
            {featureName} requires the <span className="capitalize font-medium text-purple-600">{requiredTier} Plan</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-white/50 backdrop-blur p-4">
            <div className="grid gap-3">
              {requiredTier === 'servant' ? (
                <>
                  <FeatureRow 
                    icon={<Sparkles className="h-4 w-4" />} 
                    title="AI Life Application" 
                    desc="Get personalized prompts for daily living." 
                  />
                  <FeatureRow 
                    icon={<Users className="h-4 w-4" />} 
                    title="Group Features" 
                    desc="Join reading plans with your community." 
                  />
                </>
              ) : (
                <>
                  <FeatureRow 
                    icon={<Crown className="h-4 w-4" />} 
                    title="Scholar Mode" 
                    desc="Timelines, maps, and historical insights." 
                  />
                  <FeatureRow 
                    icon={<PlayCircle className="h-4 w-4" />} 
                    title="AI Audio Bible" 
                    desc="Listen with commentary and context." 
                  />
                </>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600" onClick={onUpgrade}>
              Start {requiredTier} Trial
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Continue Without
            </Button>
          </div>
        </CardContent>
      </Card>
    </ScreenWrapper>
  );
}

export default function UpgradePathManager({ trigger, planData, onClose, onUpgrade }: UpgradeFlowProps) {
  const [currentStep, setCurrentStep] = useState<string>(trigger || "");
  const queryClient = useQueryClient();

  // Fetch user data
  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });

  // Fetch reading plans for next tier recommendations
  const { data: readingPlans } = useQuery<ReadingPlan[]>({
    queryKey: ['/api/reading-plans'],
  });

  const upgradeSubscription = useMutation({
    mutationFn: async (data: { tier: string; planId?: number }) => {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to upgrade subscription');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      onUpgrade?.('success');
    },
  });

  const getNextTierPlans = (currentTier: string): ReadingPlan[] => {
    const nextTier = currentTier === 'disciple' ? 'servant' : 'torchbearer';
    return readingPlans?.filter(plan => plan.subscriptionTier === nextTier) || [];
  };

  const handleStartTrial = (planId?: number) => {
    const nextTier = user?.subscriptionTier === 'disciple' ? 'servant' : 'torchbearer';
    upgradeSubscription.mutate({ tier: nextTier, planId });
    setCurrentStep("checkout");
  };

  if (!user || !trigger) return null;

  const nextTierPlans = getNextTierPlans(user.subscriptionTier || 'disciple');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {trigger === "complete" && (
          <PlanCompletionCelebrate
            user={user}
            planData={planData}
            nextTierPlans={nextTierPlans}
            onStartTrial={handleStartTrial}
            onBrowsePlans={() => {
              onClose();
              // Navigate to reading plans with tier filter
            }}
          />
        )}
        
        {trigger === "mid-plan" && (
          <MidPlanNudge
            user={user}
            planData={planData}
            onStartTrial={() => handleStartTrial()}
            onDismiss={onClose}
          />
        )}
        
        {trigger === "locked-feature" && (
          <LockedFeatureModal
            user={user}
            onUpgrade={() => handleStartTrial()}
            onClose={onClose}
          />
        )}

        {currentStep === "checkout" && (
          <ScreenWrapper keyId="checkout">
            <Card className="rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle>Starting Your Trial...</CardTitle>
                <CardDescription>Setting up your enhanced reading experience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    <Sparkles className="h-8 w-8 text-primary" />
                  </motion.div>
                  <p className="mt-2 text-sm text-muted-foreground">Activating your trial...</p>
                </div>
                {upgradeSubscription.isSuccess && (
                  <div className="text-center space-y-2">
                    <Check className="h-8 w-8 text-green-500 mx-auto" />
                    <p className="font-medium">Trial activated successfully!</p>
                    <Button onClick={onClose} className="mt-4">Continue Reading</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </ScreenWrapper>
        )}
      </div>
    </div>
  );
}