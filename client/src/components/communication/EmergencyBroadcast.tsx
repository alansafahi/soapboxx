import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '../../hooks/use-toast';
import { apiRequest } from '../../lib/queryClient';
import { Shield, AlertTriangle, Clock, Zap } from 'lucide-react';

export default function EmergencyBroadcast() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [emergencyForm, setEmergencyForm] = useState({
    title: '',
    content: '',
    requiresResponse: false
  });

  // Emergency broadcast mutation
  const emergencyBroadcastMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/communications/emergency-broadcast', data),
    onSuccess: (response) => {
      toast({
        title: "Emergency broadcast sent successfully",
        description: `Urgent message delivered to ${response.recipientCount || 'all'} church members.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/communications/messages'] });
      setEmergencyForm({ title: '', content: '', requiresResponse: false });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send emergency broadcast",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleEmergencyBroadcast = () => {
    if (!emergencyForm.title || !emergencyForm.content) {
      toast({
        title: "Missing required fields",
        description: "Please enter both a title and content for the emergency broadcast.",
        variant: "destructive"
      });
      return;
    }

    // Confirm emergency broadcast
    if (confirm('Are you sure you want to send this emergency broadcast? This will immediately notify ALL church members.')) {
      emergencyBroadcastMutation.mutate(emergencyForm);
    }
  };

  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardHeader className="bg-red-50 dark:bg-red-950">
        <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
          <Shield className="w-5 h-5" />
          Emergency Broadcast System
        </CardTitle>
        <CardDescription className="text-red-600 dark:text-red-300">
          Send urgent messages immediately to all church members across all communication channels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Emergency broadcasts are sent immediately to ALL church members via email, push notifications, and in-app messages. Use only for urgent communications.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emergency-title">Emergency Title</Label>
            <Input
              id="emergency-title"
              placeholder="e.g., Service Cancelled Due to Weather"
              value={emergencyForm.title}
              onChange={(e) => setEmergencyForm(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency-content">Emergency Message</Label>
            <Textarea
              id="emergency-content"
              placeholder="Provide clear, specific information about the emergency situation..."
              rows={6}
              value={emergencyForm.content}
              onChange={(e) => setEmergencyForm(prev => ({ ...prev, content: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="emergency-response"
              checked={emergencyForm.requiresResponse}
              onCheckedChange={(checked) => 
                setEmergencyForm(prev => ({ ...prev, requiresResponse: checked as boolean }))
              }
            />
            <Label htmlFor="emergency-response">Requires immediate response from recipients</Label>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">This emergency broadcast will:</h4>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            <li>• Send to ALL church members immediately</li>
            <li>• Deliver via email, push notifications, and in-app alerts</li>
            <li>• Display with high priority and urgent styling</li>
            <li>• Generate delivery confirmation reports</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleEmergencyBroadcast}
            disabled={emergencyBroadcastMutation.isPending}
            variant="destructive"
            className="flex-1"
          >
            {emergencyBroadcastMutation.isPending ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Sending Emergency Broadcast...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Send Emergency Broadcast
              </>
            )}
          </Button>
        </div>

        {/* Emergency Broadcast Preview */}
        {(emergencyForm.title || emergencyForm.content) && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">Emergency Preview:</div>
            <div className="space-y-2">
              {emergencyForm.title && (
                <div className="font-bold text-red-800 dark:text-red-200">
                  🚨 URGENT: {emergencyForm.title}
                </div>
              )}
              {emergencyForm.content && (
                <div className="text-sm text-red-700 dark:text-red-300">
                  {emergencyForm.content}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}