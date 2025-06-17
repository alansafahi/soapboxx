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
  Loader2
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
  isPinned?: boolean;
  pinnedBy?: string;
  pinnedAt?: Date;
  pinnedUntil?: Date;
  pinCategory?: string;
  attachedMedia?: Array<{name: string; type: string; size: number; url: string; filename: string}>;
  linkedVerse?: {reference: string; text: string};
  comments?: Array<{id: number; content: string; author: {name: string}; createdAt: Date}>;
}

export default function SocialFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newPost, setNewPost] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(true);
  const [showMoodDropdown, setShowMoodDropdown] = useState(false);
  const [showVerseSearch, setShowVerseSearch] = useState(false);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<'public' | 'church' | 'private'>('public');
  const [verseQuery, setVerseQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [linkedVerse, setLinkedVerse] = useState<{reference: string; text: string} | null>(null);
  const [attachedMedia, setAttachedMedia] = useState<Array<{name: string; type: string; size: number; url: string; filename: string}>>([]);

  // Fetch feed posts
  const { data: feedPosts = [], isLoading } = useQuery({
    queryKey: ['/api/feed'],
  });

  // Search verses
  const { data: verseSearchResults, isLoading: isSearchingVerses } = useQuery({
    queryKey: ['/api/bible-verses/search', verseQuery],
    enabled: verseQuery.length >= 2,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return apiRequest('/api/discussions', {
        method: 'POST',
        body: JSON.stringify(postData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      setNewPost('');
      setSelectedMood(null);
      setLinkedVerse(null);
      setAttachedMedia([]);
      toast({
        title: "Success",
        description: "Post shared successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share post. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const postData = {
      type: 'discussion',
      content: newPost,
      mood: selectedMood,
      audience: selectedAudience,
      linkedVerse,
      attachedMedia: attachedMedia.length > 0 ? attachedMedia : undefined,
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

  const startVoiceRecording = () => {
    setIsRecording(true);
    // Voice recording implementation
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    // Stop recording implementation
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

  const getSelectedMoodData = () => {
    // Mock mood data for now
    if (!selectedMood) return null;
    return {
      icon: '😊',
      label: 'Joyful',
      color: 'bg-yellow-100 text-yellow-800'
    };
  };

  const clearMood = () => {
    setSelectedMood(null);
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
                <AvatarFallback className="bg-purple-600 text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
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

            {/* Action Buttons Row - Icon Only with Tooltips */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                {/* Media Upload */}
                <label className="cursor-pointer" title="Add photo">
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
                    className="text-gray-600 hover:text-green-600 hover:bg-green-50 p-1.5 h-8 w-8"
                    type="button"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </label>

                {/* Audio Recording */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className={`p-1.5 h-8 w-8 ${
                    isRecording 
                      ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                  title="Record voice"
                >
                  <Mic className="w-4 h-4" />
                </Button>

                {/* Mood Selector */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMoodDropdown(!showMoodDropdown)}
                    className="text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 p-1.5 h-8 w-8"
                    title="Add feeling"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>

                {/* Bible Verse Link */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVerseSearch(!showVerseSearch)}
                  className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 p-1.5 h-8 w-8"
                  title="Add Bible verse"
                >
                  <Book className="w-4 h-4" />
                </Button>

                {/* Audience Selector */}
                <div className="relative">
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
                  <p className="text-gray-700 dark:text-gray-300 mt-2">{post.content}</p>
                </div>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                    <Heart className="w-4 h-4 mr-1" />
                    {post.likeCount}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {post.commentCount}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500">
                    <RotateCw className="w-4 h-4 mr-1" />
                    {post.shareCount}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No posts yet. Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
}