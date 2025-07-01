import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Heart, 
  MessageCircle, 
  RotateCw, 
  Clock, 
  MapPin, 
  Users,
  Church,
  BookOpen,
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
  Search,
  Book,
  Loader2,
  Trash2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [recentMoods, setRecentMoods] = useState<any[]>([]);
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
  const [commentDialogOpen, setCommentDialogOpen] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [commentSort, setCommentSort] = useState<'newest' | 'most_liked'>('newest');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState<{[key: number]: number}>({});
  const [showSoapDialog, setShowSoapDialog] = useState(false);
  const [selectedSoapEntry, setSelectedSoapEntry] = useState<any>(null);
  
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
    queryKey: ['/api/feed'],
  });

  // Debug logging for feed posts
  useEffect(() => {
    // Feed data loaded
  }, [feedPosts, isLoading, error]);

  // Search verses
  const { data: verseSearchData, isLoading: isSearchingVerses } = useQuery<{verses: Array<{id: string; reference: string; text: string}>}>({
    queryKey: ['/api/bible/search', verseQuery],
    enabled: verseQuery.length >= 2,
  });
  
  const verseSearchResults = verseSearchData?.verses || [];

  // Fetch user's SOAP entries
  const { data: soapEntries = [] } = useQuery<any[]>({
    queryKey: ['/api/soap'],
    enabled: showSoapDialog,
  });

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest('POST', `/api/discussions/${postId}/like`);
    },
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/feed'] });
      
      // Snapshot the previous value
      const previousFeed = queryClient.getQueryData(['/api/feed']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['/api/feed'], (old: any) => {
        if (!old) return old;
        return old.map((post: any) => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: !post.isLiked,
              likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
            };
          }
          return post;
        });
      });
      
      return { previousFeed };
    },
    onError: (err, postId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['/api/feed'], context?.previousFeed);
      toast({
        title: "Error",
        description: "Failed to like",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      // Don't invalidate immediately to preserve optimistic updates
      // The optimistic update in onMutate already reflects the correct state
    }
  });

  // Comment submission mutation
  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      return apiRequest('POST', `/api/discussions/${postId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      setCommentText("");
      setCommentDialogOpen(null);
      toast({
        title: "Success",
        description: "Comment added"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to comment",
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
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
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

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return apiRequest('POST', '/api/feed/posts', postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      setNewPost('');
      setSelectedMoods([]);
      setLinkedVerse(null);
      setAttachedMedia([]);
      toast({
        title: "Success",
        description: "Post shared!",
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
    mutationFn: async (postId: number) => {
      try {
        const response = await apiRequest('DELETE', `/api/discussions/${postId}`);
        return response;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      try {
        // Safely update cache without triggering route changes
        queryClient.setQueryData(['/api/feed'], (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.filter((post: any) => post.id !== postToDelete);
        });
        
        // Reset dialog state first to prevent UI issues
        setDeleteDialogOpen(false);
        setPostToDelete(null);
        
        // Provide user feedback
        setTimeout(() => {
          toast({
            title: "Success",
            description: "Post deleted!",
          });
        }, 100);
        
      } catch (error) {
        // Fallback: refresh the feed data if cache update fails
        queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      }
    },
    onError: (error: any) => {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      toast({
        title: "Error",
        description: `Failed to delete post: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    }
  });

  const handleDeletePost = (postId: number) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePost = () => {
    if (postToDelete) {
      deletePostMutation.mutate(postToDelete);
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

  // SoapBox Super App Feelings Selector - 4 Pillars System
const moodCategories = [
  {
    title: "🧠 Emotional & Spiritual Support",
    description: "Express your struggles and need for comfort",
    moods: [
      { id: 'lonely', label: 'Feeling Lonely', subtitle: "God's presence and companionship", icon: '🙁', color: 'bg-blue-100 text-blue-800' },
      { id: 'overwhelmed', label: 'Overwhelmed', subtitle: 'Anxiety and fatigue relief', icon: '😰', color: 'bg-orange-100 text-orange-800' },
      { id: 'shame', label: 'Shame or Guilt', subtitle: 'Forgiveness, grace, redemption', icon: '💔', color: 'bg-red-100 text-red-800' },
      { id: 'doubting', label: 'Doubting Faith', subtitle: 'Wrestling with God, questions', icon: '😕', color: 'bg-gray-100 text-gray-800' },
      { id: 'needing-forgiveness', label: 'Needing Forgiveness', subtitle: 'Grace and mercy', icon: '🙏', color: 'bg-purple-100 text-purple-800' },
      { id: 'struggling-sin', label: 'Struggling with Sin', subtitle: 'Temptation, accountability, renewal', icon: '😖', color: 'bg-red-100 text-red-800' },
      { id: 'discouraged', label: 'Discouraged', subtitle: 'Hopelessness, low self-worth', icon: '😔', color: 'bg-gray-100 text-gray-800' },
      { id: 'brokenhearted', label: 'Brokenhearted', subtitle: 'Grief, loss, mourning', icon: '🥹', color: 'bg-blue-100 text-blue-800' }
    ]
  },
  {
    title: "🌱 Growth & Transformation",
    description: "Mark your spiritual formation journey",
    moods: [
      { id: 'seeking-purpose', label: 'Seeking Purpose', subtitle: 'Identity, calling, direction', icon: '❓', color: 'bg-purple-100 text-purple-800' },
      { id: 'starting-over', label: 'Starting Over', subtitle: 'New beginnings, transformation', icon: '🆕', color: 'bg-green-100 text-green-800' },
      { id: 'wanting-growth', label: 'Wanting to Grow', subtitle: 'Wisdom, discipline, sanctification', icon: '📈', color: 'bg-blue-100 text-blue-800' },
      { id: 'building-confidence', label: 'Building Confidence', subtitle: 'Strength, courage, fearlessness', icon: '💪', color: 'bg-orange-100 text-orange-800' },
      { id: 'desiring-wisdom', label: 'Desiring Wisdom', subtitle: 'Proverbs, guidance, discernment', icon: '🤔', color: 'bg-indigo-100 text-indigo-800' },
      { id: 'serving-others', label: 'Serving Others', subtitle: 'Compassion, generosity, humility', icon: '🤝', color: 'bg-green-100 text-green-800' },
      { id: 'spiritually-dry', label: 'Spiritually Dry', subtitle: 'Feeling distant, thirsting for renewal', icon: '🌿', color: 'bg-yellow-100 text-yellow-800' }
    ]
  },
  {
    title: "🌍 Life Situations", 
    description: "Navigate life's challenges with faith",
    moods: [
      { id: 'big-decision', label: 'Before a Big Decision', subtitle: 'Discernment scriptures', icon: '🔍', color: 'bg-purple-100 text-purple-800' },
      { id: 'waiting-god', label: 'Waiting on God', subtitle: 'Patience, faith in timing', icon: '⏳', color: 'bg-yellow-100 text-yellow-800' },
      { id: 'relationship-struggles', label: 'Struggling in Relationships', subtitle: 'Marriage, family, forgiveness', icon: '💔', color: 'bg-red-100 text-red-800' },
      { id: 'navigating-change', label: 'Navigating Change', subtitle: 'Transitions, new seasons', icon: '🔄', color: 'bg-blue-100 text-blue-800' },
      { id: 'dealing-injustice', label: 'Dealing with Injustice', subtitle: 'Encouragement in trials', icon: '⚖️', color: 'bg-orange-100 text-orange-800' },
      { id: 'facing-illness', label: 'Facing Illness', subtitle: 'Healing, peace in hardship', icon: '🏥', color: 'bg-red-100 text-red-800' },
      { id: 'financial-worries', label: 'Financial Worries', subtitle: 'Stewardship, provision, hope', icon: '💸', color: 'bg-green-100 text-green-800' },
      { id: 'burned-out', label: 'Burned Out', subtitle: 'Rest, boundary-setting, balance', icon: '😵‍💫', color: 'bg-gray-100 text-gray-800' }
    ]
  },
  {
    title: "✝️ Faith & Worship",
    description: "Express your heart of worship and devotion",
    moods: [
      { id: 'hungry-for-god', label: 'Hungry for God', subtitle: 'Revival, intimacy with Christ', icon: '🔥', color: 'bg-red-100 text-red-800' },
      { id: 'worshipful-heart', label: 'Worshipful Heart', subtitle: 'Psalms, adoration, joy', icon: '🎵', color: 'bg-purple-100 text-purple-800' },
      { id: 'fasting-prayer', label: 'Fasting/Prayer Mode', subtitle: 'Intensified seeking', icon: '🙇', color: 'bg-blue-100 text-blue-800' },
      { id: 'grateful-heart', label: 'Grateful Heart', subtitle: 'Thanksgiving and praise', icon: '💚', color: 'bg-green-100 text-green-800' },
      { id: 'inspired', label: 'Inspired', subtitle: 'Joy, hope, and spiritual creativity', icon: '😇', color: 'bg-yellow-100 text-yellow-800' },
      { id: 'tired-faithful', label: 'Tired but Faithful', subtitle: 'Endurance, trust in rest', icon: '😴', color: 'bg-gray-100 text-gray-800' },
      { id: 'contemplative', label: 'Contemplative', subtitle: 'Stillness, reflection, meditation', icon: '🛐', color: 'bg-indigo-100 text-indigo-800' }
    ]
  }
];

// Flatten all moods for backward compatibility
const moodOptions = moodCategories.flatMap(category => category.moods);

  const toggleMoodSelection = (moodId: string) => {
    setSelectedMoods(prev => {
      if (prev.includes(moodId)) {
        return prev.filter(id => id !== moodId);
      } else {
        // Check if adding this mood would exceed the character limit
        const newMoods = [...prev, moodId];
        const moodString = newMoods.join(',');
        
        if (moodString.length > 255) {
          // Show error message using toast
          import('@/hooks/use-toast').then(({ toast }) => {
            toast({
              title: "Too many moods selected",
              description: `You can select up to ${255 - prev.join(',').length} more characters worth of moods. Current selection: ${moodString.length}/255 characters.`,
              variant: "destructive",
            });
          });
          return prev; // Don't add the mood
        }
        
        return newMoods;
      }
    });
    
    // Update recent moods
    const mood = moodOptions.find(m => m.id === moodId);
    if (mood) {
      setRecentMoods(prev => {
        const filtered = prev.filter(m => m.id !== moodId);
        return [mood, ...filtered].slice(0, 5); // Keep only 5 recent
      });
    }
  };

  const getSelectedMoodsData = () => {
    return selectedMoods.map(id => moodOptions.find(mood => mood.id === id)).filter((mood): mood is NonNullable<typeof mood> => Boolean(mood));
  };

  const clearMoods = () => {
    setSelectedMoods([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading feed...</span>
      </div>
    );
  }

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
            {/* Selected Moods Display */}
            {selectedMoods.length > 0 && (
              <div className="mb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Current feelings:</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    selectedMoods.join(',').length > 200 
                      ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' 
                      : selectedMoods.join(',').length > 150
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedMoods.join(',').length}/255 chars
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {getSelectedMoodsData().map((mood, index) => (
                    <div key={mood.id} className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/20 rounded-full border border-purple-200 dark:border-purple-700">
                      <span className="text-sm">{mood.icon}</span>
                      <span className="text-xs font-medium text-purple-800 dark:text-purple-200">{mood.label}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMoodSelection(mood.id)}
                        className="h-4 w-4 p-0 text-purple-400 hover:text-purple-600 ml-1"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </div>
                  ))}
                  {selectedMoods.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearMoods}
                      className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
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

                {/* Mood Selector */}
                <div className="relative" ref={moodDropdownRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMoodDropdown(!showMoodDropdown)}
                    className="text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 p-1.5 h-8 w-8"
                    title="Add feeling"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>

                  {/* Enhanced Mood Dropdown - Mobile Responsive */}
                  {showMoodDropdown && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-[480px] max-w-[95vw] max-h-[70vh] overflow-y-auto">
                      <div className="p-3 sm:p-4">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">How are you feeling?</div>
                        
                        {/* Recently Used Section */}
                        {recentMoods.length > 0 && (
                          <div className="mb-4">
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Recently Used</div>
                            <div className="flex flex-wrap gap-1">
                              {recentMoods.map((mood) => {
                                const isSelected = selectedMoods.includes(mood.id);
                                const currentString = selectedMoods.join(',');
                                const wouldExceedLimit = !isSelected && (currentString + (currentString ? ',' : '') + mood.id).length > 255;
                                
                                return (
                                  <Button
                                    key={`recent-${mood.id}`}
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleMoodSelection(mood.id)}
                                    disabled={wouldExceedLimit}
                                    className={`h-7 px-2 text-xs ${
                                      isSelected 
                                        ? 'bg-purple-600 hover:bg-purple-700' 
                                        : wouldExceedLimit 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : ''
                                    }`}
                                    title={wouldExceedLimit ? `Adding this mood would exceed the 255 character limit (current: ${currentString.length}/255)` : undefined}
                                  >
                                  <span className="mr-1">{mood.icon}</span>
                                  <span className="hidden sm:inline">{mood.label}</span>
                                  <span className="sm:hidden">{mood.label.length > 8 ? mood.label.substring(0, 8) + '...' : mood.label}</span>
                                </Button>
                              ))}
                            </div>
                            <hr className="my-3 border-gray-200 dark:border-gray-600" />
                          </div>
                        )}

                        {/* Categorized Moods */}
                        <div className="space-y-4">
                          {moodCategories.map((category) => (
                            <div key={category.title}>
                              <div className="mb-2">
                                <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">{category.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 italic hidden sm:block">{category.description}</p>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {category.moods.map((mood) => {
                                  const isSelected = selectedMoods.includes(mood.id);
                                  const currentString = selectedMoods.join(',');
                                  const wouldExceedLimit = !isSelected && (currentString + (currentString ? ',' : '') + mood.id).length > 255;
                                  
                                  return (
                                    <Button
                                      key={mood.id}
                                      variant={isSelected ? "default" : "ghost"}
                                      size="sm"
                                      onClick={() => toggleMoodSelection(mood.id)}
                                      disabled={wouldExceedLimit}
                                      className={`h-auto min-h-[3rem] p-2 justify-start text-left ${
                                        isSelected 
                                          ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                                          : wouldExceedLimit 
                                          ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400'
                                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                      }`}
                                      title={wouldExceedLimit ? `Adding this mood would exceed the 255 character limit (current: ${currentString.length}/255)` : mood.subtitle}
                                    >
                                    <div className="flex items-center w-full">
                                      <span className="mr-2 text-base flex-shrink-0">{mood.icon}</span>
                                      <span className="text-xs font-medium leading-tight break-words hyphens-auto">{mood.label}</span>
                                    </div>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedMoods([])}
                            className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm"
                          >
                            Clear All
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setShowMoodDropdown(false)}
                            className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                          >
                            Done ({selectedMoods.length})
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bible Verse Link */}
                <div className="relative" ref={verseDropdownRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVerseSearch(!showVerseSearch)}
                    className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 p-1.5 h-8 w-8"
                    title="Add Bible verse"
                  >
                    <Book className="w-4 h-4" />
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

              {/* Share Button */}
              <Button 
                onClick={handleCreatePost}
                disabled={!newPost.trim() || createPostMutation.isPending}
                className="bg-[#5A2671] hover:bg-[#4A1F5C] text-white font-medium p-2 h-8 w-8 border-0 flex-shrink-0 ml-2"
                title={createPostMutation.isPending ? 'Posting...' : 'Share post'}
              >
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feed Posts */}
      <div className="space-y-6">
        {Array.isArray(feedPosts) && feedPosts.length > 0 ? feedPosts.map((post: FeedPost) => (
          <Card key={post.id} className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={post.author.profileImage || ""} 
                    alt={post.author.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-purple-600 text-white">
                    {post.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{post.author.name}</h4>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 mt-2">
                    {post.title?.includes('S.O.A.P. Reflection') ? (
                      <div className="space-y-3">
                        {post.content.split('\n\n').map((section, index) => {
                          if (!section.trim()) return null;
                          
                          // Handle Scripture section
                          if (section.includes('📖') && section.includes('<strong>Scripture</strong>')) {
                            const scriptureText = section.replace('📖 <strong>Scripture</strong>: ', '').trim();
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
                            const observationText = section.replace('🔍 <strong>Observation</strong>: ', '').trim();
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
                            const applicationText = section.replace('💡 <strong>Application</strong>: ', '').trim();
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
                            const prayerText = section.replace('🙏 <strong>Prayer</strong>: ', '').trim();
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

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => likeMutation.mutate(post.id)}
                    className={`${post.isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
                    disabled={likeMutation.isPending}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                    {post.likeCount}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const isExpanded = expandedComments.has(post.id);
                      // Comments toggle for post
                      
                      // Create new Set and force React re-render
                      setExpandedComments(prev => {
                        const newSet = new Set(prev);
                        if (isExpanded) {
                          newSet.delete(post.id);
                        } else {
                          newSet.add(post.id);
                        }
                        return newSet;
                      });
                      
                      // Simple visual feedback
                      if (!isExpanded) {
                        toast({
                          title: "Comments Expanded",
                          description: `Showing comments section`,
                        });
                      }
                    }}
                    className={`${expandedComments.has(post.id) ? 'text-blue-500 bg-blue-50' : 'text-gray-500'} hover:text-blue-500 hover:bg-blue-50`}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {post.commentCount}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => shareMutation.mutate(post.id)}
                    className="text-gray-500 hover:text-green-500"
                    disabled={shareMutation.isPending}
                  >
                    <RotateCw className="w-4 h-4 mr-1" />
                    {post.shareCount}
                  </Button>
                </div>
                
                {/* Delete Button - Only show for post author */}
                {user && typeof user === 'object' && 'id' in user && post.author.id === (user as any).id && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeletePost(post.id)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete post"
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
                                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
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
      </div>

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen !== null} onOpenChange={() => setCommentDialogOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>
              Share your thoughts on this post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your comment..."
              className="min-h-[100px]"
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setCommentDialogOpen(null)}
                disabled={commentMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (commentDialogOpen && commentText.trim()) {
                    commentMutation.mutate({ 
                      postId: commentDialogOpen, 
                      content: commentText.trim() 
                    });
                  }
                }}
                disabled={commentMutation.isPending || !commentText.trim()}
              >
                {commentMutation.isPending ? "Adding..." : "Add Comment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Delete this post? This can't be undone.
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
                  // Set the post content to include SOAP entry
                  setNewPost(`Sharing my SOAP journal reflection:\n\n📖 ${selectedSoapEntry.scriptureReference || 'Scripture Study'}\n\n💭 Observation: ${selectedSoapEntry.observation}\n\n🎯 Application: ${selectedSoapEntry.application}\n\n🙏 Prayer: ${selectedSoapEntry.prayer}`);
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
    </div>
  );
}