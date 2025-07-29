import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp, Heart, MessageCircle, BookOpen, Save, RotateCcw, Share2, Copy, Facebook, Twitter, Mail, Smartphone, BookmarkX, Bookmark, Flag, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FlagContentDialog } from "./content-moderation/FlagContentDialog";
import { useAuth } from "@/hooks/useAuth";
import { CommentDialog } from "./CommentDialog";
import FormattedContent from '../utils/FormattedContent';

interface SoapPost {
  id: number;
  content: string;
  authorId: string;
  createdAt: string;
  type: 'soap_reflection';
  isSaved?: boolean; // Add saved status
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
  likeCount: number;
  commentCount: number;
  _count?: {
    comments: number;
    likes: number;
  };
}

interface SoapPostCardProps {
  post: SoapPost;
  showRemoveOption?: boolean; // For SavedReflections page
  onRemove?: () => void;
  isRemoving?: boolean;
}

// Using shared CommentDialog component

function SoapPostCard({ post, showRemoveOption = false, onRemove, isRemoving = false }: SoapPostCardProps) {
  const [expandedSections, setExpandedSections] = useState({
    observation: false,
    application: false,
    prayer: false
  });

  // Helper function to truncate text to first 1-2 lines
  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  };
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch comments for this SOAP post to show inline
  const { data: inlineComments = [] } = useQuery({
    queryKey: [`/api/soap-entries/${post.id}/comments`],
    enabled: !!post.id,
  });

  // Save/Unsave mutations
  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/soap-entries/save', { soapId: post.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-profiles/saved-soap-entries'] });
      toast({
        title: "Saved to your collection",
        description: "This reflection has been added to your saved reflections.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to save",
        variant: "destructive",
      });
    }
  });

  const unsaveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/soap-entries/saved/${post.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-profiles/saved-soap-entries'] });
      toast({
        title: "Removed from collection",
        description: "This reflection is no longer saved.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to remove",
        variant: "destructive",
      });
    }
  });

  // Delete SOAP entry mutation
  const deleteSoapMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/soap-entries/${post.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/soap-entries'] });
      setDeleteDialogOpen(false);
      toast({
        title: "S.O.A.P. entry deleted",
        description: "Your reflection has been removed.",
      });
    },
    onError: () => {
      setDeleteDialogOpen(false);
      toast({
        title: "Failed to delete",
        variant: "destructive",
      });
    }
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDeletePost = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDeletePost = () => {
    deleteSoapMutation.mutate();
  };

  const handleReaction = async (reactionType: string) => {
    try {
      const response = await apiRequest('POST', '/api/soap-entries/reactions', {
        soapId: post.id,
        reactionType,
        emoji: reactionType === 'amen' ? '🙏' : '❤️'
      });
      
      if (response.reacted) {
        toast({
          title: "Amen! 🙏",
          description: "Your prayer reaction has been added",
        });
      } else {
        toast({
          title: "Reaction removed",
          description: "Your reaction has been removed",
        });
      }
      
      // Invalidate both feed and discussions queries to refresh reaction counts
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
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
      // Copy only Scripture and reference to user's personal journal for their own reflection
      const soapData = post.soapData;
      if (soapData) {
        await apiRequest('POST', '/api/soap-entries/reflect', {
          originalSoapId: post.id,
          scripture: soapData.scripture,
          scriptureReference: soapData.scriptureReference
          // Note: observation, application, and prayer intentionally omitted to encourage personal reflection
        });
        toast({
          title: "Scripture copied to your S.O.A.P. journal",
          description: "Add your own observations, applications, and prayers for personal reflection",
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
      await apiRequest('POST', '/api/soap-entries/save', {
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

  const handleShare = async (platform: string) => {
    const shareText = `Check out this S.O.A.P. reflection: ${post.soapData?.scriptureReference || 'Scripture'} - ${post.soapData?.scripture || post.content}`;
    const shareUrl = `${window.location.origin}/home`;
    
    try {
      switch (platform) {
        case 'copy':
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          toast({ title: "Link copied!", description: "The post link has been copied to your clipboard" });
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
          await navigator.clipboard.writeText(shareText);
          toast({ title: "Opening Facebook", description: "Text copied to clipboard - paste into your Facebook post" });
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
          toast({ title: "Opening X (Twitter)", description: "Share window opened in new tab" });
          break;
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`, '_blank');
          toast({ title: "Opening WhatsApp", description: "Opening WhatsApp app or web version" });
          break;
        case 'instagram':
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          toast({ title: "Text copied!", description: "Open Instagram and paste into your story or post" });
          break;
        case 'messenger':
          window.open(`https://www.messenger.com/`, '_blank');
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          toast({ title: "Opening Messenger", description: "Text copied to clipboard - paste into your message" });
          break;
        case 'discord':
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          toast({ title: "Text copied!", description: "Open Discord and paste into your channel or DM" });
          break;
        case 'slack':
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          toast({ title: "Text copied!", description: "Open Slack and paste into your workspace" });
          break;
        case 'signal':
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          toast({ title: "Text copied!", description: "Open Signal and paste into your message" });
          break;
        case 'youtube':
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          toast({ title: "Text copied!", description: "Open YouTube and paste into your comment or community post" });
          break;
        case 'sms':
          window.open(`sms:?body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`);
          toast({ title: "Opening SMS", description: "SMS app opened with pre-filled message" });
          break;
        case 'email':
          const subject = encodeURIComponent('S.O.A.P. Reflection - ' + (post.soapData?.scriptureReference || 'Scripture'));
          const body = encodeURIComponent(`${shareText}\n\nRead more at: ${shareUrl}`);
          window.open(`mailto:?subject=${subject}&body=${body}`);
          toast({ title: "Opening Email", description: "Email client opened with pre-filled message" });
          break;
      }
      setShareDialogOpen(false);
    } catch (error) {
      toast({ title: "Failed to share", variant: "destructive" });
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
          {/* Observation - Only show if content exists */}
          {soapData.observation && soapData.observation.trim() && (
            <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="p-3">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-xs">🔍</span>
                  </div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Observation
                  </span>
                </div>
                
                <div className="ml-9">
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {expandedSections.observation ? soapData.observation : truncateText(soapData.observation)}
                  </p>
                  
                  {soapData.observation.length > 120 && (
                    <button
                      onClick={() => toggleSection('observation')}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 mt-1 flex items-center space-x-1"
                    >
                      <span>{expandedSections.observation ? 'Show less' : 'Show more'}</span>
                      {expandedSections.observation ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Application - Only show if content exists */}
          {soapData.application && soapData.application.trim() && (
            <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg border border-green-100 dark:border-green-800">
              <div className="p-3">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-xs">💡</span>
                  </div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Application
                  </span>
                </div>
                
                <div className="ml-9">
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {expandedSections.application ? soapData.application : truncateText(soapData.application)}
                  </p>
                  
                  {soapData.application.length > 120 && (
                    <button
                      onClick={() => toggleSection('application')}
                      className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 mt-1 flex items-center space-x-1"
                    >
                      <span>{expandedSections.application ? 'Show less' : 'Show more'}</span>
                      {expandedSections.application ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Prayer - Only show if content exists */}
          {soapData.prayer && soapData.prayer.trim() && (
            <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg border border-amber-100 dark:border-amber-800">
              <div className="p-3">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                    <span className="text-xs">🙏</span>
                  </div>
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Prayer
                  </span>
                </div>
                
                <div className="ml-9">
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {expandedSections.prayer ? soapData.prayer : truncateText(soapData.prayer)}
                  </p>
                  
                  {soapData.prayer.length > 120 && (
                    <button
                      onClick={() => toggleSection('prayer')}
                      className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 mt-1 flex items-center space-x-1"
                    >
                      <span>{expandedSections.prayer ? 'Show less' : 'Show more'}</span>
                      {expandedSections.prayer ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
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
              <span className="text-xs text-gray-400 dark:text-gray-500">{post.likeCount || 0}</span>
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
                {post.commentCount || 0}
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
            
            {showRemoveOption ? (
              <button 
                onClick={onRemove}
                disabled={isRemoving}
                className="flex items-center space-x-1 group hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-md transition-colors"
              >
                <BookmarkX className="w-4 h-4 text-red-500 group-hover:text-red-700 transition-colors" />
                <span className="text-xs font-medium text-red-600 group-hover:text-red-700 dark:group-hover:text-red-400">
                  {isRemoving ? "Removing..." : "Remove"}
                </span>
              </button>
            ) : (
              <button 
                onClick={() => post.isSaved ? unsaveMutation.mutate() : saveMutation.mutate()}
                disabled={saveMutation.isPending || unsaveMutation.isPending}
                className={`flex items-center space-x-1 group px-2 py-1 rounded-md transition-colors ${
                  post.isSaved
                    ? "bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {post.isSaved ? (
                  <Bookmark className="w-4 h-4 text-purple-600 transition-colors" />
                ) : (
                  <Save className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                )}
                <span className={`text-xs font-medium transition-colors ${
                  post.isSaved
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                }`}>
                  {saveMutation.isPending || unsaveMutation.isPending
                    ? (post.isSaved ? "Removing..." : "Saving...")
                    : (post.isSaved ? "Saved" : "Save")
                  }
                </span>
              </button>
            )}
            
            <button 
              onClick={() => setShareDialogOpen(true)}
              className="flex items-center space-x-1 group hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded-md transition-colors"
            >
              <Share2 className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Share
              </span>
            </button>
            
            {/* Flag Button - Only show for other users' posts */}
            {user && post.author && (String(user.id) !== String(post.author.id) && user.email !== post.author.email) && (
              <FlagContentDialog
                contentType="soap_entry"
                contentId={post.id}
                trigger={
                  <button 
                    className="flex items-center space-x-1 group hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-md transition-colors"
                  >
                    <Flag className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                    <span className="text-xs font-medium text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400">
                      Report
                    </span>
                  </button>
                }
              />
            )}

            {/* Delete Button - Only show for post author */}
            {user && post.author && (String(user.id) === String(post.author.id) || user.email === post.author.email) && (
              <button 
                onClick={handleDeletePost}
                className="flex items-center space-x-1 group hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-md transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-700 transition-colors" />
                <span className="text-xs font-medium text-red-600 group-hover:text-red-700 dark:group-hover:text-red-400">
                  Delete
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Comments Section - Show comments below each SOAP post */}
        {inlineComments && inlineComments.length > 0 && (
          <div className="mt-4 pt-3 border-t border-purple-100 dark:border-purple-800">
            <div className="space-y-3">
              {inlineComments.slice(0, 3).map((comment: any) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.author?.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                      {comment.author?.firstName?.[0] || comment.authorId?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {comment.author?.firstName ? `${comment.author.firstName} ${comment.author.lastName || ''}`.trim() : 'Community Member'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center">
                    <FlagContentDialog
                      contentType="comment"
                      contentId={comment.id}
                      trigger={
                        <button 
                          className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                          aria-label="Report comment"
                        >
                          <Flag className="w-3 h-3 text-gray-400 hover:text-red-500 transition-colors" />
                        </button>
                      }
                    />
                  </div>
                </div>
              ))}
              {inlineComments.length > 3 && (
                <button
                  onClick={() => setCommentDialogOpen(true)}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  View all {inlineComments.length} comments
                </button>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Comment Dialog */}
      <CommentDialog 
        isOpen={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        postId={post.id}
        postType="soap"
      />
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md" aria-describedby="share-dialog-description">
          <DialogHeader>
            <DialogTitle>Share S.O.A.P. Reflection</DialogTitle>
            <DialogDescription id="share-dialog-description">
              Choose how you'd like to share this spiritual reflection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => handleShare('copy')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <Copy className="w-6 h-6 text-gray-600" />
                <span className="text-sm">Copy URL</span>
              </Button>
              
              <Button
                onClick={() => handleShare('facebook')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <Facebook className="w-6 h-6 text-blue-600" />
                <span className="text-sm">Facebook</span>
              </Button>
              
              <Button
                onClick={() => handleShare('twitter')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <Twitter className="w-6 h-6 text-sky-500" />
                <span className="text-sm">X (Twitter)</span>
              </Button>
              
              <Button
                onClick={() => handleShare('whatsapp')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <MessageCircle className="w-6 h-6 text-green-600" />
                <span className="text-sm">WhatsApp</span>
              </Button>
              
              <Button
                onClick={() => handleShare('instagram')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <MessageCircle className="w-6 h-6 text-pink-600" />
                <span className="text-sm">Instagram</span>
              </Button>
              
              <Button
                onClick={() => handleShare('messenger')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <MessageCircle className="w-6 h-6 text-blue-500" />
                <span className="text-sm">Messenger</span>
              </Button>
              
              <Button
                onClick={() => handleShare('discord')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <MessageCircle className="w-6 h-6 text-purple-600" />
                <span className="text-sm">Discord</span>
              </Button>
              
              <Button
                onClick={() => handleShare('slack')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <MessageCircle className="w-6 h-6 text-purple-500" />
                <span className="text-sm">Slack</span>
              </Button>
              
              <Button
                onClick={() => handleShare('signal')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <MessageCircle className="w-6 h-6 text-blue-600" />
                <span className="text-sm">Signal</span>
              </Button>
              
              <Button
                onClick={() => handleShare('youtube')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <MessageCircle className="w-6 h-6 text-red-600" />
                <span className="text-sm">YouTube</span>
              </Button>
              
              <Button
                onClick={() => handleShare('sms')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <Smartphone className="w-6 h-6 text-green-600" />
                <span className="text-sm">SMS</span>
              </Button>
              
              <Button
                onClick={() => handleShare('email')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <Mail className="w-6 h-6 text-gray-600" />
                <span className="text-sm">Email</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete S.O.A.P. Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this S.O.A.P. reflection? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteSoapMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeletePost}
              disabled={deleteSoapMutation.isPending}
            >
              {deleteSoapMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export { SoapPostCard };
export default SoapPostCard;