import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { AlertTriangle, Edit, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';

interface EditRequest {
  id: number;
  contentType: string;
  contentId: number;
  feedback: string;
  suggestions: string;
  createdAt: string;
  isRead: boolean;
}

export default function EditRequestBanner() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch edit requests
  const { data: editRequests = [] } = useQuery<EditRequest[]>({
    queryKey: ['/api/notifications/edit-requests'],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Mark edit request as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      apiRequest('POST', `/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/edit-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  // Navigate to content
  const handleViewContent = (editRequest: EditRequest) => {
    markAsReadMutation.mutate(editRequest.id);
    
    // Navigate based on content type
    let url = '';
    switch (editRequest.contentType) {
      case 'discussion':
        url = `/community?highlight=${editRequest.contentId}`;
        break;
      case 'soap_entry':
        url = `/soap?highlight=${editRequest.contentId}`;
        break;
      case 'prayer_request':
        url = `/prayer-wall?highlight=${editRequest.contentId}`;
        break;
      default:
        url = '/home';
    }
    
    window.location.href = url;
  };

  // Dismiss notification
  const handleDismiss = (editRequest: EditRequest) => {
    markAsReadMutation.mutate(editRequest.id);
  };

  // Filter unread edit requests
  const unreadEditRequests = editRequests.filter(req => !req.isRead);

  if (unreadEditRequests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      {unreadEditRequests.map((editRequest) => (
        <Alert 
          key={editRequest.id} 
          className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10"
        >
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between w-full">
            <div className="flex-1 mr-4">
              <div className="font-semibold text-red-800 dark:text-red-200 mb-1">
                🔴 Content Edit Required
              </div>
              <div className="text-sm text-red-700 dark:text-red-300 mb-2">
                A moderator has requested changes to your {editRequest.contentType.replace('_', ' ')}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-2 rounded mb-2">
                <strong>Feedback:</strong> {editRequest.feedback}
                {editRequest.suggestions && (
                  <>
                    <br />
                    <strong>Suggestions:</strong> {editRequest.suggestions}
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleViewContent(editRequest)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit Now
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDismiss(editRequest)}
                className="border-red-300 text-red-600 hover:bg-red-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}