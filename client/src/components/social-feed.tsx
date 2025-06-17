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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  
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
  const { data: feedPosts = [], isLoading } = useQuery({
    queryKey: ['/api/feed'],
  });

  // Search verses
  const { data: verseSearchResults, isLoading: isSearchingVerses } = useQuery<Array<{id: string; reference: string; text: string}>>({
    queryKey: ['/api/bible-verses/search', verseQuery],
    enabled: verseQuery.length >= 2,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return apiRequest('/api/discussions', {
        method: 'POST',
        body: postData,
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
    onError: (error: any) => {
      console.error("Post creation error:", error);
      toast({
        title: "Error",
        description: `Failed to share post: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    }
  });

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    // Ensure all data is properly serializable
    const postData = {
      type: 'discussion',
      content: newPost,
      mood: selectedMood,
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
        console.log('Audio chunks count:', currentChunks.length);
        
        if (currentChunks.length === 0) {
          toast({
            title: "Recording failed",
            description: "No audio data captured. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        const audioBlob = new Blob(currentChunks, { type: 'audio/webm' });
        console.log('Audio blob size:', audioBlob.size);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          console.log('Audio data URL length:', result?.length || 0);
          
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

  const moodOptions = [
    { id: 'grateful', label: 'Grateful', icon: '🙏', category: 'Positive', color: 'bg-blue-100 text-blue-800' },
    { id: 'blessed', label: 'Blessed', icon: '✨', category: 'Positive', color: 'bg-purple-100 text-purple-800' },
    { id: 'peaceful', label: 'Peaceful', icon: '🕊️', category: 'Positive', color: 'bg-green-100 text-green-800' },
    { id: 'hopeful', label: 'Hopeful', icon: '🌅', category: 'Positive', color: 'bg-orange-100 text-orange-800' },
    { id: 'joyful', label: 'Joyful', icon: '😊', category: 'Positive', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'reflective', label: 'Reflective', icon: '🤔', category: 'Contemplative', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'seeking', label: 'Seeking Guidance', icon: '🙏', category: 'Seeking', color: 'bg-purple-100 text-purple-800' },
    { id: 'anxious', label: 'Anxious', icon: '😰', category: 'Struggling', color: 'bg-red-100 text-red-800' },
    { id: 'celebrating', label: 'Celebrating', icon: '🎉', category: 'Positive', color: 'bg-pink-100 text-pink-800' },
    { id: 'praying', label: 'Praying', icon: '🙏', category: 'Spiritual', color: 'bg-blue-100 text-blue-800' },
    { id: 'studying', label: 'Studying Scripture', icon: '📖', category: 'Spiritual', color: 'bg-green-100 text-green-800' },
    { id: 'inspired', label: 'Inspired', icon: '💡', category: 'Positive', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const getSelectedMoodData = () => {
    if (!selectedMood) return null;
    return moodOptions.find(mood => mood.id === selectedMood) || null;
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
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'AS'}
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

                  {/* Mood Dropdown */}
                  {showMoodDropdown && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg w-64">
                      <div className="p-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">How are you feeling?</div>
                        <div className="grid grid-cols-2 gap-2">
                          {moodOptions.map((mood) => (
                            <Button
                              key={mood.id}
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedMood(mood.id);
                                setShowMoodDropdown(false);
                              }}
                              className="h-auto p-2 justify-start text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <span className="mr-2 text-lg">{mood.icon}</span>
                              <span className="text-sm">{mood.label}</span>
                            </Button>
                          ))}
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
                                console.error('Audio playback error:', e);
                                console.log('Audio URL:', media.url);
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