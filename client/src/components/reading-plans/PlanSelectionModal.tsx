import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Sparkles, 
  Crown, 
  Brain,
  Heart,
  ChevronRight,
  Users,
  Target
} from 'lucide-react';

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTier: 'disciple' | 'servant' | 'torchbearer';
  onSelectExisting: () => void;
  onCreateCustom: () => void;
}

export default function PlanSelectionModal({
  isOpen,
  onClose,
  userTier,
  onSelectExisting,
  onCreateCustom
}: PlanSelectionModalProps) {
  const isTorchbearer = userTier === 'torchbearer';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            {isTorchbearer ? (
              <Crown className="w-8 h-8 text-yellow-500 mr-3" />
            ) : (
              <Heart className="w-8 h-8 text-purple-500 mr-3" />
            )}
            <DialogTitle className="text-3xl font-bold">
              {isTorchbearer ? 'Torchbearer' : 'Advanced'} Reading Journey
            </DialogTitle>
          </div>
          <DialogDescription className="text-lg text-gray-600 dark:text-gray-400">
            Choose how you'd like to begin your spiritual growth journey
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Option 1: Select Existing Plan */}
          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-blue-500 group"
            onClick={onSelectExisting}
          >
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-800/30 transition-colors">
                  <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                Select Existing Reading Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Browse our curated collection of {isTorchbearer ? 'advanced' : 'intermediate'} reading plans designed for deeper spiritual growth.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>Community-tested plans</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Target className="w-4 h-4" />
                  <span>Structured spiritual growth</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Heart className="w-4 h-4" />
                  <span>Immediate start</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={onSelectExisting}
              >
                Browse Reading Plans
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Option 2: Create Custom AI Plan */}
          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-purple-500 group relative overflow-hidden"
            onClick={onCreateCustom}
          >
            {/* Premium Badge */}
            {isTorchbearer && (
              <Badge className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full group-hover:from-purple-200 group-hover:to-pink-200 dark:group-hover:from-purple-800/30 dark:group-hover:to-pink-800/30 transition-colors">
                  <div className="relative">
                    <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <Brain className="w-4 h-4 text-pink-600 dark:text-pink-400 absolute -top-1 -right-1" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                Create Custom AI Reading Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Let AI create a personalized reading plan based on your current spiritual and emotional state.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Brain className="w-4 h-4" />
                  <span>AI-powered personalization</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Heart className="w-4 h-4" />
                  <span>Emotional state aware</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Target className="w-4 h-4" />
                  <span>Tailored to your needs</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={onCreateCustom}
                disabled={!isTorchbearer}
              >
                {isTorchbearer ? (
                  <>
                    Create My Custom Plan
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Upgrade to Torchbearer
                    <Crown className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}