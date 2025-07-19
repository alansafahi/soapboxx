import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { AlertTriangle, Edit } from 'lucide-react';

interface EditRequest {
  id: number;
  contentType: string;
  contentId: number;
  feedback: string;
  suggestions: string;
  createdAt: string;
  isRead: boolean;
}

export default function EditRequestToast() {
  const { toast } = useToast();

  // Check for new edit requests every 30 seconds
  const { data: editRequests = [], refetch } = useQuery<EditRequest[]>({
    queryKey: ['/api/notifications/edit-requests'],
    refetchInterval: 30000,
  });

  // Show toast for new unread edit requests
  useEffect(() => {
    const unreadRequests = editRequests.filter(req => !req.isRead);
    
    if (unreadRequests.length > 0) {
      // Show a toast for the most recent request
      const latestRequest = unreadRequests[0];
      
      toast({
        title: "🔴 Content Edit Required",
        description: `A moderator has requested changes to your ${latestRequest.contentType.replace('_', ' ')}. Please review and edit immediately.`,
        duration: 0, // Persistent toast
        action: (
          <Button
            size="sm"
            onClick={() => {
              // Navigate to content
              let url = '';
              switch (latestRequest.contentType) {
                case 'discussion':
                  url = `/community?highlight=${latestRequest.contentId}`;
                  break;
                case 'soap_entry':
                  url = `/soap?highlight=${latestRequest.contentId}`;
                  break;
                case 'prayer_request':
                  url = `/prayer-wall?highlight=${latestRequest.contentId}`;
                  break;
                default:
                  url = '/home';
              }
              window.location.href = url;
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit Now
          </Button>
        ),
      });
    }
  }, [editRequests, toast]);

  return null; // This component only manages toasts
}