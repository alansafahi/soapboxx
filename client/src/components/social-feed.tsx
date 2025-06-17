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
  Book
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FeedPost {
  id: number;
  type: 'discussion' | 'prayer' | 'event' | 'inspiration' | 'announcement' | 'share';
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
  // Pinned posts fields for pastor/admin features
  isPinned?: boolean;
  pinnedBy?: string;
  pinnedAt?: Date;
  pinnedUntil?: Date;
  pinCategory?: string;
}

export default function SocialFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getMoodEmoji = (mood: string) => {
    const moodMap: { [key: string]: string } = {
      // 🕊️ Emotional Support
      "sad": "😢", "anxious": "😰", "heartbroken": "💔", "sleepy": "😴",
      "exhausted": "😓", "thoughtful": "😔", "drained": "😶‍🌫️", "sick": "🤒",
      "alone": "😞", "angry": "😡", "overwhelmed": "😩", "worried": "😟",
      "hungry": "🍞", "ok": "😐", "tired": "🥱",
      
      // 🌿 Spiritual Growth & Readiness
      "hopeful": "🌅", "motivated": "✝️", "determined": "🧠", "confident": "🤔",
      "professional": "🧑‍💼", "meditated": "🧘‍♂️", "calm": "😌", "inspired": "😇",
      "blessed-growth": "🙏",
      
      // ✨ Praise & Celebration
      "happy": "😄", "loved": "😊", "thankful": "🥰", "blessed": "😇",
      "joyful": "😃", "grateful": "🤲", "excited": "😊", "proud": "💪",
      "relaxed": "😌", "chill": "😎", "energized": "😋", "festive": "🤩",
      "delighted": "😁", "wonderful": "😍", "in-love": "💕",
      
      // 🌍 Everyday Check-In
      "fresh": "😋", "rested": "🛌", "content": "😊", "fine": "😅", "silly": "🧁"
    };
    return moodMap[mood] || "💭";
  };

  const getMoodDisplayName = (mood: string) => {
    const moodNames: { [key: string]: string } = {
      // 🕊️ Emotional Support
      "sad": "Sad", "anxious": "Anxious", "heartbroken": "Heartbroken", "sleepy": "Sleepy",
      "exhausted": "Exhausted", "thoughtful": "Thoughtful", "drained": "Drained", "sick": "Sick",
      "alone": "Alone", "angry": "Angry", "overwhelmed": "Overwhelmed", "worried": "Worried",
      "hungry": "Hungry", "ok": "OK", "tired": "Tired",
      
      // 🌿 Spiritual Growth & Readiness
      "hopeful": "Hopeful", "motivated": "Motivated", "determined": "Determined", "confident": "Confident",
      "professional": "Professional", "meditated": "Meditated", "calm": "Calm", "inspired": "Inspired",
      "blessed-growth": "Blessed",
      
      // ✨ Praise & Celebration
      "happy": "Happy", "loved": "Loved", "thankful": "Thankful", "blessed": "Blessed",
      "joyful": "Joyful", "grateful": "Grateful", "excited": "Excited", "proud": "Proud",
      "relaxed": "Relaxed", "chill": "Chill", "energized": "Energized", "festive": "Festive",
      "delighted": "Delighted", "wonderful": "Wonderful", "in-love": "In Love",
      
      // 🌍 Everyday Check-In
      "fresh": "Fresh", "rested": "Rested", "content": "Content", "fine": "Fine", "silly": "Silly"
    };
    return moodNames[mood] || mood;
  };
  
  // Performance optimization: removed console logging
  const [newPost, setNewPost] = useState("");
  // AI will automatically determine post type, so we don't need manual selection
  
  // Post composer visibility
  const [showComposer, setShowComposer] = useState(false);
  
  // Mood/feeling selection for posts
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showMoodDropdown, setShowMoodDropdown] = useState(false);
  
  // Audience selection for posts (Facebook-style)
  const [selectedAudience, setSelectedAudience] = useState<'public' | 'church' | 'private'>('public');
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  
  // Comment modal state
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [activePost, setActivePost] = useState<FeedPost | null>(null);
  const [commentText, setCommentText] = useState("");

  // Enhanced composer state (X/Facebook-style features)
  const [attachedMedia, setAttachedMedia] = useState<Array<{name: string; type: string; size: number; url: string; filename: string}>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [linkedVerse, setLinkedVerse] = useState<{reference: string; text: string} | null>(null);
  const [showVerseSearch, setShowVerseSearch] = useState(false);
  const [verseQuery, setVerseQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Expanded verses state for AI suggestions
  const [expandedVerses, setExpandedVerses] = useState<Set<number>>(new Set());

  // Toggle verse expansion for a specific post
  const toggleVerseExpansion = (postId: number) => {
    setExpandedVerses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  // Function to clean up S.O.A.P. formatting for display
  const cleanupSoapFormatting = (content: string) => {
    if (!content) return content;
    
    // Convert markdown bold to HTML bold and remove extra quotes
    return content
      .replace(/\*\*(Scripture|Observation|Application|Prayer)\*\*/g, '<strong>$1</strong>')
      .replace(/""([^"]+)""/g, '"$1"'); // Remove double quotes around scripture
  };

  // Audience options for posts (Facebook-style)
  const audienceOptions = [
    { 
      id: "public", 
      label: "Public", 
      icon: Globe, 
      description: "Anyone on SoapBox can see this",
      color: "text-blue-600"
    },
    { 
      id: "church", 
      label: "My Church Only", 
      icon: Church, 
      description: "Only members of your church can see this",
      color: "text-purple-600"
    },
    { 
      id: "private", 
      label: "Private", 
      icon: Lock, 
      description: "Only you can see this (journal-style)",
      color: "text-gray-600"
    }
  ];

  // Complete Mood Categories organized by purpose
  const moodCategories = [
    {
      name: "🕊️ Emotional Support",
      description: "For users seeking comfort, prayer, or empathy",
      moods: [
        { id: "sad", label: "Sad", icon: "😢", color: "bg-blue-100 text-blue-800" },
        { id: "anxious", label: "Anxious", icon: "😰", color: "bg-yellow-100 text-yellow-800" },
        { id: "heartbroken", label: "Heartbroken", icon: "💔", color: "bg-red-100 text-red-800" },
        { id: "sleepy", label: "Sleepy", icon: "😴", color: "bg-indigo-100 text-indigo-800" },
        { id: "exhausted", label: "Exhausted", icon: "😓", color: "bg-gray-100 text-gray-800" },
        { id: "thoughtful", label: "Thoughtful", icon: "😔", color: "bg-purple-100 text-purple-800" },
        { id: "drained", label: "Drained", icon: "😶‍🌫️", color: "bg-slate-100 text-slate-800" },
        { id: "sick", label: "Sick", icon: "🤒", color: "bg-orange-100 text-orange-800" },
        { id: "alone", label: "Alone", icon: "😞", color: "bg-blue-100 text-blue-800" },
        { id: "angry", label: "Angry", icon: "😡", color: "bg-red-100 text-red-800" },
        { id: "overwhelmed", label: "Overwhelmed", icon: "😩", color: "bg-yellow-100 text-yellow-800" },
        { id: "worried", label: "Worried", icon: "😟", color: "bg-amber-100 text-amber-800" },
        { id: "hungry", label: "Hungry", icon: "🍞", color: "bg-orange-100 text-orange-800" },
        { id: "ok", label: "OK", icon: "😐", color: "bg-gray-100 text-gray-800" },
        { id: "tired", label: "Tired", icon: "🥱", color: "bg-indigo-100 text-indigo-800" }
      ]
    },
    {
      name: "🌿 Spiritual Growth & Readiness",
      description: "For users actively growing, searching, or recommitting",
      moods: [
        { id: "hopeful", label: "Hopeful", icon: "🌅", color: "bg-yellow-100 text-yellow-800" },
        { id: "motivated", label: "Motivated", icon: "✝️", color: "bg-purple-100 text-purple-800" },
        { id: "determined", label: "Determined", icon: "🧠", color: "bg-blue-100 text-blue-800" },
        { id: "confident", label: "Confident", icon: "🤔", color: "bg-green-100 text-green-800" },
        { id: "professional", label: "Professional", icon: "🧑‍💼", color: "bg-slate-100 text-slate-800" },
        { id: "meditated", label: "Meditated", icon: "🧘‍♂️", color: "bg-teal-100 text-teal-800" },
        { id: "calm", label: "Calm", icon: "😌", color: "bg-blue-100 text-blue-800" },
        { id: "inspired", label: "Inspired", icon: "😇", color: "bg-yellow-100 text-yellow-800" },
        { id: "blessed-growth", label: "Blessed", icon: "🙏", color: "bg-emerald-100 text-emerald-800" }
      ]
    },
    {
      name: "✨ Praise & Celebration",
      description: "For gratitude, testimony, and joy-sharing moments",
      moods: [
        { id: "happy", label: "Happy", icon: "😄", color: "bg-yellow-100 text-yellow-800" },
        { id: "loved", label: "Loved", icon: "😊", color: "bg-pink-100 text-pink-800" },
        { id: "thankful", label: "Thankful", icon: "🥰", color: "bg-red-100 text-red-800" },
        { id: "blessed", label: "Blessed", icon: "😇", color: "bg-yellow-100 text-yellow-800" },
        { id: "joyful", label: "Joyful", icon: "😃", color: "bg-orange-100 text-orange-800" },
        { id: "grateful", label: "Grateful", icon: "🤲", color: "bg-green-100 text-green-800" },
        { id: "excited", label: "Excited", icon: "😊", color: "bg-orange-100 text-orange-800" },
        { id: "proud", label: "Proud", icon: "💪", color: "bg-blue-100 text-blue-800" },
        { id: "relaxed", label: "Relaxed", icon: "😌", color: "bg-green-100 text-green-800" },
        { id: "chill", label: "Chill", icon: "😎", color: "bg-blue-100 text-blue-800" },
        { id: "energized", label: "Energized", icon: "😋", color: "bg-yellow-100 text-yellow-800" },
        { id: "festive", label: "Festive", icon: "🤩", color: "bg-purple-100 text-purple-800" },
        { id: "delighted", label: "Delighted", icon: "😁", color: "bg-pink-100 text-pink-800" },
        { id: "wonderful", label: "Wonderful", icon: "😍", color: "bg-red-100 text-red-800" },
        { id: "in-love", label: "In Love", icon: "💕", color: "bg-pink-100 text-pink-800" }
      ]
    },
    {
      name: "🌍 Everyday Check-In",
      description: "For lightweight updates or general well-being expression",
      moods: [
        { id: "fresh", label: "Fresh", icon: "😋", color: "bg-green-100 text-green-800" },
        { id: "rested", label: "Rested", icon: "🛌", color: "bg-blue-100 text-blue-800" },
        { id: "content", label: "Content", icon: "😊", color: "bg-green-100 text-green-800" },
        { id: "fine", label: "Fine", icon: "😅", color: "bg-gray-100 text-gray-800" },
        { id: "silly", label: "Silly", icon: "🧁", color: "bg-pink-100 text-pink-800" }
      ]
    }
  ];

  // Fetch social feed data with optimized refresh
  const { data: feedPosts = [], isLoading } = useQuery({
    queryKey: ['/api/feed'],
    refetchInterval: 60000, // Refresh every 60 seconds (reduced from 30)
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Create new post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return await apiRequest('/api/feed/posts', {
        method: 'POST',
        body: postData
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      setNewPost("");
      setSelectedMood(null); // Clear selected mood after successful post
      setSelectedAudience('public'); // Reset audience to default
      setShowMoodDropdown(false); // Close dropdowns
      setShowAudienceDropdown(false);
      
      // Show Bible verse suggestions if provided
      if (data.suggestedVerses && data.suggestedVerses.length > 0) {
        toast({
          title: "Post Created with Spiritual Guidance",
          description: `Your post has been shared! We've suggested ${data.suggestedVerses.length} Bible verses that might encourage you.`,
        });
      } else {
        toast({
          title: "Post Created",
          description: "Your post has been shared with the community!",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });



  // Bookmark post mutation
  const bookmarkPostMutation = useMutation({
    mutationFn: async ({ postId, postType, isBookmarked }: { postId: number; postType: string; isBookmarked: boolean }) => {
      const endpoint = isBookmarked ? 'unbookmark' : 'bookmark';
      return await apiRequest(`/api/${postType}s/${postId}/${endpoint}`, {
        method: 'POST'
      });
    },
    onMutate: async ({ postId, isBookmarked }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['/api/feed'] });
      const previousFeed = queryClient.getQueryData(['/api/feed']);
      
      queryClient.setQueryData(['/api/feed'], (old: any) => {
        if (!old) return old;
        return old.map((post: any) => 
          post.id === postId ? { ...post, isBookmarked: !isBookmarked } : post
        );
      });
      
      return { previousFeed };
    },
    onSuccess: (data, variables) => {
      // Update the cache with the actual server response
      queryClient.setQueryData(['/api/feed'], (old: any) => {
        if (!old) return old;
        return old.map((post: any) => 
          post.id === variables.postId ? { 
            ...post, 
            isBookmarked: data.bookmarked !== undefined ? data.bookmarked : !variables.isBookmarked
          } : post
        );
      });
      
      toast({
        title: variables.isBookmarked ? "Bookmark removed" : "Bookmarked",
        description: variables.isBookmarked ? "Post removed from bookmarks" : "Post saved to bookmarks",
      });
    },
    onError: (_, __, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['/api/feed'], context.previousFeed);
      }
    }
  });

  // Share post mutation
  const sharePostMutation = useMutation({
    mutationFn: async ({ postId, postType }: { postId: number; postType: string }) => {
      return await apiRequest(`/api/${postType}s/${postId}/share`, {
        method: 'POST'
      });
    },
    onMutate: async ({ postId }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['/api/feed'] });
      const previousFeed = queryClient.getQueryData(['/api/feed']);
      
      queryClient.setQueryData(['/api/feed'], (old: any) => {
        if (!old) return old;
        return old.map((post: any) => 
          post.id === postId ? { 
            ...post, 
            shareCount: post.shareCount + 1
          } : post
        );
      });
      
      return { previousFeed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      toast({
        title: "Post shared",
        description: "Post has been shared to your feed",
      });
    },
    onError: (_, __, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['/api/feed'], context.previousFeed);
      }
    }
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async ({ postId, postType }: { postId: number; postType: string }) => {
      const url = `/api/${postType}s/${postId}/like`;
      return await apiRequest(url, {
        method: 'POST'
      });
    },
    onMutate: async ({ postId }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['/api/feed'] });
      const previousFeed = queryClient.getQueryData(['/api/feed']);
      
      queryClient.setQueryData(['/api/feed'], (old: any) => {
        if (!old) return old;
        return old.map((post: any) => 
          post.id === postId ? { 
            ...post, 
            isLiked: !post.isLiked,
            likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
          } : post
        );
      });
      
      return { previousFeed };
    },
    onSuccess: (data, variables) => {
      // Update the cache with the actual server response
      queryClient.setQueryData(['/api/feed'], (old: any) => {
        if (!old) return old;
        return old.map((post: any) => 
          post.id === variables.postId ? { 
            ...post, 
            isLiked: data.liked,
            likeCount: data.likeCount
          } : post
        );
      });
      
      toast({
        title: data.liked ? "Liked" : "Unliked",
        description: data.liked ? "Post liked successfully" : "Post unliked successfully",
      });
    },
    onError: (_, __, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['/api/feed'], context.previousFeed);
      }
    }
  });

  // Prayer-specific like mutation
  const prayerLikeMutation = useMutation({
    mutationFn: async (prayerId: number) => {
      // Performance optimization: removed console logging
      return await apiRequest(`/api/prayers/${prayerId}/like`, {
        method: 'POST'
      });
    },
    onMutate: async (prayerId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['/api/feed'] });
      const previousFeed = queryClient.getQueryData(['/api/feed']);
      
      queryClient.setQueryData(['/api/feed'], (old: any) => {
        if (!old) return old;
        return old.map((post: any) => 
          post.id === prayerId ? { 
            ...post, 
            isLiked: !post.isLiked,
            likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
          } : post
        );
      });
      
      return { previousFeed };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      toast({
        title: data.liked ? "Liked" : "Unliked",
        description: data.liked ? "Prayer request liked" : "Prayer request unliked",
      });
    },
    onError: (_, __, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['/api/feed'], context.previousFeed);
      }
    }
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ postId, postType, content }: { postId: number; postType: string; content: string }) => {
      if (postType !== 'discussion') {
        throw new Error('Comments are only supported for discussions');
      }
      
      return await apiRequest(`/api/discussions/${postId}/comments`, {
        method: 'POST',
        body: { content }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    },
  });

  // Pin/Unpin post mutations for pastors and church admins
  const pinPostMutation = useMutation({
    mutationFn: async ({ postId, category, expiresAt }: { postId: number; category?: string; expiresAt?: Date }) => {
      return await apiRequest(`/api/discussions/${postId}/pin`, {
        method: 'POST',
        body: { category: category || 'announcement', expiresAt }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/discussions/pinned'] });
      toast({
        title: "Post pinned",
        description: "This message is now featured at the top of the feed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unable to pin post",
        description: error.message || "Only pastors and church administrators can pin posts",
        variant: "destructive",
      });
    }
  });

  const unpinPostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return await apiRequest(`/api/discussions/${postId}/pin`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/discussions/pinned'] });
      toast({
        title: "Post unpinned",
        description: "This message is no longer featured",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unable to unpin post",
        description: error.message || "Only pastors and church administrators can unpin posts",
        variant: "destructive",
      });
    }
  });

  // Check if user can pin posts (pastor/admin roles)
  const { data: userRole } = useQuery({
    queryKey: ['/api/auth/user-role'],
    enabled: !!user
  });

  const canPinPosts = userRole && ['pastor', 'lead_pastor', 'church_admin', 'admin', 'system_admin'].includes(userRole.role);
  
  // Debug logging for role detection
  console.log('Current user role:', userRole);
  console.log('Can pin posts:', canPinPosts);

  // Bible verse search functionality using our comprehensive database
  const { data: searchedVerses, isLoading: isSearchingVerses } = useQuery({
    queryKey: ['/api/bible/search', verseQuery],
    enabled: !!verseQuery && verseQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Enhanced composer handlers
  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Convert files to base64 data URLs for storage and display
    const mediaPromises = files.map(file => {
      return new Promise<any>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            url: reader.result as string, // base64 data URL
            filename: file.name
          });
        };
        reader.readAsDataURL(file);
      });
    });
    
    const mediaData = await Promise.all(mediaPromises);
    setAttachedMedia(prev => [...prev, ...mediaData]);
  };

  const removeAttachedMedia = (index: number) => {
    setAttachedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // Convert speech to text using Web Speech API or send to server for Whisper processing
        await convertSpeechToText(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to record voice prayers.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const convertSpeechToText = async (audioBlob: Blob) => {
    // Use Web Speech API for basic conversion or send to server for Whisper
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // Fallback to Web Speech API if available
      const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setNewPost(prev => prev + (prev ? ' ' : '') + transcript);
      };
      
      recognition.start();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    
    setNewPost(value);
    setCursorPosition(position);
    
    // Check for hashtags and mentions
    const words = value.split(' ');
    const currentWord = words[words.length - 1];
    
    if (currentWord.startsWith('#')) {
      setMentionQuery(currentWord.slice(1));
      setShowMentions(false);
    } else if (currentWord.startsWith('@')) {
      setMentionQuery(currentWord.slice(1));
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Convert files to base64 data URLs for storage and display
    const mediaPromises = files.map(file => {
      return new Promise<any>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            url: reader.result as string, // base64 data URL
            filename: file.name
          });
        };
        reader.readAsDataURL(file);
      });
    });
    
    const mediaFiles = await Promise.all(mediaPromises);
    setAttachedMedia(prev => [...prev, ...mediaFiles]);
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    
    const postData = {
      content: newPost,
      mood: selectedMood,
      audience: selectedAudience,
      attachedMedia: attachedMedia.length > 0 ? attachedMedia : undefined,
      linkedVerse: linkedVerse
      // AI will automatically determine post type and title
    };
    
    createPostMutation.mutate(postData);
    
    // Reset enhanced composer state
    setAttachedMedia([]);
    setLinkedVerse(null);
    setShowVerseSearch(false);
  };

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    setShowMoodDropdown(false);
  };

  const clearMood = () => {
    setSelectedMood(null);
  };

  const getSelectedMoodData = () => {
    if (!selectedMood) return null;
    
    for (const category of moodCategories) {
      const mood = category.moods.find(m => m.id === selectedMood);
      if (mood) return mood;
    }
    
    return null;
  };

  const handleLikePost = (post: FeedPost) => {
    // Performance optimization: removed console logging
    if (post.type === 'prayer') {
      // Use direct prayer like mutation for prayer posts
      prayerLikeMutation.mutate(post.id);
    } else {
      likePostMutation.mutate({ 
        postId: post.id, 
        postType: post.type 
      });
    }
  };

  const handleCommentPost = (post: FeedPost) => {
    setActivePost(post);
    setCommentText("");
    setCommentModalOpen(true);
  };

  const submitComment = () => {
    if (!activePost || !commentText.trim()) return;
    
    // Performance optimization: removed console logging
    commentMutation.mutate({
      postId: activePost.id,
      postType: activePost.type,
      content: commentText.trim()
    });
    
    setCommentModalOpen(false);
    setCommentText("");
    setActivePost(null);
  };

  const handleQuickResponse = (response: string) => {
    setCommentText(response);
  };

  const handleSharePost = (post: FeedPost) => {
    sharePostMutation.mutate({
      postId: post.id,
      postType: post.type
    });
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'prayer': return <BookOpen className="w-4 h-4 text-purple-600" />;
      case 'event': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'inspiration': return <Heart className="w-4 h-4 text-pink-600" />;
      case 'announcement': return <Users className="w-4 h-4 text-green-600" />;
      default: return <MessageCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'prayer': return 'Prayer Request';
      case 'event': return 'Event';
      case 'inspiration': return 'Daily Inspiration';
      case 'announcement': return 'Announcement';
      default: return 'Discussion';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="ml-4 space-y-2 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Removed debug logging for production

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post Section - Only show when authenticated */}
      {user && (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
                    : user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'AS'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  placeholder="Share something with your community..."
                  value={newPost}
                  onChange={handleTextChange}
                  className="min-h-[80px] resize-none border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Media Preview */}
            {attachedMedia.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {attachedMedia.map((media, index) => (
                    <div key={index} className="relative group">
                      {media.type.startsWith('image/') ? (
                        <div className="relative bg-gray-100 rounded-lg p-2">
                          <img
                            src={media.url}
                            alt={media.name}
                            className="w-full h-20 object-cover rounded"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachedMedia(index)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-2">
                          {media.type.startsWith('video/') ? (
                            <Video className="w-5 h-5 text-gray-500" />
                          ) : (
                            <FileText className="w-5 h-5 text-gray-500" />
                          )}
                          <span className="text-sm text-gray-700 truncate">{media.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachedMedia(index)}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Linked Verse Preview */}
              {linkedVerse && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <BookText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">{linkedVerse.reference}</span>
                      </div>
                      <p className="text-sm text-blue-700 italic">"{linkedVerse.text}"</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLinkedVerse(null)}
                      className="h-6 w-6 p-0 text-blue-400 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

            {/* Selected Mood Display */}
            {selectedMood && (
              <div className="mb-3 flex items-center gap-2">
                <Badge className={`${getSelectedMoodData()?.color} border-0`}>
                  <span className="mr-1">{getSelectedMoodData()?.icon}</span>
                  {getSelectedMoodData()?.label}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearMood}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Action Buttons Row - Photo, Voice, Feeling, Verse, Audience */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                {/* Media Upload */}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400"
                    type="button"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Photo
                  </Button>
                </label>

                {/* Audio Recording */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className={`${
                    isRecording 
                      ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400' 
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400'
                  }`}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  {isRecording ? 'Stop' : 'Voice'}
                </Button>

                {/* Mood Selector */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMoodDropdown(!showMoodDropdown)}
                    className="text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 dark:text-gray-400 dark:hover:text-yellow-400"
                  >
                    <Smile className="w-4 h-4 mr-2" />
                    Feeling
                  </Button>

                  {/* Comprehensive Mood Dropdown */}
                  {showMoodDropdown && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg min-w-80 max-h-96 overflow-y-auto">
                      <div className="p-2">
                        {moodCategories.map((category) => (
                          <div key={category.name} className="mb-4 last:mb-0">
                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 px-2">
                              {category.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
                              {category.description}
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                              {category.moods.map((mood) => (
                                <Button
                                  key={mood.id}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMoodSelect(mood.id)}
                                  className="justify-start h-auto p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
                                >
                                  <span className="mr-1 text-sm">{mood.icon}</span>
                                  <span className="text-xs">{mood.label}</span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bible Verse Link */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVerseSearch(!showVerseSearch)}
                  className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-400 dark:hover:text-purple-400"
                >
                  <BookText className="w-4 h-4 mr-2" />
                  Verse
                </Button>

                {/* Audience Selector (Facebook-style) */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {React.createElement(audienceOptions.find(opt => opt.id === selectedAudience)?.icon || Globe, { className: "w-4 h-4 mr-2" })}
                    {audienceOptions.find(opt => opt.id === selectedAudience)?.label}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>

                  {/* Audience Dropdown */}
                  {showAudienceDropdown && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg min-w-64">
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">Who can see this?</div>
                        {audienceOptions.map((audience) => (
                          <Button
                            key={audience.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAudienceSelect(audience.id)}
                            className={`w-full justify-start h-auto p-2 text-left ${
                              selectedAudience === audience.id 
                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                                {React.createElement(audience.icon, { className: "w-4 h-4 text-gray-600 dark:text-gray-300" })}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{audience.label}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{audience.description}</div>
                              </div>
                              {selectedAudience === audience.id && (
                                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
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
                onClick={submitPost}
                disabled={isSubmitting || (!newPost.trim() && attachedMedia.length === 0)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  'Share'
                )}
              </Button>
            </div>

            {/* Bible Verse Search Dropdown */}
            {showVerseSearch && (
              <div className="mt-3 border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <BookText className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Find Bible Verse</span>
                </div>
                <input
                  type="text"
                  placeholder="Search for a verse... (e.g., 'John 3:16' or 'love')"
                  value={verseQuery}
                  onChange={(e) => setVerseQuery(e.target.value)}
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                {verseQuery.length >= 2 && (
                  <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                    {verseSearchResults?.slice(0, 5).map((verse, index) => (
                      <button
                        key={index}
                        onClick={() => handleVerseSelect(verse)}
                        className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-sm border border-gray-100 dark:border-gray-600"
                      >
                        <div className="font-medium text-purple-700 dark:text-purple-300">{verse.reference}</div>
                        <div className="text-purple-600 dark:text-purple-400 text-xs mt-1 line-clamp-2">
                          {verse.verseText || verse.text}
                        </div>
                        {verse.category && (
                          <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                            Category: {verse.category}
                          </div>
                        )}
                      </button>
                    )) }
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Post Composer */}
      {showComposer && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-purple-600 text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <SmartScriptureTextarea
                  value={newPost}
                  onChange={setNewPost}
                  placeholder="Share your thoughts, prayers, or reflections..."
                  className="w-full border-0 p-0 text-base resize-none focus:ring-0 bg-transparent"
                  rows={3}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
          {/* Selected Mood Display */}
          {selectedMood && (
            <div className="mb-3 flex items-center gap-2">
              <Badge className={`${getSelectedMoodData()?.color} border-0`}>
                <span className="mr-1">{getSelectedMoodData()?.icon}</span>
                {getSelectedMoodData()?.label}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMood}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Enhanced Composer Toolbar - X/Facebook Style */}
              
              {/* Media Upload */}
              <input
                type="file"
                ref={mediaInputRef}
                onChange={handleMediaUpload}
                multiple
                accept="image/*,video/*"
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => mediaInputRef.current?.click()}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                title="Add photos or videos"
              >
                <Image className="w-4 h-4" />
              </Button>

              {/* Voice Prayer Recording */}
              <Button
                variant="ghost"
                size="sm"
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                className={`${
                  isRecording 
                    ? "text-red-600 hover:text-red-700 bg-red-50" 
                    : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                }`}
                title={isRecording ? "Stop voice prayer" : "Record voice prayer"}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>

              {/* Bible Verse Linking */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVerseSearch(!showVerseSearch)}
                  className="text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                  title="Link Bible verse"
                >
                  <BookText className="w-4 h-4" />
                </Button>

                {/* Bible Verse Search Dropdown */}
                {showVerseSearch && (
                  <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-purple-200 rounded-lg shadow-lg min-w-80 max-w-96">
                    <div className="p-3 bg-purple-50 rounded-t-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookText className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Link Bible Verse</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowVerseSearch(false)}
                          className="h-6 w-6 p-0 text-purple-400 hover:text-purple-600 ml-auto"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <input
                        type="text"
                        placeholder="Search for a verse (e.g., John 3:16, love, hope, faith)"
                        value={verseQuery}
                        onChange={(e) => setVerseQuery(e.target.value)}
                        className="w-full p-2 text-sm border border-purple-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    {verseQuery && (
                      <div className="max-h-64 overflow-y-auto">
                        {isSearchingVerses ? (
                          <div className="p-4 text-center text-sm text-gray-500">
                            Searching 42,000+ verses...
                          </div>
                        ) : searchedVerses && searchedVerses.length > 0 ? (
                          searchedVerses.slice(0, 6).map((verse: any, index: number) => (
                            <button
                              key={index}
                              onClick={() => {
                                setLinkedVerse({
                                  reference: verse.verseReference || verse.reference,
                                  text: verse.verseText || verse.text
                                });
                                setShowVerseSearch(false);
                                setVerseQuery("");
                              }}
                              className="w-full text-left p-3 hover:bg-purple-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-purple-800 text-sm">
                                {verse.verseReference || verse.reference}
                              </div>
                              <div className="text-purple-600 text-xs mt-1 line-clamp-2">
                                {verse.verseText || verse.text}
                              </div>
                              {verse.category && (
                                <div className="text-xs text-purple-500 mt-1">
                                  Category: {verse.category}
                                </div>
                              )}
                            </button>
                          ))
                        ) : verseQuery.length >= 2 ? (
                          <div className="p-4 text-center text-sm text-gray-500">
                            No verses found for "{verseQuery}"
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Verse Locator */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Open verse lookup modal or navigate to verse search
                  window.open('/scripture-lookup', '_blank');
                }}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                title="Verse Locator - Look up specific Bible verses"
              >
                <Search className="w-4 h-4" />
              </Button>

              {/* Mood/Activity Button */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMoodDropdown(!showMoodDropdown)}
                  className="text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
                >
                  <Smile className="w-4 h-4 mr-2" />
                  Mood
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>

                {/* Comprehensive Mood Dropdown */}
                {showMoodDropdown && (
                  <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-md shadow-lg min-w-80 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      {moodCategories.map((category) => (
                        <div key={category.name} className="mb-4 last:mb-0">
                          <div className="text-sm font-semibold text-gray-700 mb-1 px-2">
                            {category.name}
                          </div>
                          <div className="text-xs text-gray-500 mb-2 px-2">
                            {category.description}
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            {category.moods.map((mood) => (
                              <Button
                                key={mood.id}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoodSelect(mood.id)}
                                className="justify-start h-auto p-2 text-left hover:bg-gray-50 text-xs"
                              >
                                <span className="mr-1 text-sm">{mood.icon}</span>
                                <span className="text-xs">{mood.label}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Audience Selector (Facebook-style) */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  {React.createElement(audienceOptions.find(opt => opt.id === selectedAudience)?.icon || Globe, { className: "w-4 h-4 mr-2" })}
                  {audienceOptions.find(opt => opt.id === selectedAudience)?.label}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>

                {/* Audience Dropdown */}
                {showAudienceDropdown && (
                  <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-md shadow-lg min-w-64">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 mb-2 px-2">Who can see this?</div>
                      {audienceOptions.map((audience) => (
                        <Button
                          key={audience.id}
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAudience(audience.id as 'public' | 'church' | 'private');
                            setShowAudienceDropdown(false);
                          }}
                          className={`w-full justify-start h-auto p-3 text-left hover:bg-gray-50 ${
                            selectedAudience === audience.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {React.createElement(audience.icon, { className: `w-5 h-5 ${audience.color} mt-0.5` })}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900">{audience.label}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{audience.description}</div>
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



            {/* Hashtag/Mention Autocomplete */}
            {showMentions && (
              <div className="mt-2 border border-gray-200 rounded-lg p-2 bg-gray-50 max-h-32 overflow-y-auto">
                <div className="text-xs text-gray-500 mb-1">
                  {mentionQuery.startsWith('@') ? 'Mention someone' : 'Add hashtag'}
                </div>
                <div className="space-y-1">
                  {(mentionQuery.startsWith('@') ? 
                    ['@PastorDavid', '@SisterMaria', '@YouthLeader', '@WorshipTeam'] :
                    ['#prayer', '#faith', '#worship', '#fellowship', '#blessing', '#testimony']
                  ).filter(item => 
                    item.toLowerCase().includes(mentionQuery.toLowerCase())
                  ).slice(0, 4).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const words = newPost.split(' ');
                        words[words.length - 1] = item;
                        setNewPost(words.join(' ') + ' ');
                        setShowMentions(false);
                        setMentionQuery('');
                      }}
                      className="block w-full text-left p-1 hover:bg-gray-100 rounded text-sm text-blue-600"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                {/* Media Upload */}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-green-600 hover:bg-green-50"
                    type="button"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Photo
                  </Button>
                </label>

                {/* Audio Recording */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className={`${
                    isRecording 
                      ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  {isRecording ? 'Stop' : 'Voice'}
                </Button>

                {/* Mood Selector */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMoodDropdown(!showMoodDropdown)}
                    className="text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
                  >
                    <Smile className="w-4 h-4 mr-2" />
                    Feeling
                  </Button>
                </div>

                {/* Bible Verse Link */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVerseSearch(!showVerseSearch)}
                  className="text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                >
                  <Book className="w-4 h-4 mr-2" />
                  Verse
                </Button>
              </div>

              <Button 
                onClick={handleCreatePost}
                disabled={!newPost.trim() || createPostMutation.isPending}
                className="bg-[#5A2671] hover:bg-[#4A1F5C] text-white font-medium px-6 py-2 border-0"
              >
                <Send className="w-4 h-4 mr-2 text-white" />
                {createPostMutation.isPending ? 'Posting...' : 'Share'}
              </Button>
            </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feed Posts */}
      <div className="space-y-6">
        {Array.isArray(feedPosts) && feedPosts.length > 0 ? feedPosts.map((post: FeedPost) => (
          <Card key={`${post.type}-${post.id}`} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              {/* Pinned Post Banner */}
              {post.isPinned && (
                <div className="mb-3 flex items-center space-x-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2">
                  <Pin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Pinned by {post.pinnedBy || 'Leadership'}
                  </span>
                  {post.pinCategory && (
                    <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:text-amber-300">
                      {post.pinCategory}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.author.profileImage} />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {post.author.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {post.author.name}
                      </h4>
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        {getPostIcon(post.type)}
                        <span className="text-xs">{getPostTypeLabel(post.type)}</span>
                      </Badge>
                      {post.isPinned && (
                        <Badge variant="outline" className="flex items-center space-x-1 bg-amber-50 border-amber-300 text-amber-700">
                          <Pin className="w-3 h-3" />
                          <span className="text-xs">Pinned</span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                      <span>•</span>
                      {/* Audience visibility indicator */}
                      <div className="flex items-center space-x-1">
                        {post.audience === 'public' && (
                          <>
                            <Globe className="w-3 h-3" />
                            <span>Public</span>
                          </>
                        )}
                        {post.audience === 'church' && (
                          <>
                            <Church className="w-3 h-3" />
                            <span>Church Only</span>
                          </>
                        )}
                        {post.audience === 'private' && (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Private</span>
                          </>
                        )}
                      </div>
                      {post.church && (
                        <>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Church className="w-3 h-3" />
                            <span>{post.church.name}</span>
                          </div>
                        </>
                      )}
                      {post.location && (
                        <>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{post.location}</span>
                          </div>
                        </>
                      )}
                    </div>
                    {post.mood && (
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-lg">{getMoodEmoji(post.mood)}</span>
                        <span className="text-sm text-[#5A2671] font-medium">
                          {post.author.name} is {getMoodDisplayName(post.mood)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {post.title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {post.title}
                </h3>
              )}
              <div 
                className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: cleanupSoapFormatting(post.content) }}
              />

              {/* Media Display */}
              {post.attachedMedia && post.attachedMedia.length > 0 && (
                <div className="mb-4">
                  <div className={`grid gap-2 ${post.attachedMedia.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {post.attachedMedia.map((media: any, index: number) => (
                      <div key={index} className="relative">
                        {media.type?.startsWith('image/') ? (
                          <img
                            src={media.url}
                            alt={media.name || media.filename || `Image ${index + 1}`}
                            className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600"
                            onError={(e) => {
                              console.error('Failed to load image:', media);
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : media.type?.startsWith('video/') ? (
                          <video
                            src={media.url}
                            controls
                            className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600"
                            onError={(e) => {
                              console.error('Failed to load video:', media);
                              (e.target as HTMLVideoElement).style.display = 'none';
                            }}
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-5 h-5 text-gray-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                {media.name || media.filename || 'Attached file'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Verse Display */}
              {post.linkedVerse && post.linkedVerse.reference && post.linkedVerse.text && (
                <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <BookText className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-blue-800 dark:text-blue-300 text-sm mb-1">
                        {post.linkedVerse.reference}
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 italic">
                        "{post.linkedVerse.text}"
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {post.eventDate && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                  <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                      {new Date(post.eventDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLikePost(post);
                    }}
                    className={`${post.isLiked ? 'text-red-600 hover:text-red-700' : 'text-gray-500 hover:text-red-600'} transition-colors`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likeCount}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCommentPost(post);
                    }}
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                    title={post.type === 'prayer' ? "Add prayer support" : "Add a comment"}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    <span>{post.commentCount}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSharePost(post);
                    }}
                    className="text-gray-500 hover:text-green-600 transition-colors"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    <span>{post.shareCount}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => bookmarkPostMutation.mutate({ 
                      postId: post.id, 
                      postType: post.type, 
                      isBookmarked: post.isBookmarked || false 
                    })}
                    className={`${post.isBookmarked ? 'text-yellow-600 hover:text-yellow-700' : 'text-gray-500 hover:text-yellow-600'} transition-colors`}
                    disabled={bookmarkPostMutation.isPending}
                  >
                    {post.isBookmarked ? 
                      <BookmarkCheck className="w-4 h-4" /> : 
                      <Bookmark className="w-4 h-4" />
                    }
                  </Button>

                  {/* Pin/Unpin Controls for Pastors and Church Admins */}
                  {canPinPosts && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (post.isPinned) {
                          unpinPostMutation.mutate(post.id);
                        } else {
                          pinPostMutation.mutate({ 
                            postId: post.id, 
                            category: 'announcement' 
                          });
                        }
                      }}
                      className={`${post.isPinned ? 'text-amber-600 hover:text-amber-700' : 'text-gray-500 hover:text-amber-600'} transition-colors`}
                      disabled={pinPostMutation.isPending || unpinPostMutation.isPending}
                      title={post.isPinned ? 'Unpin this post' : 'Pin this post to top of feed'}
                    >
                      {post.isPinned ? 
                        <PinOff className="w-4 h-4" /> : 
                        <Pin className="w-4 h-4" />
                      }
                    </Button>
                  )}
                </div>
              </div>

              {/* AI Bible Verse Suggestions */}
              {post.suggestedVerses && post.suggestedVerses.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-[#5A2671] dark:text-purple-400">
                        ✨ AI Spiritual Guidance
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Based on your mood
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(expandedVerses.has(post.id) ? post.suggestedVerses : post.suggestedVerses.slice(0, 2)).map((verse: any, index: number) => (
                      <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-3 border border-purple-100 dark:border-purple-700">
                        <div className="flex items-start space-x-2">
                          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                            {verse.reference}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 italic">
                          "{verse.text}"
                        </p>
                        {verse.category && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-full">
                            {verse.category}
                          </span>
                        )}
                      </div>
                    ))}
                    {post.suggestedVerses.length > 2 && (
                      <button
                        onClick={() => toggleVerseExpansion(post.id)}
                        className="w-full text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-center py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      >
                        {expandedVerses.has(post.id) 
                          ? `Show less verses` 
                          : `+${post.suggestedVerses.length - 2} more verses suggested`
                        }
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              {post.comments && post.comments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="space-y-3">
                    {post.comments.slice(0, 3).map((comment: any) => (
                      <div key={comment.id} className="flex space-x-3">
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarImage src={comment.author?.profileImage} />
                          <AvatarFallback className="bg-[#5A2671] text-white text-xs">
                            {comment.author?.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {comment.author?.name || 'Anonymous'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDistanceToNow(new Date(comment.createdAt))} ago
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {post.comments.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCommentPost(post);
                        }}
                        className="text-[#5A2671] hover:text-[#4A1F5C] text-sm"
                      >
                        View all {post.commentCount} comments
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No posts yet. Be the first to share something!</p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      <div className="text-center py-8">
        <Button variant="outline" className="bg-white dark:bg-gray-800">
          <PlusCircle className="w-4 h-4 mr-2" />
          Load More Posts
        </Button>
      </div>

      {/* Comment Modal */}
      <Dialog open={commentModalOpen} onOpenChange={setCommentModalOpen}>
        <DialogContent className="sm:max-w-[525px] bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#5A2671]">
              {activePost?.type === 'prayer' ? (
                <>
                  <MessageCircle className="w-5 h-5" />
                  Share Prayer Support
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  Add Comment
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {activePost?.type === 'prayer' 
                ? "Share words of encouragement, prayer, or support with this community member."
                : "Join the conversation and share your thoughts with the community."
              }
            </DialogDescription>
          </DialogHeader>

          {/* Post Preview */}
          {activePost && (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activePost.author.profileImage} />
                  <AvatarFallback className="bg-[#5A2671] text-white text-xs">
                    {activePost.author.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{activePost.author.name}</p>
                  <Badge variant={activePost.type === 'prayer' ? 'secondary' : 'default'} className="text-xs">
                    {activePost.type === 'prayer' ? 'Prayer Request' : 
                     activePost.type === 'discussion' ? 'Discussion' : 'Post'}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {activePost.title || activePost.content}
              </p>
            </div>
          )}

          {/* Quick Responses for Prayers */}
          {activePost?.type === 'prayer' && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Quick responses:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "🙏 Praying for you",
                  "Amen!",
                  "God bless you",
                  "Lifting you up in prayer",
                  "You're in my prayers",
                  "Hallelujah!"
                ].map((response) => (
                  <Button
                    key={response}
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs h-8 hover:bg-[#5A2671] hover:text-white transition-colors"
                    onClick={() => handleQuickResponse(response)}
                  >
                    {response}
                  </Button>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Or write your own message below:
              </div>
            </div>
          )}

          {/* Comment Input */}
          <div className="space-y-4">
            <Textarea
              placeholder={
                activePost?.type === 'prayer' 
                  ? "Share words of encouragement or let them know you're praying..."
                  : "What are your thoughts on this?"
              }
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[100px] resize-none border-gray-300 dark:border-gray-600 focus:border-[#5A2671] focus:ring-[#5A2671]"
            />
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {commentText.length}/500 characters
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setCommentModalOpen(false)}
                  className="px-4"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitComment}
                  disabled={!commentText.trim() || commentMutation.isPending}
                  className="bg-[#5A2671] hover:bg-[#4A1E61] text-white px-6"
                >
                  {commentMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Posting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      {activePost?.type === 'prayer' ? 'Send Support' : 'Post Comment'}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}