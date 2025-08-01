import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { apiRequest } from "../lib/queryClient";
import { 
  Heart, 
  MessageCircle, 
  RotateCw, 
  Clock, 
  MapPin, 
  Users,
  Church,
  BookOpen,
  Book,
  PlusCircle,
  Bookmark,
  BookmarkCheck,
  Send,
  X,
  Smile,
  ChevronDown,
  Globe,
  Lock,
  Eye,
  Image as ImageIcon,
  Video,
  FileText,
  BookText,
  Mic,
  MicOff,
  Hash,
  AtSign,
  Camera,
  Paperclip,
  Play,
  Pause,
  Pin,
  PinOff,
  MoreHorizontal,
  Trash2,
  Share2,
  Loader2,
  Smartphone,
  Mail,
  Copy,
  Flag
} from "lucide-react";
import { FaFacebook as Facebook, FaTwitter as Twitter } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import ExpirationSettings from "./ExpirationSettings";
import { ShareDialog } from './ShareDialog';
import FormattedContent from '../utils/FormattedContent';
import { SoapPostCard } from './SoapPostCard';
import { FlagContentDialog } from './content-moderation/FlagContentDialog';
import { ContentModerationStatus, HiddenContentPlaceholder } from './content-moderation/ContentModerationStatus';
import { CommentConfirmationDialog } from './CommentConfirmationDialog';
import { CommentDialog } from './CommentDialog';
import SocialFeedEMISelector from './SocialFeedEMISelector';
import EMIAwareRecommendations from './EMIAwareRecommendations';

interface FeedPost {
  id: number;
  type: 'discussion' | 'prayer' | 'event' | 'inspiration' | 'announcement' | 'share' | 'soap';
  title?: string;
  content: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
  };
  church?: {
    id: number;
    name: string;
  };
  audience?: 'public' | 'church' | 'private';
  createdAt: Date;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isBookmarked?: boolean;
  suggestedVerses?: any[];
  tags?: string[];
  eventDate?: Date;
  location?: string;
  mood?: string;
  isPinned?: boolean;
  pinnedBy?: string;
  pinnedAt?: Date;
  pinnedUntil?: Date;
  pinCategory?: string;
  attachedMedia?: Array<{name: string; type: string; size: number; url: string; filename: string}>;
  linkedVerse?: {reference: string; text: string};
  comments?: Array<{id: number; content: string; author: {name: string; profileImageUrl?: string}; createdAt: Date}>;
  // SOAP-specific fields
  soapEntry?: {
    id: number;
    scripture: string;
    scriptureReference?: string;
    observation: string;
    application: string;
    prayer: string;
    devotionalDate?: Date;
    streakDay?: number;
    bibleVersion?: string;
  };
}

