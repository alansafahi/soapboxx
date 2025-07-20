import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Flag, AlertTriangle, MessageSquare, Zap, Shield, ExternalLink } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FlagContentDialogProps {
  contentType: 'discussion' | 'prayer_request' | 'soap_entry' | 'comment';
  contentId: number;
  trigger?: React.ReactNode;
  onReported?: () => void;
}

const reportReasons = [
  {
    value: 'sexual_content',
    label: 'Sexual Content',
    icon: AlertTriangle,
    description: 'Nudity, explicit poses, sexual activity, pornographic material, or suggestive content',
    priority: 'high',
    examples: 'Nudity, explicit images, sexual poses, pornographic content'
  },
  {
    value: 'inappropriate',
    label: 'Inappropriate Content',
    icon: AlertTriangle,
    description: 'Violence, adult language, graphic content, or otherwise inappropriate material',
    priority: 'high',
    examples: 'Graphic content, threats, adult language'
  },
  {
    value: 'harassment',
    label: 'Harassment or Bullying',
    icon: MessageSquare,
    description: 'Targeting, intimidating, bullying, or hate speech based on faith, race, gender, or other characteristics',
    priority: 'high',
    examples: 'Direct harassment, discrimination, blasphemous misuse of Scripture'
  },
  {
    value: 'misinformation',
    label: 'False Information',
    icon: ExternalLink,
    description: 'Misleading or false religious/spiritual information, misquoting Scripture',
    priority: 'medium',
    examples: 'Theological misinformation, misquoted verses'
  },
  {
    value: 'privacy_violation',
    label: 'Privacy Violation',
    icon: Shield,
    description: 'Sharing personal information without consent, impersonation of church staff',
    priority: 'medium',
    examples: 'Exposing private member info, impersonating pastors'
  },
  {
    value: 'spam',
    label: 'Spam',
    icon: Zap,
    description: 'Repetitive, commercial, or off-topic content across multiple threads',
    priority: 'low',
    examples: 'Mass posting, promotional content, AI-generated spam'
  },
  {
    value: 'other',
    label: 'Other',
    icon: Flag,
    description: 'Other community guideline violations or disruptive behavior',
    priority: 'medium',
    examples: 'Off-topic posts, inappropriate profile pictures, theological disagreements'
  }
];

export function FlagContentDialog({ contentType, contentId, trigger, onReported }: FlagContentDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: 'Please select a reason',
        description: 'You must select a reason for reporting this content.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest('POST', '/api/moderation/report', {
        contentType,
        contentId,
        reason,
        description: description.trim() || null,
      });

      toast({
        title: 'Content reported successfully',
        description: 'Thank you for helping keep our community safe. Our moderation team will review this report.',
      });

      setOpen(false);
      setReason('');
      setDescription('');
      onReported?.();
    } catch (error) {
      // Silent error logging for production
      toast({
        title: 'Failed to submit report',
        description: 'Please try again or contact support if the problem persists.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedReasonData = reportReasons.find(r => r.value === reason);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
            <Flag className="h-4 w-4 mr-1" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Flag className="h-5 w-5" />
            Report Content
          </DialogTitle>
          <DialogDescription>
            Help us maintain a safe and respectful community by reporting content that violates our guidelines.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for reporting *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((reasonOption) => {
                  const Icon = reasonOption.icon;
                  return (
                    <SelectItem key={reasonOption.value} value={reasonOption.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {reasonOption.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedReasonData && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedReasonData.priority === 'high' ? 'bg-red-100 text-red-800' :
                    selectedReasonData.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedReasonData.priority === 'high' ? '⚠️ HIGH PRIORITY' :
                     selectedReasonData.priority === 'medium' ? '🟡 MEDIUM PRIORITY' :
                     '🟢 LOW PRIORITY'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedReasonData.description}
                </p>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Examples:
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {selectedReasonData.examples}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide any additional context that might help our moderators understand the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {description.length}/500 characters
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Anonymous Reporting</p>
                <p className="text-xs">
                  Your identity will be kept confidential. Only church administrators and pastors can view reports.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}