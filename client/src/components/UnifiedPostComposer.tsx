import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import type { EnhancedMoodIndicator, InsertPost } from "@shared/schema";
import { useToast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import ProfileVerificationRing from "./ProfileVerificationRing";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
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
  Smartphone,
  MessageSquare,
  Megaphone,
  PrayerIcon,
  Calendar,
  Cross
} from "lucide-react";

interface UnifiedPostComposerProps {
  className?: string;
  communityId?: number;
  onPostCreated?: () => void;
}

type PostType = "discussion" | "soap" | "announcement" | "prayer" | "event_update";

const POST_TYPE_OPTIONS = [
  {
    value: "discussion" as PostType,
    label: "Discussion",
    description: "Start a conversation with your community",
    icon: MessageSquare,
    color: "text-blue-600"
  },
  {
    value: "soap" as PostType,
    label: "S.O.A.P. Reflection",
    description: "Share your Scripture, Observation, Application, and Prayer",
    icon: BookText,
    color: "text-purple-600"
  },
  {
    value: "announcement" as PostType,
    label: "Announcement",
    description: "Share important news with your community",
    icon: Megaphone,
    color: "text-orange-600"
  },
  {
    value: "prayer" as PostType,
    label: "Prayer Request",
    description: "Ask for prayer support from your community",
    icon: Cross,
    color: "text-green-600"
  },
  {
    value: "event_update" as PostType,
    label: "Event Update",
    description: "Share updates about upcoming events",
    icon: Calendar,
    color: "text-red-600"
  }
];

