import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Mail, Clock, X } from "lucide-react";

interface User {
  id: string;
  email: string;
  emailVerified?: boolean;
  createdAt?: string;
  firstName?: string;
  lastName?: string;
}

const REMINDER_INTERVALS = {
  FIRST: 24 * 60 * 60 * 1000,    // 24 hours
  SECOND: 3 * 24 * 60 * 60 * 1000, // 3 days
  THIRD: 7 * 24 * 60 * 60 * 1000,  // 7 days
  FINAL: 14 * 24 * 60 * 60 * 1000  // 14 days
};

export default function EmailVerificationReminder() {
  const [showReminder, setShowReminder] = useState(false);
  const [reminderType, setReminderType] = useState<'gentle' | 'urgent'>('gentle');
  const { toast } = useToast();

  // Get user data and verification status
  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false
  });

  // Resend verification email mutation
  const resendVerification = useMutation({
    mutationFn: async () => {
      if (!user?.email) throw new Error('User email not found');
      return await apiRequest('/api/auth/resend-verification', 'POST', { email: user.email });
    },
    onSuccess: () => {
      toast({
        title: "Verification Email Sent",
        description: "Check your inbox for the verification email.",
      });
      setShowReminder(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
    },
  });

  // Check if user needs verification reminders
  useEffect(() => {
    if (!user || user.emailVerified) return;

    const registrationDate = user.createdAt ? new Date(user.createdAt) : new Date();
    const now = new Date();
    const timeSinceRegistration = now.getTime() - registrationDate.getTime();

    // Get last reminder from localStorage
    const lastReminderKey = `emailVerificationReminder_${user.id}`;
    const lastReminder = localStorage.getItem(lastReminderKey);
    const lastReminderTime = lastReminder ? parseInt(lastReminder) : 0;
    const timeSinceLastReminder = now.getTime() - lastReminderTime;

    let shouldShowReminder = false;
    let newReminderType: 'gentle' | 'urgent' = 'gentle';

    // Determine reminder schedule based on time since registration
    if (timeSinceRegistration >= REMINDER_INTERVALS.FINAL && timeSinceLastReminder >= REMINDER_INTERVALS.FINAL) {
      // 14+ days: Most urgent reminder
      shouldShowReminder = true;
      newReminderType = 'urgent';
    } else if (timeSinceRegistration >= REMINDER_INTERVALS.THIRD && timeSinceLastReminder >= REMINDER_INTERVALS.SECOND) {
      // 7+ days: More urgent
      shouldShowReminder = true;
      newReminderType = 'urgent';
    } else if (timeSinceRegistration >= REMINDER_INTERVALS.SECOND && timeSinceLastReminder >= REMINDER_INTERVALS.SECOND) {
      // 3+ days: Regular reminder
      shouldShowReminder = true;
      newReminderType = 'gentle';
    } else if (timeSinceRegistration >= REMINDER_INTERVALS.FIRST && timeSinceLastReminder >= REMINDER_INTERVALS.FIRST) {
      // 1+ days: First gentle reminder
      shouldShowReminder = true;
      newReminderType = 'gentle';
    }

    if (shouldShowReminder) {
      setReminderType(newReminderType);
      setShowReminder(true);
      // Update last reminder time
      localStorage.setItem(lastReminderKey, now.getTime().toString());
    }
  }, [user]);

  const handleResendEmail = () => {
    resendVerification.mutate();
  };

  const handleDismiss = () => {
    setShowReminder(false);
    // Update dismiss time to prevent showing again too soon
    if (user) {
      const dismissKey = `emailVerificationDismiss_${user.id}`;
      localStorage.setItem(dismissKey, new Date().getTime().toString());
    }
  };

  if (!showReminder || !user || user.emailVerified) {
    return null;
  }

  const isUrgent = reminderType === 'urgent';

  return (
    <Dialog open={showReminder} onOpenChange={setShowReminder}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            isUrgent ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
          }`}>
            {isUrgent ? <Clock className="h-6 w-6" /> : <Mail className="h-6 w-6" />}
          </div>
          <DialogTitle className="text-center">
            {isUrgent ? 'Email Verification Needed' : 'Verify Your Email'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isUrgent 
              ? 'Your account security is at risk. Please verify your email address to protect your faith community profile and access all features.'
              : 'To ensure you receive important updates from your faith community, please verify your email address.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${
            isUrgent ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <h4 className={`font-medium mb-2 ${
              isUrgent ? 'text-red-800' : 'text-amber-800'
            }`}>
              Without email verification, you cannot:
            </h4>
            <ul className={`text-sm space-y-1 ${
              isUrgent ? 'text-red-700' : 'text-amber-700'
            }`}>
              <li>• Reset your password if forgotten</li>
              <li>• Receive prayer request notifications</li>
              <li>• Get event reminders</li>
              <li>• Access some community features</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleResendEmail}
              disabled={resendVerification.isPending}
              className={`flex-1 ${
                isUrgent 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-amber-600 hover:bg-amber-700'
              } text-white`}
            >
              <Mail className="h-4 w-4 mr-2" />
              {resendVerification.isPending ? "Sending..." : "Resend Email"}
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Check your spam folder if you don't see the email
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}