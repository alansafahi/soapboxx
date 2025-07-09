import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp, Heart, MessageCircle, BookOpen, Save, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";

interface SoapPost {
  id: number;
  content: string;
  authorId: string;
  createdAt: string;
  type: 'soap_reflection';
  soapData?: {
    scripture: string;
    scriptureReference: string;
    observation: string;
    application: string;
    prayer: string;
  };
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  _count?: {
    comments: number;
    likes: number;
  };
}

interface SoapPostCardProps {
  post: SoapPost;
}

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
}

function CommentDialog({ isOpen, onClose, postId }: CommentDialogProps) {
  const [commentText, setCommentText] = useState("");
  const { toast } = useToast();

  // Fetch comments for this SOAP post
  const { data: comments = [] } = useQuery({
    queryKey: [`/api/soap/${postId}/comments`],
    enabled: isOpen && !!postId,
  });

  // Comment mutation for SOAP posts
  const commentMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const response = await fetch(`/api/soap/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Referer": window.location.href,
        },
        credentials: "include",
        body: JSON.stringify({ content })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      queryClient.invalidateQueries({ queryKey: [`/api/soap/${postId}/comments`] });
      setCommentText("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add comment",
        variant: "destructive",
      });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[50vh] overflow-y-auto">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex space-x-3 p-3 rounded-lg bg-gray-50">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {comment.authorId[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">Community Member</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Add Comment Form */}
        <div className="border-t pt-4">
          <div className="space-y-3">
            <Textarea
              placeholder="Share your thoughts..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (commentText.trim()) {
                    commentMutation.mutate({
                      content: commentText.trim()
                    });
                  }
                }}
                disabled={!commentText.trim() || commentMutation.isPending}
              >
                {commentMutation.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SoapPostCard({ post }: SoapPostCardProps) {
  const [expandedSections, setExpandedSections] = useState({
    observation: false,
    application: false,
    prayer: false
  });
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const { toast } = useToast();

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleReaction = async (reactionType: string) => {
    try {
      await apiRequest('POST', '/api/soap/reaction', {
        soapId: post.id,
        reactionType,
        emoji: reactionType === 'amen' ? '🙏' : '❤️'
      });
      toast({
        title: "Amen! 🙏",
        description: "Your prayer reaction has been added",
      });
      // Invalidate queries to refresh data without page reload
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
    } catch (error) {
      toast({
        title: "Failed to add reaction",
        variant: "destructive",
      });
    }
  };

  const handleComment = () => {
    setCommentDialogOpen(true);
  };

  const handleReflect = async () => {
    try {
      // Copy SOAP content to user's personal journal
      const soapData = post.soapData;
      if (soapData) {
        await apiRequest('POST', '/api/soap/reflect', {
          originalSoapId: post.id,
          scripture: soapData.scripture,
          scriptureReference: soapData.scriptureReference,
          observation: soapData.observation,
          application: soapData.application,
          prayer: soapData.prayer
        });
        toast({
          title: "Copied to your S.O.A.P. journal",
          description: "This reflection is now in your private journal for personal study",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to copy reflection",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      await apiRequest('POST', '/api/soap/save', {
        soapId: post.id
      });
      toast({
        title: "Saved to your collection",
        description: "You can find this reflection in your saved items",
      });
    } catch (error) {
      toast({
        title: "Failed to save",
        variant: "destructive",
      });
    }
  };

  const soapData = post.soapData;
  if (!soapData) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 border-0 shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-400">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8 ring-2 ring-purple-100 dark:ring-purple-900">
            <AvatarImage src={post.author?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-purple-100 text-purple-600 font-medium text-sm">
              {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {post.author?.firstName} {post.author?.lastName}
              </span>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
                shared a S.O.A.P. Reflection
              </span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Scripture Section - Always Visible */}
        <div className="bg-white/80 dark:bg-gray-800/50 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <span className="text-sm">📖</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                Scripture • {soapData.scriptureReference}
              </h3>
              <blockquote className="text-sm text-gray-700 dark:text-gray-200 italic border-l-2 border-purple-200 dark:border-purple-700 pl-3">
                {soapData.scripture}
              </blockquote>
            </div>
          </div>
        </div>

        {/* Collapsible SOAP Sections */}
        <div className="space-y-2">
          {/* Observation */}
          <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg border border-blue-100 dark:border-blue-800">
            <button
              onClick={() => toggleSection('observation')}
              className="w-full p-3 flex items-center justify-between hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-xs">🔍</span>
                </div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Observation
                </span>
              </div>
              {expandedSections.observation ? (
                <ChevronUp className="w-4 h-4 text-blue-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-blue-500" />
              )}
            </button>
            
            {expandedSections.observation && (
              <div className="px-3 pb-3">
                <p className="text-sm text-gray-700 dark:text-gray-200 ml-9">
                  {soapData.observation}
                </p>
              </div>
            )}
          </div>

          {/* Application */}
          <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg border border-green-100 dark:border-green-800">
            <button
              onClick={() => toggleSection('application')}
              className="w-full p-3 flex items-center justify-between hover:bg-green-50/50 dark:hover:bg-green-900/20 transition-colors rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-xs">💡</span>
                </div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Application
                </span>
              </div>
              {expandedSections.application ? (
                <ChevronUp className="w-4 h-4 text-green-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-green-500" />
              )}
            </button>
            
            {expandedSections.application && (
              <div className="px-3 pb-3">
                <p className="text-sm text-gray-700 dark:text-gray-200 ml-9">
                  {soapData.application}
                </p>
              </div>
            )}
          </div>

          {/* Prayer */}
          <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg border border-amber-100 dark:border-amber-800">
            <button
              onClick={() => toggleSection('prayer')}
              className="w-full p-3 flex items-center justify-between hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-colors rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                  <span className="text-xs">🙏</span>
                </div>
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Prayer
                </span>
              </div>
              {expandedSections.prayer ? (
                <ChevronUp className="w-4 h-4 text-amber-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-amber-500" />
              )}
            </button>
            
            {expandedSections.prayer && (
              <div className="px-3 pb-3">
                <p className="text-sm text-gray-700 dark:text-gray-200 ml-9">
                  {soapData.prayer}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Spiritual Reaction Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-purple-100 dark:border-purple-800">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleReaction('amen')}
              className="flex items-center space-x-2 group hover:bg-purple-50 dark:hover:bg-purple-900/20 px-3 py-1.5 rounded-md transition-colors"
            >
              <span className="text-sm">🙏</span>
              <span className="text-sm font-medium text-gray-600 group-hover:text-purple-600 dark:text-gray-400 dark:group-hover:text-purple-400">
                Amen
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{post._count?.likes || 0}</span>
            </button>
            
            <button 
              onClick={() => handleComment()}
              className="flex items-center space-x-2 group hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-md transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400">
                Comment
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {post._count?.comments || 0}
              </span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleReflect()}
              className="flex items-center space-x-1 group hover:bg-green-50 dark:hover:bg-green-900/20 px-2 py-1 rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-gray-500 group-hover:text-green-500 transition-colors" />
              <span className="text-xs font-medium text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400">
                Reflect
              </span>
            </button>
            
            <button 
              onClick={() => handleSave()}
              className="flex items-center space-x-1 group hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded-md transition-colors"
            >
              <Save className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
              <span className="text-xs font-medium text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                Save
              </span>
            </button>
          </div>
        </div>
      </CardContent>

      {/* Comment Dialog */}
      <CommentDialog 
        isOpen={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        postId={post.id}
      />
    </Card>
  );
}