import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Mail, MessageSquare, RotateCw } from 'lucide-react';
import { FaFacebook, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post?: any;
  postId: number;
}

export function ShareDialog({ isOpen, onClose, post, postId }: ShareDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Internal repost mutation
  const repostMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/discussions/${postId}/share`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      toast({
        title: "Post shared!",
        description: "The post has been shared to your feed",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share post",
        variant: "destructive"
      });
    }
  });

  const handleShare = async (platform: string) => {
    if (!post) return;
    
    const shareText = `Check out this inspiring post: ${post.content?.substring(0, 100)}${post.content?.length > 100 ? '...' : ''}`;
    const shareUrl = `${window.location.origin}/home`;
    
    try {
      switch (platform) {
        case 'copy':
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          toast({
            title: "Link copied!",
            description: "The post link has been copied to your clipboard",
          });
          break;
          
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
          await navigator.clipboard.writeText(shareText);
          toast({
            title: "Opening Facebook",
            description: "Text copied to clipboard - paste into your Facebook post",
          });
          break;
          
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
          toast({
            title: "Opening X (Twitter)",
            description: "Share window opened in new tab",
          });
          break;
          
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`, '_blank');
          toast({
            title: "Opening WhatsApp",
            description: "Share window opened in new tab",
          });
          break;
          
        case 'email':
          const emailSubject = "Inspiring Post from SoapBox Super App";
          const emailBody = `Hi,\n\nI wanted to share this inspiring post with you:\n\n"${shareText}"\n\nView the full post here: ${shareUrl}\n\nBlessings!`;
          window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`, '_self');
          toast({
            title: "Opening Email",
            description: "Email composer opened",
          });
          break;
          
        case 'sms':
          const smsText = `${shareText}\n\n${shareUrl}`;
          window.open(`sms:?body=${encodeURIComponent(smsText)}`, '_self');
          toast({
            title: "Opening SMS",
            description: "Text message composer opened",
          });
          break;
          
        case 'repost':
          repostMutation.mutate();
          break;
          
        default:
          break;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share This Post</DialogTitle>
          <DialogDescription>
            Spread inspiration and connect with others
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          {/* Copy Link */}
          <Button
            onClick={() => handleShare('copy')}
            variant="outline"
            className="flex flex-col items-center space-y-2 h-auto p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Copy className="w-6 h-6 text-gray-600" />
            <span className="text-sm font-medium">Copy Link</span>
          </Button>

          {/* Facebook */}
          <Button
            onClick={() => handleShare('facebook')}
            variant="outline"
            className="flex flex-col items-center space-y-2 h-auto p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <FaFacebook className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium">Facebook</span>
          </Button>

          {/* X (Twitter) */}
          <Button
            onClick={() => handleShare('twitter')}
            variant="outline"
            className="flex flex-col items-center space-y-2 h-auto p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <FaTwitter className="w-6 h-6 text-blue-400" />
            <span className="text-sm font-medium">X (Twitter)</span>
          </Button>

          {/* WhatsApp */}
          <Button
            onClick={() => handleShare('whatsapp')}
            variant="outline"
            className="flex flex-col items-center space-y-2 h-auto p-4 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <FaWhatsapp className="w-6 h-6 text-green-500" />
            <span className="text-sm font-medium">WhatsApp</span>
          </Button>

          {/* Email */}
          <Button
            onClick={() => handleShare('email')}
            variant="outline"
            className="flex flex-col items-center space-y-2 h-auto p-4 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <Mail className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium">Email</span>
          </Button>

          {/* SMS */}
          <Button
            onClick={() => handleShare('sms')}
            variant="outline"
            className="flex flex-col items-center space-y-2 h-auto p-4 hover:bg-orange-50 dark:hover:bg-orange-900/20"
          >
            <MessageSquare className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium">SMS</span>
          </Button>
        </div>

        {/* Internal Repost */}
        <div className="border-t pt-4">
          <Button
            onClick={() => handleShare('repost')}
            disabled={repostMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            {repostMutation.isPending ? "Sharing..." : "Repost to Your Feed"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}