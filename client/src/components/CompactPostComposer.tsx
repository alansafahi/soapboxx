import { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { ImageIcon, VideoIcon, SmileIcon, MapPinIcon, UsersIcon } from "lucide-react";

interface CompactPostComposerProps {
  className?: string;
}

export default function CompactPostComposer({ className = "" }: CompactPostComposerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const moods = [
    { emoji: "🙏", label: "Grateful" },
    { emoji: "✝️", label: "Blessed" },
    { emoji: "🕊️", label: "Peaceful" },
    { emoji: "❤️", label: "Loved" },
    { emoji: "🔥", label: "Inspired" },
    { emoji: "🌟", label: "Hopeful" }
  ];

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; mood?: string }) => {
      return apiRequest("POST", "/api/discussions", data);
    },
    onSuccess: () => {
      setContent("");
      setSelectedMoods([]);
      setIsExpanded(false);
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

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    createPostMutation.mutate({
      content: content.trim(),
      mood: selectedMoods.join(", ")
    });
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleMoodToggle = (mood: string) => {
    setSelectedMoods(prev => 
      prev.includes(mood) 
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  if (!user) return null;

  return (
    <div 
      data-testid="compact-composer"
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 ${isExpanded ? 'p-4' : 'p-3'} ${className}`}
    >
      <div className="flex space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={user.profileImageUrl || undefined} />
          <AvatarFallback className="bg-purple-100 text-purple-600 text-sm">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-3">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={handleFocus}
            placeholder={isExpanded ? "Share your thoughts, prayers, or inspiration..." : "What's on your heart?"}
            className={`border-none resize-none bg-transparent p-0 min-h-0 focus-visible:ring-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 ${
              isExpanded ? 'min-h-[80px]' : 'min-h-[40px]'
            }`}
            rows={isExpanded ? 3 : 1}
          />

          {isExpanded && (
            <>
              {/* Mood Selector */}
              <div className="flex flex-wrap gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood.label}
                    onClick={() => handleMoodToggle(mood.label)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm transition-colors ${
                      selectedMoods.includes(mood.label)
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 ring-1 ring-purple-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span>{mood.emoji}</span>
                    <span>{mood.label}</span>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <VideoIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <SmileIcon className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsExpanded(false);
                      setContent("");
                      setSelectedMoods([]);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!content.trim() || createPostMutation.isPending}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
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
    </div>
  );
}