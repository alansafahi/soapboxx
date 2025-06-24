import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Church, MapPin, Users, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChurchData {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
}

interface AutomatedChurchClaimingProps {
  claimableChurch: ChurchData;
  userEmail: string;
  onChurchClaimed: () => void;
  onSkip: () => void;
}

export default function AutomatedChurchClaiming({ 
  claimableChurch, 
  userEmail, 
  onChurchClaimed, 
  onSkip 
}: AutomatedChurchClaimingProps) {
  const [isProcessing, setClaiming] = useState(false);
  const { toast } = useToast();

  const handleClaimChurch = async () => {
    setClaiming(true);
    
    try {
      const response = await fetch(`/api/churches/${claimableChurch.id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': window.location.href,
        },
        credentials: 'include',
        body: JSON.stringify({
          email: userEmail,
          churchId: claimableChurch.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Church Claimed Successfully!",
          description: `You are now the admin of ${claimableChurch.name}`,
        });
        onChurchClaimed();
      } else {
        const errorData = await response.json();
        toast({
          title: "Claiming Failed",
          description: errorData.message || "Unable to claim church. Please contact support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Church claiming error:', error);
      toast({
        title: "Error",
        description: "Failed to claim church. Please try again.",
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Church className="h-6 w-6 text-purple-600" />
            Church Pre-Assignment Detected
          </DialogTitle>
          <DialogDescription>
            We found a church pre-assigned to your email address. Would you like to claim it now?
          </DialogDescription>
        </DialogHeader>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg text-purple-900">{claimableChurch.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-2">
                  <MapPin className="h-4 w-4" />
                  {claimableChurch.address && (
                    <span>{claimableChurch.address}, </span>
                  )}
                  {claimableChurch.city}, {claimableChurch.state}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Pre-Assigned
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4 text-purple-500" />
                <span>Church Admin Access</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Church className="h-4 w-4 text-purple-500" />
                <span>Member Management</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-purple-500" />
                <span>Event Organization</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <h4 className="font-medium text-purple-900 mb-2">What you'll get as Church Admin:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Full administrative control of church profile and settings</li>
                <li>• Ability to manage members, events, and communications</li>
                <li>• Access to church analytics and engagement insights</li>
                <li>• Tools for organizing services, events, and community outreach</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleClaimChurch}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Claiming Church...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Claim {claimableChurch.name}
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onSkip}
            disabled={isProcessing}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Skip for Now
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-2">
          You can always claim your church later from the Church Discovery page.
        </p>
      </DialogContent>
    </Dialog>
  );
}