export default function SocialFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newPost, setNewPost] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<number[]>([]);
  // Legacy recentMoods removed - using EMI system
  const [showComposer, setShowComposer] = useState(true);
  const [showMoodDropdown, setShowMoodDropdown] = useState(false);
  const [showVerseSearch, setShowVerseSearch] = useState(false);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<'public' | 'church' | 'private'>('public');
  const [verseQuery, setVerseQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [linkedVerse, setLinkedVerse] = useState<{reference: string; text: string} | null>(null);
  const [attachedMedia, setAttachedMedia] = useState<Array<{name: string; type: string; size: number; url: string; filename: string}>>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [postType, setPostType] = useState<string>('discussion');
  const [commentDialogOpen, setCommentDialogOpen] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [commentSort, setCommentSort] = useState<'newest' | 'most_liked'>('newest');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState<{[key: number]: number}>({});
  const [showSoapDialog, setShowSoapDialog] = useState(false);
  const [selectedSoapEntry, setSelectedSoapEntry] = useState<any>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState<number | null>(null);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showCommentConfirmation, setShowCommentConfirmation] = useState(false);
  const [lastCommentData, setLastCommentData] = useState<{
    content: string;
    postTitle: string;
    postId: number;
  } | null>(null);
  const [expirationSettings, setExpirationSettings] = useState<{
    expiresAt: Date | null;
    allowsExpiration: boolean;
  }>({
    expiresAt: null,
    allowsExpiration: false,
  });
  
  // Refs for click-outside functionality
  const moodDropdownRef = useRef<HTMLDivElement>(null);
  const verseDropdownRef = useRef<HTMLDivElement>(null);
  const audienceDropdownRef = useRef<HTMLDivElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moodDropdownRef.current && !moodDropdownRef.current.contains(event.target as Node)) {
        setShowMoodDropdown(false);
      }
      if (verseDropdownRef.current && !verseDropdownRef.current.contains(event.target as Node)) {
        setShowVerseSearch(false);
      }
      if (audienceDropdownRef.current && !audienceDropdownRef.current.contains(event.target as Node)) {
        setShowAudienceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch feed posts
  const { data: feedPosts = [], isLoading, error } = useQuery({
    queryKey: ['/api/discussions'],
  });

  // Display a limited number of posts initially
  const displayedPosts = showAllPosts ? feedPosts : feedPosts.slice(0, 3);



  // Search verses
  const { data: verseSearchData, isLoading: isSearchingVerses } = useQuery<{verses: Array<{id: string; reference: string; text: string}>}>({
    queryKey: ['/api/bible/search', verseQuery],
    enabled: verseQuery.length >= 2,
  });
  
  const verseSearchResults = verseSearchData?.verses || [];

  // Fetch user's SOAP entries
  const { data: soapEntries = [] } = useQuery<any[]>({
    queryKey: ['/api/soap-entries'],
    enabled: showSoapDialog,
  });

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest('POST', `/api/discussions/${postId}/like`);
    },
    onSuccess: (data, postId) => {
      // Simply invalidate to refetch and show updated counts
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      
      toast({
        title: data.liked ? "Post liked!" : "Like removed",
        description: data.liked ? "You liked this post" : "You removed your like",
      });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive"
      });
    }
  });

  // Helper function to determine post type for CommentDialog
  const getPostType = (postId: number): 'discussion' | 'soap' | 'community' | 'prayer' => {
    const currentPost = (feedPosts as any[])?.find((post: any) => post.id === postId);

    
    if (!currentPost) {

      // For known prayer request IDs, return 'prayer' even if not in current feed
      if (postId === 2645) {

        return 'prayer';
      }
      return 'discussion';
    }
    
    // Check for prayer request
    if (currentPost?.type === 'prayer_request' || currentPost?.isPrayerRequest || currentPost?.category) {

      return 'prayer';
    }
    
    // Check for SOAP entry
    const isSOAPEntry = currentPost?.type === 'soap' || 
                       currentPost?.type === 'soap_reflection' || 
                       currentPost?.postType === 'soap' ||
                       currentPost?.soapEntry;
    if (isSOAPEntry) {

      return 'soap';
    }
    

    return 'discussion';
  };

  // Prayer reaction mutation
  const prayMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest('POST', '/api/discussions/reaction', { 
        discussionId: postId,
        emoji: '🙏',
        type: 'pray'
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      const message = data?.data?.isPraying ? "Added to your prayer list" : "Removed from prayer list";
      toast({
        title: data?.data?.isPraying ? "Praying! 🙏" : "Prayer removed",
        description: message,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update prayer",
        variant: "destructive"
      });
    }
  });

  // Share/repost mutation
  const shareMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest('POST', `/api/discussions/${postId}/share`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      toast({
        title: "Success",
        description: "Post shared successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share",
        variant: "destructive"
      });
    }
  });

  // Handle sophisticated share functionality
  const handleShare = async (postId: number, platform: string) => {
    const post = feedPosts.find((p: any) => p.id === postId);
    if (!post) return;
    
    const shareText = `Check out this post: ${post.content}`;
    const shareUrl = `${window.location.origin}/home`;
    
    try {
      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
          navigator.clipboard.writeText(shareText);
          toast({ title: "Text copied to clipboard", description: "Paste into your Facebook post" });
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
          break;
        case 'email':
          const subject = encodeURIComponent('Check out this post');
          const body = encodeURIComponent(`${shareText}\n\nRead more at: ${shareUrl}`);
          window.open(`mailto:?subject=${subject}&body=${body}`);
          break;
        case 'sms':
          window.open(`sms:?body=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
          break;
        case 'copy':
          await navigator.clipboard.writeText(shareText + ' ' + shareUrl);
          toast({ title: "Link copied to clipboard", description: "You can now paste it anywhere" });
          break;
        case 'repost':
          // Use the existing repost functionality
          shareMutation.mutate(postId);
          break;
      }
      setShareDialogOpen(null);
    } catch (error) {
      toast({ title: "Failed to share", variant: "destructive" });
    }
  };

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return apiRequest('POST', '/api/discussions', postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      
      // Reset form
      setNewPost('');
      setSelectedMoods([]);
      setLinkedVerse(null);
      setAttachedMedia([]);
      setSelectedAudience('public');
      setExpirationSettings({ expiresAt: null, allowsExpiration: false });
      
      // Show success message that auto-dismisses
      toast({
        title: "Posted successfully!",
        description: "Your post has been shared with the community.",
        duration: 3000, // Auto-dismiss after 3 seconds
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to share post: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    }
  });

  // Delete post mutation with improved error handling
  const deletePostMutation = useMutation({
    mutationFn: async ({ postId, postType }: { postId: number; postType: string }) => {
      try {
        let response;
        if (postType === 'soap_reflection') {
          response = await apiRequest('DELETE', `/api/soap-entries/${postId}`);
        } else {
          response = await apiRequest('DELETE', `/api/discussions/${postId}`);
        }
        return response;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      try {
        // Safely update cache without triggering route changes
        queryClient.setQueryData(['/api/discussions'], (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.filter((post: any) => post.id !== postToDelete);
        });
        
        // Reset dialog state first to prevent UI issues
        setDeleteDialogOpen(false);
        setPostToDelete(null);
        setPostType('discussion');
        
        // Provide user feedback
        setTimeout(() => {
          toast({
            title: "Success",
            description: "Post deleted!",
          });
        }, 100);
        
      } catch (error) {
        // Fallback: refresh the feed data if cache update fails
        queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      }
    },
    onError: (error: any) => {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      setPostType('discussion');
      toast({
        title: "Error",
        description: `Failed to delete post: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    }
  });

  const handleDeletePost = (postId: number, postType: string = 'discussion') => {
    setPostToDelete(postId);
    setPostType(postType);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePost = () => {
    if (postToDelete) {
      deletePostMutation.mutate({ postId: postToDelete, postType: postType || 'discussion' });
    }
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    // Ensure all data is properly serializable
    const postData = {
      type: 'discussion',
      content: newPost,
      mood: selectedMoods.length > 0 ? selectedMoods.join(',') : null,
      audience: selectedAudience,
      linkedVerse: linkedVerse ? {
        reference: linkedVerse.reference,
        text: linkedVerse.text
      } : null,
      attachedMedia: attachedMedia.length > 0 ? attachedMedia.map(media => ({
        name: media.name,
        type: media.type,
        size: media.size,
        url: media.url,
        filename: media.filename
      })) : null,
      // Expiration settings
      expiresAt: expirationSettings.expiresAt,
      allowsExpiration: expirationSettings.allowsExpiration,
    };

    createPostMutation.mutate(postData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select files smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAttachedMedia(prev => [...prev, {
          name: file.name,
          type: file.type,
          size: file.size,
          url: result,
          filename: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          setAudioChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.onstop = () => {
        // Use ref for current chunks to avoid stale state
        const currentChunks = audioChunksRef.current;
        
        if (currentChunks.length === 0) {
          toast({
            title: "Recording failed",
            description: "No audio data captured. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        const audioBlob = new Blob(currentChunks, { type: 'audio/webm' });
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          
          const audioData = {
            name: `voice-recording-${recordingDuration}s.webm`,
            type: 'audio/webm',
            size: audioBlob.size,
            url: result,
            filename: `voice-recording-${recordingDuration}s.webm`
          };
          setAttachedMedia(prev => [...prev, audioData]);
          
          // Reset both state and ref
          setAudioChunks([]);
          audioChunksRef.current = [];
        };
        reader.readAsDataURL(audioBlob);
      };
      
      setMediaRecorder(recorder);
      
      // Reset audio chunks before starting
      setAudioChunks([]);
      audioChunksRef.current = [];
      
      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
      
      toast({
        title: "Recording started",
        description: "Click the mic button again to stop recording",
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Please allow microphone access to record audio.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      // Clear timer
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      
      toast({
        title: "Recording saved",
        description: `Voice message (${recordingDuration}s) has been attached.`,
      });
    }
  };

  const audienceOptions = [
    {
      id: 'public',
      label: 'Public',
      description: 'Anyone can see this post',
      icon: Globe,
      color: 'text-blue-600'
    },
    {
      id: 'church',
      label: 'Church Members',
      description: 'Only members of your church can see this',
      icon: Church,
      color: 'text-purple-600'
    },
    {
      id: 'private',
      label: 'Private',
      description: 'Only you can see this post',
      icon: Lock,
      color: 'text-gray-600'
    }
  ];

  // Legacy mood system removed - now using Enhanced Mood Indicators (EMI)

  const toggleMoodSelection = (moodId: number) => {
    setSelectedMoods(prev => {
      if (prev.includes(moodId)) {
        const newMoods = prev.filter(id => id !== moodId);

        return newMoods;
      } else {
        // Limit to 3 moods maximum for social posts
        if (prev.length >= 3) {
          toast({
            title: "Maximum moods reached",
            description: "You can select up to 3 moods per post.",
            variant: "destructive",
          });
          return prev;
        }
        const newMoods = [...prev, moodId];

        return newMoods;
      }
    });
  };

  const clearMoods = () => {
    setSelectedMoods([]);
  };

  // Don't hide the entire component while loading - show composer and loading state for posts
  const isPostsLoading = isLoading;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Post Composer */}
      {showComposer && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage 
                  src={user && typeof user === 'object' && 'profileImageUrl' in user ? user.profileImageUrl : ""} 
                  alt="Profile"
                  className="object-cover"
                />
                <AvatarFallback className="bg-purple-600 text-white">
                  {user && typeof user === 'object' && 'firstName' in user && user.firstName && 'lastName' in user && user.lastName 
                    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                    : user && typeof user === 'object' && 'firstName' in user && user.firstName 
                    ? user.firstName[0].toUpperCase()
                    : user && typeof user === 'object' && 'email' in user && user.email
                    ? user.email[0].toUpperCase()
                    : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your thoughts, prayers, or reflections..."
                  className="w-full border-0 p-0 text-base resize-none focus:ring-0 bg-transparent"
                  rows={3}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Enhanced Mood Indicators (EMI) Selector */}
            <div className="mb-4">
              <SocialFeedEMISelector
                selectedMoods={selectedMoods}
                onMoodToggle={toggleMoodSelection}
                maxMoods={3}
                compact={true}
              />
            </div>

            {/* EMI-Aware AI Recommendations */}
            {selectedMoods.length > 0 && (
              <EMIAwareRecommendations
                selectedMoodIds={selectedMoods}
                emiCategories={['Emotional Well-being', 'Spiritual States', 'Faith & Worship', 'Growth & Transformation']}
                isVisible={true}
                compact={true}
              />
            )}
            

            
            {/* AI recommendations based on mood selection */}
            {selectedMoods.length > 0 ? (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                <h4 className="font-medium text-green-800 mb-2">✅ AI Recommendations Should Be Here</h4>
                <EMIAwareRecommendations
                  selectedMoodIds={selectedMoods}
                  emiCategories={['Emotional Well-being', 'Spiritual States', 'Faith & Worship', 'Growth & Transformation']}
                  isVisible={true}
                  compact={true}
                />
              </div>
            ) : (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <h4 className="font-medium text-red-800">❌ No moods selected - AI recommendations hidden</h4>
              </div>
            )}

            {/* Linked Verse Display */}
            {linkedVerse && (
              <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-purple-800 dark:text-purple-200 text-sm mb-1">{linkedVerse.reference}</div>
                    <div className="text-purple-700 dark:text-purple-300 text-sm italic">"{linkedVerse.text}"</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLinkedVerse(null)}
                    className="h-6 w-6 p-0 text-purple-400 hover:text-purple-600 ml-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Attached Media Display */}
            {attachedMedia.length > 0 && (
              <div className="mb-3 space-y-2">
                {attachedMedia.map((media, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="flex-shrink-0">
                      {media.type.startsWith('image/') ? (
                        <img src={media.url} alt={media.name} className="w-12 h-12 object-cover rounded" />
                      ) : media.type.startsWith('audio/') ? (
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded flex items-center justify-center">
                          <Mic className="w-6 h-6 text-red-600" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{media.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{(media.size / 1024 / 1024).toFixed(1)} MB</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachedMedia(prev => prev.filter((_, i) => i !== index))}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons Row - Icon Only with Tooltips */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                {/* Media Upload */}
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="text-gray-600 hover:text-green-600 hover:bg-green-50 p-1.5 h-8 w-8"
                    type="button"
                    title="Add photo"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </div>

                {/* Audio Recording */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    className={`relative p-1.5 h-8 w-8 ${
                      isRecording 
                        ? 'text-red-600 hover:text-red-700 hover:bg-red-50 animate-pulse' 
                        : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title={isRecording ? "Click to stop recording" : "Click to start voice recording"}
                  >
                    <Mic className={`w-4 h-4 ${isRecording ? 'fill-current' : ''}`} />
                    {isRecording && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    )}
                  </Button>
                  {isRecording && (
                    <span className="text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded">
                      {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* EMI Modal Trigger */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMoodDropdown(!showMoodDropdown)}
                  className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 p-1.5 h-8 w-8"
                  type="button"
                  title="Expand mood selection"
                >
                  <Smile className="w-4 h-4" />
                </Button>

                {/* Bible Verse Link */}
                <div className="relative" ref={verseDropdownRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVerseSearch(!showVerseSearch)}
                    className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 p-1.5 h-8 w-8"
                    title="Add Bible verse"
                  >
                    <BookOpen className="w-4 h-4" />
                  </Button>

                  {/* Bible Verse Search Dropdown */}
                  {showVerseSearch && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg w-72 max-w-[calc(100vw-2rem)]">
                      <div className="p-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">Search Bible Verses</div>
                        <div className="relative mb-3">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={verseQuery}
                            onChange={(e) => setVerseQuery(e.target.value)}
                            placeholder="Search by reference or keywords..."
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        
                        {linkedVerse && (
                          <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                            <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Selected Verse:</div>
                            <div className="text-sm text-purple-800 dark:text-purple-200 font-medium">{linkedVerse.reference}</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLinkedVerse(null)}
                              className="mt-1 h-6 px-2 text-xs text-purple-600 hover:text-purple-800"
                            >
                              Remove
                            </Button>
                          </div>
                        )}

                        {isSearchingVerses && (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            <span className="text-sm text-gray-500">Searching verses...</span>
                          </div>
                        )}

                        {verseSearchResults && verseSearchResults.length > 0 && (
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {verseSearchResults.slice(0, 5).map((verse: any) => (
                              <Button
                                key={verse.id}
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setLinkedVerse({
                                    reference: verse.reference,
                                    text: verse.text
                                  });
                                  setShowVerseSearch(false);
                                  setVerseQuery('');
                                }}
                                className="w-full h-auto p-2 text-left justify-start hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <div className="w-full">
                                  <div className="font-medium text-sm text-gray-900 dark:text-white">{verse.reference}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-300 truncate">{verse.text}</div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        )}

                        {verseQuery.length >= 2 && !isSearchingVerses && (!verseSearchResults || verseSearchResults.length === 0) && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            No verses found. Try different keywords or a reference like "John 3:16"
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Share SOAP Entry */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSoapDialog(true)}
                  className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 h-8 w-8"
                  title="Share SOAP journal entry"
                >
                  <BookText className="w-4 h-4" />
                </Button>

                {/* Audience Selector */}
                <div className="relative" ref={audienceDropdownRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-1.5 h-8 w-8"
                    title="Post visibility"
                  >
                    {React.createElement(audienceOptions.find(opt => opt.id === selectedAudience)?.icon || Globe, { className: "w-4 h-4" })}
                  </Button>

                  {/* Audience Dropdown */}
                  {showAudienceDropdown && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-64">
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">Who can see this?</div>
                        {audienceOptions.map((audience) => (
                          <Button
                            key={audience.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAudience(audience.id as 'public' | 'church' | 'private');
                              setShowAudienceDropdown(false);
                            }}
                            className={`w-full justify-start h-auto p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                              selectedAudience === audience.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              {React.createElement(audience.icon, { className: `w-5 h-5 ${audience.color} mt-0.5` })}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 dark:text-white">{audience.label}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{audience.description}</div>
                              </div>
                              {selectedAudience === audience.id && (
                                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Share Button - Always visible on the right */}
              <div className="flex-shrink-0">
                <Button 
                  onClick={handleCreatePost}
                  disabled={!newPost.trim() || createPostMutation.isPending}
                  className="bg-[#5A2671] hover:bg-[#4A1F5C] text-white font-medium px-4 py-2 h-8 border-0 flex items-center gap-2"
                  title={createPostMutation.isPending ? 'Posting...' : 'Share post'}
                >
                  <Send className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Share</span>
                </Button>
              </div>
            </div>

            {/* Expiration Settings Section - Always visible below toolbar */}
            <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
              <ExpirationSettings
                contentType="discussion"
                allowsExpiration={expirationSettings.allowsExpiration}
                initialExpiresAt={expirationSettings.expiresAt}
                onSettingsChange={setExpirationSettings}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* COMPLETELY NEW EMI MODAL - REPLACING LEGACY SYSTEM */}
      {showMoodDropdown && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Enhanced Mood Indicators (EMI) - All 6 Categories</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMoodDropdown(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Select up to 3 feelings that describe your current emotional and spiritual state
              </p>
            </div>
            <div className="p-6 overflow-y-auto">
              <SocialFeedEMISelector
                selectedMoods={selectedMoods}
                onMoodToggle={toggleMoodSelection}
                maxMoods={3}
                compact={false}
              />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setSelectedMoods([])}
                disabled={selectedMoods.length === 0}
              >
                Clear All
              </Button>
              <Button
                onClick={() => setShowMoodDropdown(false)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Done ({selectedMoods.length}/3)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Feed Posts */}
      <div className="space-y-6">
        {isPostsLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading posts...</span>
          </div>
        ) : Array.isArray(feedPosts) && feedPosts.length > 0 ? feedPosts.map((post: FeedPost) => (
          <Card key={post.id} id={`post-${post.id}`} className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={post.author?.profileImageUrl || ""} 
                    alt={`${post.author?.firstName} ${post.author?.lastName}` || 'User'}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-purple-600 text-white">
                    {((post.author?.firstName?.[0] || '') + (post.author?.lastName?.[0] || '')) ||
                     post.author?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {post.author?.firstName && post.author?.lastName 
                        ? `${post.author.firstName} ${post.author.lastName}`
                        : post.author?.firstName || post.author?.email || 'User'
                      }
                    </h4>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      {formatDistanceToNow(new Date(post.createdAt)).replace('about ', '~').replace(' ago', '').replace(' hours', 'hrs').replace(' hour', 'hr').replace(' minutes', 'min').replace(' days', 'd').replace(' day', 'd')}
                    </span>
                  </div>
                  <div className="text-gray-800 dark:text-gray-300 mt-2">
                    {post.title?.includes('S.O.A.P. Reflection') ? (
                      <div className="space-y-3">
                        {post.content.split('\n\n').map((section, index) => {
                          if (!section.trim()) return null;
                          
                          // Handle Scripture section
                          if (section.includes('📖') && section.includes('<strong>Scripture</strong>')) {
                            const scriptureText = section.replace('📖 <strong>Scripture</strong>: ', '').replace(/<[^>]*>/g, '').trim();
                            return (
                              <div key={index} className="border-l-4 border-purple-500 pl-4">
                                <div className="flex items-start gap-2">
                                  <span className="text-lg">📖</span>
                                  <div>
                                    <p className="font-semibold text-purple-700 dark:text-purple-300">Scripture</p>
                                    <p className="text-gray-700 dark:text-gray-300 mt-1">{scriptureText}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          
                          // Handle Observation section
                          if (section.includes('🔍') && section.includes('<strong>Observation</strong>')) {
                            const observationText = section.replace('🔍 <strong>Observation</strong>: ', '').replace(/<[^>]*>/g, '').trim();
                            return (
                              <div key={index} className="border-l-4 border-blue-500 pl-4">
                                <div className="flex items-start gap-2">
                                  <span className="text-lg">🔍</span>
                                  <div>
                                    <p className="font-semibold text-blue-700 dark:text-blue-300">Observation</p>
                                    <p className="text-gray-700 dark:text-gray-300 mt-1">{observationText}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          
                          // Handle Application section
                          if (section.includes('💡') && section.includes('<strong>Application</strong>')) {
                            const applicationText = section.replace('💡 <strong>Application</strong>: ', '').replace(/<[^>]*>/g, '').trim();
                            return (
                              <div key={index} className="border-l-4 border-green-500 pl-4">
                                <div className="flex items-start gap-2">
                                  <span className="text-lg">💡</span>
                                  <div>
                                    <p className="font-semibold text-green-700 dark:text-green-300">Application</p>
                                    <p className="text-gray-700 dark:text-gray-300 mt-1">{applicationText}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          
                          // Handle Prayer section
                          if (section.includes('🙏') && section.includes('<strong>Prayer</strong>')) {
                            const prayerText = section.replace('🙏 <strong>Prayer</strong>: ', '').replace(/<[^>]*>/g, '').trim();
                            return (
                              <div key={index} className="border-l-4 border-orange-500 pl-4">
                                <div className="flex items-start gap-2">
                                  <span className="text-lg">🙏</span>
                                  <div>
                                    <p className="font-semibold text-orange-700 dark:text-orange-300">Prayer</p>
                                    <p className="text-gray-700 dark:text-gray-300 mt-1">{prayerText}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          
                          // Fallback for any other content
                          return (
                            <p key={index} className="whitespace-pre-wrap">{section}</p>
                          );
                        }).filter(Boolean)}
                      </div>
                    ) : (
                      <div>
                        <p className="whitespace-pre-wrap">{post.content}</p>
                        
                        {/* Video content detection and rendering */}
                        {(() => {
                          const hasVideoContent = post.content?.includes('📺') && post.content?.includes('🎬 Watch:');
                          
                          if (hasVideoContent) {
                            // Extract video information
                            const titleMatch = post.content.match(/📺 \*\*Shared Video: (.*?)\*\*/);
                            const title = titleMatch ? titleMatch[1] : 'Shared Video';
                            
                            const urlMatch = post.content.match(/🎬 Watch: (https:\/\/[^\s]+)/);
                            const url = urlMatch ? urlMatch[1] : '';
                            
                            const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
                            const videoId = videoIdMatch ? videoIdMatch[1] : '';
                            const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
                            
                            return (
                              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700 mt-3">
                                <div className="flex items-start gap-4">
                                  {thumbnail && (
                                    <div className="relative flex-shrink-0 w-32 h-20 sm:w-40 sm:h-24">
                                      <img 
                                        src={thumbnail} 
                                        alt={title}
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          if (target.src.includes('maxresdefault')) {
                                            target.src = target.src.replace('maxresdefault', 'hqdefault');
                                          }
                                        }}
                                      />
                                      <div 
                                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 hover:bg-opacity-30 transition-all rounded-lg cursor-pointer" 
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (url) {
                                            window.open(url, '_blank', 'noopener,noreferrer');
                                          }
                                        }}
                                      >
                                        <Play className="w-8 h-8 text-white" />
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2">{title}</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="outline" className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600">
                                        📺 Video
                                      </Badge>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">YouTube</span>
                                    </div>
                                    
                                    <div className="mt-3">
                                      <Button 
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (url) {
                                            window.open(url, '_blank', 'noopener,noreferrer');
                                          }
                                        }}
                                        size="sm" 
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                      >
                                        <Play className="w-3 h-3 mr-1" />
                                        Watch Video
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          
                          return null;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Attached Media */}
              {post.attachedMedia && post.attachedMedia.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-1 gap-2">
                    {post.attachedMedia.map((media: any, index: number) => (
                      <div key={index} className="relative">
                        {media.type?.startsWith('image/') && (
                          <img
                            src={media.url}
                            alt={media.name || 'Attached image'}
                            className="w-full max-w-md rounded-lg border border-gray-200 dark:border-gray-700"
                            style={{ maxHeight: '400px', objectFit: 'cover' }}
                          />
                        )}
                        {media.type?.startsWith('audio/') && (
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-w-md">
                            <div className="flex items-center space-x-3">
                              <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-full">
                                <Mic className="w-5 h-5 text-red-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Voice Message</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{media.name || 'voice-recording.wav'}</p>
                              </div>
                            </div>
                            <audio 
                              controls 
                              className="w-full mt-3"
                              style={{ height: '40px' }}
                              onError={(e) => {
                              }}
                            >
                              <source src={media.url} type={media.type} />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Post Actions - Using same system as SOAP posts */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  {/* Love Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => likeMutation.mutate(post.id)}
                    className={`group transition-all duration-200 ${
                      post.isLiked 
                        ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                    disabled={likeMutation.isPending}
                    title={post.isLiked ? "You loved this" : "Love this post"}
                  >
                    <Heart className={`w-4 h-4 mr-1 transition-all duration-200 ${
                      post.isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'
                    }`} />
                    <span className="font-medium">{post.likeCount || 0}</span>
                  </Button>

                  {/* Prayer Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => prayMutation.mutate(post.id)}
                    className={`group transition-all duration-200 ${
                      post.isPraying 
                        ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                    disabled={prayMutation.isPending}
                    title={post.isPraying ? "You are praying" : "Pray for this"}
                  >
                    <span className={`text-sm mr-1 transition-all duration-200 ${
                      post.isPraying ? 'scale-110' : 'group-hover:scale-110'
                    }`}>🙏</span>
                    <span className="font-medium">{post.prayCount || 0}</span>
                  </Button>

                  {/* Comments Button - Toggle inline comments */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setExpandedComments(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(post.id)) {
                          newSet.delete(post.id);
                        } else {
                          newSet.add(post.id);
                        }
                        return newSet;
                      });
                    }}
                    className="text-gray-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 group transition-all duration-200"
                    title="View and add comments"
                  >
                    <MessageCircle className="w-4 h-4 mr-1 group-hover:scale-110 transition-all duration-200" />
                    <span className="font-medium">{post.commentCount || 0}</span>
                  </Button>

                  {/* Share Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShareDialogOpen(post.id)}
                    className="text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 group transition-all duration-200"
                    title="Share this post"
                  >
                    <Share2 className="w-4 h-4 mr-1 group-hover:scale-110 transition-all duration-200" />
                    {post.shareCount > 0 && <span className="font-medium">{post.shareCount}</span>}
                  </Button>

                  {/* Flag Button - Only show for other users' posts */}
                  {user && post.author && (String(user.id) !== String(post.author.id) && user.email !== post.author.email) && (
                    <FlagContentDialog
                      contentType={post.type === 'soap_reflection' ? 'soap_entry' : 'discussion'}
                      contentId={post.id}
                      trigger={
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 group transition-all duration-200"
                          title="Report this content"
                        >
                          <Flag className="w-4 h-4 group-hover:scale-110 transition-all duration-200" />
                        </Button>
                      }
                    />
                  )}
                </div>
                
                {/* Delete Button - Only show for post author */}
                {user && post.author && (String(user.id) === String(post.author.id) || user.email === post.author.email) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeletePost(post.id, post.type || 'discussion')}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title={`Delete ${post.type === 'soap_reflection' ? 'S.O.A.P. entry' : 'post'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Comments Section */}
              {expandedComments.has(post.id) && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  {/* Comment Sort Options */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sort by:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCommentSort('newest')}
                        className={`text-xs ${commentSort === 'newest' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
                      >
                        Newest
                      </Button>
                      <span className="text-gray-300">|</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCommentSort('most_liked')}
                        className={`text-xs ${commentSort === 'most_liked' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
                      >
                        Most liked
                      </Button>
                    </div>
                  </div>

                  {/* Add Comment Form */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-purple-600 text-white text-sm">
                          {user && typeof user === 'object' && 'firstName' in user && user.firstName && 'lastName' in user && user.lastName 
                            ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                            : user && typeof user === 'object' && 'firstName' in user && user.firstName 
                            ? user.firstName[0].toUpperCase()
                            : user && typeof user === 'object' && 'email' in user && user.email
                            ? user.email[0].toUpperCase()
                            : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a comment..."
                          className="min-h-[60px] text-sm resize-none border-0 bg-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              if (commentText.trim()) {
                                commentMutation.mutate({ 
                                  postId: post.id, 
                                  content: commentText.trim() 
                                });
                              }
                            }}
                            disabled={commentMutation.isPending || !commentText.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          >
                            {commentMutation.isPending ? "Posting..." : "Comment"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  {post.comments && post.comments.length > 0 ? (
                    <div className="space-y-3">
                      {post.comments
                        .sort((a: any, b: any) => {
                          if (commentSort === 'newest') {
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                          } else {
                            return (b.likeCount || 0) - (a.likeCount || 0);
                          }
                        })
                        .slice(0, visibleCommentsCount[post.id] || 3)
                        .map((comment: any) => (
                          <div key={comment.id} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                            <Avatar className="w-8 h-8">
                              {comment.author?.profileImageUrl && (
                                <AvatarImage 
                                  src={comment.author.profileImageUrl} 
                                  alt={comment.author.name || 'User'} 
                                  className="object-cover"
                                />
                              )}
                              <AvatarFallback className="bg-gray-500 text-white text-sm">
                                {comment.author?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm text-gray-900 dark:text-white">
                                  {comment.author?.name || 'Anonymous'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDistanceToNow(new Date(comment.createdAt)).replace('about ', '~').replace(' ago', '').replace(' hours', 'hrs').replace(' hour', 'hr').replace(' minutes', 'min').replace(' days', 'd').replace(' day', 'd')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{comment.content}</p>
                              <div className="flex items-center space-x-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-gray-500 hover:text-red-500 p-0 h-auto"
                                >
                                  <Heart className="w-3 h-3 mr-1" />
                                  {comment.likeCount || 0}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setReplyingTo(comment.id)}
                                  className="text-xs text-gray-500 hover:text-blue-500 p-0 h-auto"
                                >
                                  Reply
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* View More Comments Button */}
                      {post.comments.length > (visibleCommentsCount[post.id] || 3) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setVisibleCommentsCount(prev => ({
                              ...prev,
                              [post.id]: (prev[post.id] || 3) + 5
                            }));
                          }}
                          className="w-full text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          View {Math.min(5, post.comments.length - (visibleCommentsCount[post.id] || 3))} more comments
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No posts yet. Be the first to share something!</p>
          </div>
        )}
        
        {/* Show More Posts Button */}
        {!showAllPosts && feedPosts.length > 3 && (
          <div className="text-center py-6">
            <Button 
              onClick={() => setShowAllPosts(true)}
              variant="outline"
              size="lg"
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              Show More Posts ({feedPosts.length - 3} more)
            </Button>
          </div>
        )}
        
        {/* Show Less Posts Button */}
        {showAllPosts && feedPosts.length > 3 && (
          <div className="text-center py-6">
            <Button 
              onClick={() => setShowAllPosts(false)}
              variant="outline"
              size="lg"
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              Show Less Posts
            </Button>
          </div>
        )}
      </div>

      {/* Shared Comment Dialog */}
      {commentDialogOpen !== null && (
        <CommentDialog
          isOpen={true}
          onClose={() => setCommentDialogOpen(null)}
          postId={commentDialogOpen}
          postType={getPostType(commentDialogOpen)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {postType === 'soap_reflection' ? 'S.O.A.P. Entry' : 'Post'}</DialogTitle>
            <DialogDescription>
              Delete this {postType === 'soap_reflection' ? 'S.O.A.P. entry' : 'post'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletePostMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeletePost}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SOAP Sharing Dialog */}
      <Dialog open={showSoapDialog} onOpenChange={setShowSoapDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share SOAP Entry</DialogTitle>
            <DialogDescription>
              Choose a SOAP journal entry to share with the community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(soapEntries as any[]).length > 0 ? (
              (soapEntries as any[]).map((entry: any) => (
                <Card 
                  key={entry.id} 
                  className={`cursor-pointer border-2 transition-colors ${
                    selectedSoapEntry?.id === entry.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => setSelectedSoapEntry(entry)}
                >
                  <CardContent className="p-3">
                    <div className="text-sm font-medium text-purple-700 mb-1">
                      {entry.scriptureReference || 'Scripture Study'}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {entry.devotionalDate ? new Date(entry.devotionalDate).toLocaleDateString() : 'Today'}
                    </div>
                    <div className="text-sm text-gray-700 line-clamp-2">
                      {entry.observation || entry.application || 'SOAP Journal Entry'}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <BookText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No SOAP entries found</p>
                <p className="text-sm">Create a SOAP entry first to share</p>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowSoapDialog(false);
                setSelectedSoapEntry(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedSoapEntry) {
                  // Set the post content to include full SOAP entry details
                  const scriptureText = selectedSoapEntry.scripture ? `\n\n"${selectedSoapEntry.scripture}"` : '';
                  const observationText = selectedSoapEntry.observation ? `\n\n💭 Observation: ${selectedSoapEntry.observation}` : '';
                  const applicationText = selectedSoapEntry.application ? `\n\n🎯 Application: ${selectedSoapEntry.application}` : '';
                  const prayerText = selectedSoapEntry.prayer ? `\n\n🙏 Prayer: ${selectedSoapEntry.prayer}` : '';
                  
                  setNewPost(`Sharing my SOAP journal reflection:\n\n📖 ${selectedSoapEntry.scriptureReference || 'Scripture Study'}${scriptureText}${observationText}${applicationText}${prayerText}`);
                  setShowSoapDialog(false);
                  setSelectedSoapEntry(null);
                  toast({
                    title: "SOAP Entry Added",
                    description: "Your SOAP reflection has been added to your post",
                  });
                }
              }}
              disabled={!selectedSoapEntry}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Share Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen !== null} onOpenChange={() => setShareDialogOpen(null)}>
        <DialogContent className="max-w-md" aria-describedby="share-post-dialog-description">
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
            <DialogDescription id="share-post-dialog-description">
              Choose how you'd like to share this post
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => shareDialogOpen && handleShare(shareDialogOpen, 'facebook')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <Facebook className="w-6 h-6 text-blue-600" />
                <span className="text-sm">Facebook</span>
              </Button>
              
              <Button
                onClick={() => shareDialogOpen && handleShare(shareDialogOpen, 'twitter')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <Twitter className="w-6 h-6 text-sky-500" />
                <span className="text-sm">Twitter</span>
              </Button>
              
              <Button
                onClick={() => shareDialogOpen && handleShare(shareDialogOpen, 'whatsapp')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <Smartphone className="w-6 h-6 text-green-600" />
                <span className="text-sm">WhatsApp</span>
              </Button>
              
              <Button
                onClick={() => shareDialogOpen && handleShare(shareDialogOpen, 'email')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <Mail className="w-6 h-6 text-gray-600" />
                <span className="text-sm">Email</span>
              </Button>
              
              <Button
                onClick={() => shareDialogOpen && handleShare(shareDialogOpen, 'sms')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <Smartphone className="w-6 h-6 text-green-600" />
                <span className="text-sm">SMS</span>
              </Button>
              
              <Button
                onClick={() => shareDialogOpen && handleShare(shareDialogOpen, 'copy')}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <Copy className="w-6 h-6 text-gray-600" />
                <span className="text-sm">Copy Link</span>
              </Button>
            </div>
            
            <div className="border-t pt-3">
              <Button
                onClick={() => shareDialogOpen && handleShare(shareDialogOpen, 'repost')}
                className="w-full"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Repost to Your Feed
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comment Confirmation Dialog */}
      <CommentConfirmationDialog
        isOpen={showCommentConfirmation}
        onClose={() => {
          setShowCommentConfirmation(false);
          setLastCommentData(null);
        }}
        onViewPost={() => {
          setShowCommentConfirmation(false);
          // Scroll to the post where the comment was added
          if (lastCommentData?.postId) {
            const postElement = document.getElementById(`post-${lastCommentData.postId}`);
            if (postElement) {
              postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Brief highlight effect
              postElement.style.background = 'rgba(59, 130, 246, 0.1)';
              setTimeout(() => {
                postElement.style.background = '';
              }, 2000);
            }
          }
          setLastCommentData(null);
        }}
        commentText={lastCommentData?.content || ""}
        postTitle={lastCommentData?.postTitle || ""}
        communitySize={150}
      />
    </div>
  );
}