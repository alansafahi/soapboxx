import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import type { EnhancedMoodIndicator } from "@shared/schema";
import { useToast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import ProfileVerificationRing from "./ProfileVerificationRing";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import ExpirationSettings from "./ExpirationSettings";
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
  Trash2,
  Share2,
  Copy,
  Facebook,
  Twitter,
  Mail,
  Smartphone
} from "lucide-react";

interface CompactPostComposerProps {
  className?: string;
}

export default function CompactPostComposer({ className = "" }: CompactPostComposerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<number[]>([]);
  const [attachedMedia, setAttachedMedia] = useState<Array<{name: string; type: string; size: number; url: string}>>([]);
  const [linkedVerse, setLinkedVerse] = useState<{reference: string; text: string} | null>(null);
  const [audience, setAudience] = useState<'public' | 'church' | 'private'>('public');
  const [showMoodDropdown, setShowMoodDropdown] = useState(false);
  const [showVerseSearch, setShowVerseSearch] = useState(false);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [verseSearchQuery, setVerseSearchQuery] = useState("");
  const [verseSearchResults, setVerseSearchResults] = useState<Array<{reference: string; text: string}>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recentMoods, setRecentMoods] = useState<EnhancedMoodIndicator[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [expirationSettings, setExpirationSettings] = useState<{
    expiresAt: Date | null;
    allowsExpiration: boolean;
  }>({
    expiresAt: null,
    allowsExpiration: false,
  });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const moodDropdownRef = useRef<HTMLDivElement>(null);
  const verseDropdownRef = useRef<HTMLDivElement>(null);
  const audienceDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch Enhanced Mood Indicators (EMI) from centralized system
  const { data: moodsByCategory = {}, isLoading: loadingMoods } = useQuery<Record<string, EnhancedMoodIndicator[]>>({
    queryKey: ["/api/enhanced-mood-indicators/by-category"],
    staleTime: 5 * 60 * 1000, // 5 minute cache
  });

  // Get all moods as flat array for mood operations
  const allMoods = Object.values(moodsByCategory).flat();



  const createPostMutation = useMutation({
    mutationFn: async (data: { 
      content: string; 
      mood?: string; 
      attachedMedia?: Array<{name: string; type: string; size: number; url: string}>;
      linkedVerse?: {reference: string; text: string};
      audience?: string;
      expiresAt?: Date | null;
    }) => {
      return apiRequest("POST", "/api/discussions", data);
    },
    onSuccess: () => {
      setContent("");
      setSelectedMoods([]);
      setAttachedMedia([]);
      setLinkedVerse(null);
      setAudience('public');
      setIsExpanded(false);
      setExpirationSettings({
        expiresAt: null,
        allowsExpiration: false,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      toast({
        title: "Post shared!",
        description: "Your post has been shared with your community.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to share post",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    createPostMutation.mutate({
      content: content.trim(),
      mood: selectedMoods.map(id => id.toString()).join(","),
      attachedMedia: attachedMedia.length > 0 ? attachedMedia : undefined,
      linkedVerse: linkedVerse || undefined,
      audience,
      expiresAt: expirationSettings.allowsExpiration ? expirationSettings.expiresAt : null
    });
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const toggleMoodSelection = (moodId: number) => {
    setSelectedMoods(prev => {
      const isSelected = prev.includes(moodId);
      const newSelection = isSelected 
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId];
      
      // Update recent moods with EMI data
      if (!isSelected) {
        const mood = allMoods.find(m => m.id === moodId);
        if (mood) {
          setRecentMoods(prevRecent => {
            const filtered = prevRecent.filter(m => m.id !== moodId);
            return [mood, ...filtered].slice(0, 6);
          });
        }
      }
      
      return newSelection;
    });
  };

  const handleDeletePost = (postId: number) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePost = () => {
    if (postToDelete) {
      deletePostMutation.mutate(postToDelete);
    }
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newMedia: Array<{name: string; type: string; size: number; url: string}> = [];

    for (const file of Array.from(files)) {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 50MB limit`,
          variant: "destructive",
        });
        continue;
      }

      try {
        // Convert to data URL for preview
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        newMedia.push({
          name: file.name,
          type: file.type,
          size: file.size,
          url: dataUrl
        });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: `Failed to process ${file.name}`,
          variant: "destructive",
        });
      }
    }

    setAttachedMedia(prev => [...prev, ...newMedia]);
    
    // Reset file input
    event.target.value = '';
  }, [toast]);

  const startVoiceRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

        setAttachedMedia(prev => [...prev, {
          name: `voice-message-${Date.now()}.webm`,
          type: 'audio/webm',
          size: blob.size,
          url: dataUrl
        }]);

        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingDuration(0);
      recorder.start();

      // Update duration counter
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Store interval reference for cleanup
      (recorder as any).durationInterval = interval;

    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Unable to access microphone",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopVoiceRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      clearInterval((mediaRecorder as any).durationInterval);
      setMediaRecorder(null);
      setIsRecording(false);
      setRecordingDuration(0);
    }
  }, [mediaRecorder]);

  const searchBibleVerses = useCallback(async (query: string) => {
    if (!query.trim()) {
      setVerseSearchResults([]);
      return;
    }

    try {
      const response = await apiRequest("GET", `/api/bible/search?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      
      if (data.verses) {
        setVerseSearchResults(data.verses.map((verse: any) => ({
          reference: verse.reference,
          text: verse.text
        })));
      }
    } catch (error) {
      // Silent fail for search
      setVerseSearchResults([]);
    }
  }, []);

  // Auto-resize textarea and expand on overflow
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      
      // Expand if content overflows 3 lines (approximately 60px)
      if (!isExpanded && scrollHeight > 60) {
        setIsExpanded(true);
      }
      
      textareaRef.current.style.height = scrollHeight + 'px';
    }
  }, [content, isExpanded]);

  // Close dropdowns when clicking outside
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

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        clearInterval((mediaRecorder as any).durationInterval);
      }
    };
  }, [mediaRecorder]);

  if (!user) return null;

  return (
    <div 
      data-testid="compact-composer"
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 ${isExpanded ? 'p-6' : 'p-4'} ${className}`}
    >
      <div className="flex space-x-3">
        <ProfileVerificationRing
          emailVerified={user.emailVerified === true}
          phoneVerified={user.phoneVerified === true}
          size="sm"
          className="flex-shrink-0"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.profileImageUrl || undefined} />
            <AvatarFallback className="bg-purple-100 text-purple-600 text-sm">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
        </ProfileVerificationRing>
        
        <div className="flex-1 space-y-3">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={handleFocus}
            placeholder={isExpanded ? "Share your thoughts, prayers, or inspiration..." : "What's on your heart?"}
            className={`border-none resize-none bg-transparent p-0 min-h-0 focus-visible:ring-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 ${
              isExpanded ? 'min-h-[80px]' : 'min-h-[60px]'
            }`}
            rows={isExpanded ? 4 : 3}
            style={{ maxHeight: isExpanded ? 'none' : '60px', overflow: isExpanded ? 'visible' : 'hidden' }}
          />

          {isExpanded && (
            <>
              {/* Linked Verse Display */}
              {linkedVerse && (
                <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
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

              {/* Expiration Settings */}
              <ExpirationSettings
                contentType="discussion"
                initialExpiresAt={expirationSettings.expiresAt}
                allowsExpiration={expirationSettings.allowsExpiration}
                onSettingsChange={setExpirationSettings}
              />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-gray-100 dark:border-gray-700 gap-3">
                <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1 justify-center sm:justify-start">
                  {/* Media Upload */}
                  <div className="relative">
                    <input
                      type="file"
                      id="compact-file-upload"
                      multiple
                      accept="image/*,video/*,audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => document.getElementById('compact-file-upload')?.click()}
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
                                  const currentString = selectedMoods.map(id => id.toString()).join(',');
                                  const wouldExceedLimit = !isSelected && (currentString + (currentString ? ',' : '') + mood.id.toString()).length > 255;
                                  
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
                                      <span className="mr-1">{mood.emoji}</span>
                                      <span className="hidden sm:inline">{mood.name}</span>
                                      <span className="sm:hidden">{mood.name.length > 8 ? mood.name.substring(0, 8) + '...' : mood.name}</span>
                                    </Button>
                                  );
                                })}
                              </div>
                              <hr className="my-3 border-gray-200 dark:border-gray-600" />
                            </div>
                          )}

                          {/* Enhanced Mood Indicators (EMI) by Category */}
                          {loadingMoods ? (
                            <div className="flex items-center justify-center p-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading moods...</span>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {Object.keys(moodsByCategory).sort().map((categoryName) => (
                                <div key={categoryName}>
                                  <div className="mb-2">
                                    <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">{categoryName}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic hidden sm:block">
                                      {categoryName === "Spiritual States" && "Your relationship with God and faith journey"}
                                      {categoryName === "Emotional Well-being" && "How you're feeling emotionally today"}
                                      {categoryName === "Life Circumstances" && "Current situations you're navigating"}
                                      {categoryName === "Faith & Worship" && "Your spiritual practices and worship"}
                                      {categoryName === "Growth & Transformation" && "Your journey of spiritual development"}
                                      {categoryName === "Seeking Support" && "When you need prayer, encouragement, or help"}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {moodsByCategory[categoryName].map((mood) => {
                                      const isSelected = selectedMoods.includes(mood.id);
                                      const currentString = selectedMoods.map(id => id.toString()).join(',');
                                      const wouldExceedLimit = !isSelected && (currentString + (currentString ? ',' : '') + mood.id.toString()).length > 255;
                                      
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
                                          title={wouldExceedLimit ? `Adding this mood would exceed the 255 character limit (current: ${currentString.length}/255)` : mood.description || `Feeling ${mood.name.toLowerCase()}`}
                                        >
                                          <div className="flex items-center w-full">
                                            <span className="mr-2 text-base flex-shrink-0">{mood.emoji}</span>
                                            <span className="text-xs font-medium leading-tight break-words hyphens-auto">{mood.name}</span>
                                          </div>
                                        </Button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

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
                      className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-1.5 h-8 w-8"
                      title="Link Bible verse"
                    >
                      <Book className="w-4 h-4" />
                    </Button>

                    {/* Bible Verse Search Dropdown */}
                    {showVerseSearch && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-80 max-w-[95vw]">
                        <div className="p-4">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Link Bible Verse</div>
                          <Input
                            placeholder="Search verses (e.g., John 3:16, love, hope...)"
                            value={verseSearchQuery}
                            onChange={(e) => {
                              setVerseSearchQuery(e.target.value);
                              searchBibleVerses(e.target.value);
                            }}
                            className="mb-3"
                          />
                          
                          {verseSearchResults.length > 0 && (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {verseSearchResults.map((verse, index) => (
                                <div
                                  key={index}
                                  className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer border border-gray-100 dark:border-gray-600"
                                  onClick={() => {
                                    setLinkedVerse(verse);
                                    setShowVerseSearch(false);
                                    setVerseSearchQuery("");
                                    setVerseSearchResults([]);
                                  }}
                                >
                                  <div className="font-medium text-sm text-blue-600 dark:text-blue-400">{verse.reference}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{verse.text}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setShowVerseSearch(false);
                                setVerseSearchQuery("");
                                setVerseSearchResults([]);
                              }}
                              className="w-full text-gray-500 hover:text-gray-700"
                            >
                              Close
                            </Button>
                          </div>
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
                      className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 p-1.5 h-8 w-8"
                      title={`Audience: ${audience}`}
                    >
                      {audience === 'public' ? <Globe className="w-4 h-4" /> : 
                       audience === 'church' ? <Church className="w-4 h-4" /> : 
                       <Lock className="w-4 h-4" />}
                    </Button>

                    {showAudienceDropdown && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-48">
                        <div className="p-2">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Who can see this?</div>
                          <div className="space-y-1">
                            <Button
                              variant={audience === 'public' ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => {
                                setAudience('public');
                                setShowAudienceDropdown(false);
                              }}
                              className="w-full justify-start"
                            >
                              <Globe className="w-4 h-4 mr-2" />
                              Public
                            </Button>
                            <Button
                              variant={audience === 'church' ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => {
                                setAudience('church');
                                setShowAudienceDropdown(false);
                              }}
                              className="w-full justify-start"
                            >
                              <Church className="w-4 h-4 mr-2" />
                              Church Only
                            </Button>
                            <Button
                              variant={audience === 'private' ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => {
                                setAudience('private');
                                setShowAudienceDropdown(false);
                              }}
                              className="w-full justify-start"
                            >
                              <Lock className="w-4 h-4 mr-2" />
                              Private
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsExpanded(false);
                      setContent("");
                      setSelectedMoods([]);
                      setAttachedMedia([]);
                      setLinkedVerse(null);
                      setAudience('public');
                      setExpirationSettings({
                        expiresAt: null,
                        allowsExpiration: false,
                      });
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!content.trim() || createPostMutation.isPending}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                  >
                    {createPostMutation.isPending ? "Sharing..." : "Share"}
                  </Button>
                </div>
              </div>
            </>
          )}

          {!isExpanded && content && (
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || createPostMutation.isPending}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Share
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
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
    </div>
  );
}