export default function UnifiedPostComposer({ className = "", communityId, onPostCreated }: UnifiedPostComposerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Post type and content state
  const [postType, setPostType] = useState<PostType>("discussion");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // SOAP-specific fields
  const [scripture, setScripture] = useState("");
  const [scriptureReference, setScriptureReference] = useState("");
  const [observation, setObservation] = useState("");
  const [application, setApplication] = useState("");
  const [prayer, setPrayer] = useState("");
  
  // Common fields
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<number[]>([]);
  const [attachedMedia, setAttachedMedia] = useState<Array<{name: string; type: string; size: number; url: string}>>([]);
  const [linkedVerse, setLinkedVerse] = useState<{reference: string; text: string} | null>(null);
  const [audience, setAudience] = useState<'public' | 'church' | 'private'>('public');
  const [showMoodDropdown, setShowMoodDropdown] = useState(false);
  const [showVerseSearch, setShowVerseSearch] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  // UI state
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Auto-resize textarea
  const autoResize = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, []);

  useEffect(() => {
    autoResize();
  }, [content, autoResize]);

  // Enhanced mood indicators query
  const { data: moodIndicators = [] } = useQuery<EnhancedMoodIndicator[]>({
    queryKey: ["/api/enhanced-mood-indicators"],
  });

  // Post creation mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: InsertPost) => {
      const response = await apiRequest("/api/posts", {
        method: "POST",
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        throw new Error(`Failed to create post: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: getSuccessMessage(),
        description: getSuccessDescription(),
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      onPostCreated?.();
    },
    onError: (error) => {
      toast({
        title: "Error creating post",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const getSuccessMessage = () => {
    switch (postType) {
      case "soap": return "S.O.A.P. Reflection Shared";
      case "announcement": return "Announcement Posted";
      case "prayer": return "Prayer Request Shared";
      case "event_update": return "Event Update Posted";
      default: return "Discussion Started";
    }
  };

  const getSuccessDescription = () => {
    switch (postType) {
      case "soap": return "Your Scripture reflection has been shared with the community.";
      case "announcement": return "Your announcement has been posted to the community.";
      case "prayer": return "Your prayer request has been shared for community support.";
      case "event_update": return "Your event update has been posted.";
      default: return "Your discussion has been posted to the community.";
    }
  };

  const resetForm = () => {
    setPostType("discussion");
    setTitle("");
    setContent("");
    setScripture("");
    setScriptureReference("");
    setObservation("");
    setApplication("");
    setPrayer("");
    setSelectedMoods([]);
    setAttachedMedia([]);
    setLinkedVerse(null);
    setAudience('public');
    setTags([]);
    setNewTag("");
    setIsExpanded(false);
  };

  const handleSubmit = () => {
    if (!user) return;

    // Validate required fields based on post type
    if (postType === "soap") {
      if (!scripture || !observation || !application || !prayer) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all S.O.A.P. fields: Scripture, Observation, Application, and Prayer.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!content.trim()) {
        toast({
          title: "Content required",
          description: "Please write something to share with your community.",
          variant: "destructive",
        });
        return;
      }
    }

    const postData: InsertPost = {
      authorId: user.id,
      communityId: communityId || null,
      postType,
      title: title || null,
      content: postType === "soap" ? `${observation}\n\n${application}` : content,
      category: "general",
      
      // SOAP-specific fields
      scripture: postType === "soap" ? scripture : null,
      scriptureReference: postType === "soap" ? scriptureReference : null,
      observation: postType === "soap" ? observation : null,
      application: postType === "soap" ? application : null,
      prayer: postType === "soap" ? prayer : null,
      devotionalDate: postType === "soap" ? new Date() : null,
      
      // Common fields
      audience,
      moodTag: selectedMoods.length > 0 ? moodIndicators.filter(m => selectedMoods.includes(m.id)).map(m => m.name).join(", ") : null,
      attachedMedia: attachedMedia.length > 0 ? attachedMedia : null,
      linkedVerse: linkedVerse ? linkedVerse : null,
      tags: tags.length > 0 ? tags : null,
      isPublic: audience === "public",
      isSharedWithGroup: audience === "church",
      aiAssisted: false,
    };

    createPostMutation.mutate(postData);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const selectedPostTypeOption = POST_TYPE_OPTIONS.find(option => option.value === postType);
  const IconComponent = selectedPostTypeOption?.icon || MessageSquare;

  if (!user) return null;

  return (
    <Card className={`border border-gray-200 dark:border-gray-700 ${className}`}>
      <CardContent className="p-4">
        {/* Post Type Selector */}
        {!isExpanded && (
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.profileImageUrl} alt={user.firstName} />
              <AvatarFallback>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Select value={postType} onValueChange={(value: PostType) => setPostType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center space-x-2">
                      <IconComponent className={`w-4 h-4 ${selectedPostTypeOption?.color}`} />
                      <span>Create {selectedPostTypeOption?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {POST_TYPE_OPTIONS.map((option) => {
                    const OptionIcon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-start space-x-3 py-1">
                          <OptionIcon className={`w-5 h-5 mt-0.5 ${option.color}`} />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Expanded Form */}
        {isExpanded && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.profileImageUrl} alt={user.firstName} />
                  <AvatarFallback>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`w-4 h-4 ${selectedPostTypeOption?.color}`} />
                    <span className="font-medium">{selectedPostTypeOption?.label}</span>
                  </div>
                  <p className="text-sm text-gray-500">{selectedPostTypeOption?.description}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Title (for non-SOAP posts) */}
            {postType !== "soap" && (
              <Input
                placeholder={`${selectedPostTypeOption?.label} title...`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            )}

            {/* SOAP-specific fields */}
            {postType === "soap" && (
              <div className="space-y-4 bg-purple-50 dark:bg-purple-950/10 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-700 dark:text-purple-300">
                    Scripture Reference
                  </label>
                  <Input
                    placeholder="e.g., John 3:16"
                    value={scriptureReference}
                    onChange={(e) => setScriptureReference(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-700 dark:text-purple-300">
                    Scripture Text
                  </label>
                  <Textarea
                    placeholder="Enter the Bible verse or passage..."
                    value={scripture}
                    onChange={(e) => setScripture(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-700 dark:text-purple-300">
                    Observation - What does this passage say?
                  </label>
                  <Textarea
                    placeholder="What do you observe in this passage? What stands out to you?"
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-700 dark:text-purple-300">
                    Application - How does this apply to your life?
                  </label>
                  <Textarea
                    placeholder="How will you apply this passage to your life? What changes will you make?"
                    value={application}
                    onChange={(e) => setApplication(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-700 dark:text-purple-300">
                    Prayer - Talk to God about this passage
                  </label>
                  <Textarea
                    placeholder="Write a prayer based on this Scripture and how it applies to your life..."
                    value={prayer}
                    onChange={(e) => setPrayer(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Content (for non-SOAP posts) */}
            {postType !== "soap" && (
              <Textarea
                ref={textareaRef}
                placeholder={`What would you like to share with your community?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="resize-none"
              />
            )}

            {/* Tags */}
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {tags.length < 5 && (
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={addTag}>
                    <Hash className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Audience Selection */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Share with:</span>
              <Select value={audience} onValueChange={(value: 'public' | 'church' | 'private') => setAudience(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span>Public</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="church">
                    <div className="flex items-center space-x-2">
                      <Church className="w-4 h-4" />
                      <span>Church</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Private</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-1" />
                  Photo
                </Button>
                <Button variant="outline" size="sm">
                  <Paperclip className="w-4 h-4 mr-1" />
                  Attach
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => setIsExpanded(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={createPostMutation.isPending}
                  className={selectedPostTypeOption?.color}
                >
                  {createPostMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Share {selectedPostTypeOption?.label}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Click Area */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-gray-500">
              {selectedPostTypeOption?.description}
            </span>
          </button>
        )}
      </CardContent>
    </Card>
  );
}