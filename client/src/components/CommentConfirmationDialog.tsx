import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { CheckCircle, MessageCircle, Heart, Users } from 'lucide-react';
import { Badge } from './ui/badge';

interface CommentConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPost: () => void;
  commentText: string;
  postTitle?: string;
  communitySize?: number;
}

export function CommentConfirmationDialog({
  isOpen,
  onClose,
  onViewPost,
  commentText,
  postTitle,
  communitySize = 150
}: CommentConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto" aria-describedby="comment-confirmation-description">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="absolute -top-1 -right-1">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Comment Posted Successfully!
          </DialogTitle>
          <DialogDescription id="comment-confirmation-description" className="text-gray-600 dark:text-gray-300">
            Your thoughtful comment has been shared with the SoapBox community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Comment Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  "{commentText.length > 100 ? `${commentText.substring(0, 100)}...` : commentText}"
                </p>
                {postTitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    On: {postTitle.length > 60 ? `${postTitle.substring(0, 60)}...` : postTitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Community Impact */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Shared with {communitySize}+ members
              </span>
            </div>
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              +5 Points
            </Badge>
          </div>

          {/* Encouragement Message */}
          <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
            <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Thank you for building our faith community with your thoughtful engagement!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button 
              onClick={onViewPost}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              View Your Comment
            </Button>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Continue Browsing
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}