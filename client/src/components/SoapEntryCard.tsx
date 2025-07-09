import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { 
  BookOpen, 
  Eye, 
  Lightbulb, 
  Users, 
  Calendar, 
  Edit, 
  Trash2, 
  Star, 
  Share2,
  Clock,
  Sparkles,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { formatDistanceToNow, isValid, parseISO } from "date-fns";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import type { SoapEntry } from "../../../shared/schema";

// Utility function to render HTML content with proper formatting
const FormattedText = ({ content }: { content: string }) => {
  const formatContent = (htmlContent: string) => {
    return htmlContent
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**') // Bold
      .replace(/<b>(.*?)<\/b>/gi, '**$1**') // Bold
      .replace(/<em>(.*?)<\/em>/gi, '*$1*') // Italic
      .replace(/<i>(.*?)<\/i>/gi, '*$1*') // Italic
      .replace(/<u>(.*?)<\/u>/gi, '_$1_') // Underline
      .replace(/<br\s*\/?>/gi, '\n') // Line breaks
      .replace(/<p>(.*?)<\/p>/gi, '$1\n') // Paragraphs
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .trim();
  };
  
  const formattedContent = formatContent(content);
  
  return (
    <span>
      {formattedContent.split(/(\*\*.*?\*\*|\*.*?\*|_.*?_)/).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        } else if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        } else if (part.startsWith('_') && part.endsWith('_')) {
          return <u key={index}>{part.slice(1, -1)}</u>;
        }
        return part;
      })}
    </span>
  );
};

interface SoapEntryCardProps {
  entry: SoapEntry;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onFeature?: () => void;
  onUnfeature?: () => void;
}

const moodColors = {
  peaceful: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  grateful: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  inspired: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  struggling: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  hopeful: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  reflective: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  joyful: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  seeking: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function SoapEntryCard({ 
  entry, 
  showActions = false, 
  onEdit, 
  onDelete, 
  onFeature, 
  onUnfeature 
}: SoapEntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  
  // Fetch current user to check if this is their entry
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/user'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Determine if this is the current user's entry to show proper name
  const isCurrentUserEntry = currentUser && entry.userId === currentUser.id;
  const displayName = isCurrentUserEntry 
    ? `${currentUser.firstName || currentUser.username || 'You'}`
    : entry.userId;
  
  const formatDate = (date: Date | string | null) => {
    if (!date) return "Today";
    
    try {
      // Handle different date formats
      let dateObj: Date;
      if (typeof date === 'string') {
        // Try parsing ISO string first, then fallback to regular Date parsing
        dateObj = date.includes('T') ? parseISO(date) : new Date(date);
      } else {
        dateObj = date;
      }
      
      // Check if date is valid
      if (!isValid(dateObj)) {
        return "Today";
      }
      
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
      return "Today";
    }
  };

  const handleShare = async () => {
    const productionUrl = `https://www.soapboxapp.org/soap-journal`;
    const shareText = `Check out this S.O.A.P. entry: "${entry.scriptureReference || 'Scripture Reflection'}"\n\nScripture: ${entry.scripture.substring(0, 100)}${entry.scripture.length > 100 ? '...' : ''}\n\nShared from SoapBox Super App`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `S.O.A.P. Entry - ${entry.scriptureReference || 'Scripture Reflection'}`,
          text: shareText,
          url: productionUrl
        });
        toast({
          title: "Shared successfully",
          description: "S.O.A.P. entry has been shared."
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareText}\n\n${productionUrl}`);
        toast({
          title: "Copied to clipboard",
          description: "S.O.A.P. entry content copied and ready to share."
        });
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to share S.O.A.P. entry.",
        variant: "destructive"
      });
    }
  };

  const getMoodColor = (mood: string | null) => {
    return mood && mood in moodColors 
      ? moodColors[mood as keyof typeof moodColors]
      : moodColors.peaceful;
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      entry.isFeatured ? 'ring-2 ring-yellow-200 bg-yellow-50/30 dark:ring-yellow-800 dark:bg-yellow-900/10' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback>
                {isCurrentUserEntry && currentUser?.firstName && currentUser?.lastName
                  ? `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase()
                  : entry.userId?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">
                  {displayName || 'Anonymous'}
                </h4>
                {entry.isFeatured && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </Badge>
                )}
                {entry.aiAssisted && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Sparkles className="h-3 w-3" />
                    AI Enhanced
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(entry.devotionalDate)}
                {entry.estimatedReadTime && (
                  <>
                    <Separator orientation="vertical" className="h-3" />
                    <Clock className="h-3 w-3" />
                    {entry.estimatedReadTime} min read
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {entry.moodTag && (
              <Badge variant="secondary" className={getMoodColor(entry.moodTag)}>
                {entry.moodTag}
              </Badge>
            )}
            
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit} className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Entry
                    </DropdownMenuItem>
                  )}
                  {entry.isFeatured && onUnfeature ? (
                    <DropdownMenuItem onClick={onUnfeature} className="gap-2">
                      <Star className="h-4 w-4" />
                      Unfeature
                    </DropdownMenuItem>
                  ) : onFeature && (
                    <DropdownMenuItem onClick={onFeature} className="gap-2">
                      <Star className="h-4 w-4" />
                      Feature Entry
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleShare} className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={onDelete} 
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Scripture Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <BookOpen className="h-4 w-4" />
            Scripture
            {entry.scriptureReference && (
              <Badge variant="outline" className="text-xs">
                {entry.scriptureReference}
              </Badge>
            )}
          </div>
          <blockquote className="border-l-4 border-primary pl-4 italic text-sm">
            <FormattedText content={isExpanded || entry.scripture.length <= 200 
              ? entry.scripture 
              : truncateText(entry.scripture, 200)
            } />
          </blockquote>
        </div>

        <Separator />

        {/* S.O.A.P. Sections */}
        <div className="space-y-4">
          {/* Observation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Eye className="h-4 w-4 text-blue-600" />
              Observation
            </div>
            <p className="text-sm text-muted-foreground">
              <FormattedText content={isExpanded || entry.observation.length <= 150 
                ? entry.observation 
                : truncateText(entry.observation)
              } />
            </p>
          </div>

          {/* Application */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              Application
            </div>
            <p className="text-sm text-muted-foreground">
              <FormattedText content={isExpanded || entry.application.length <= 150 
                ? entry.application 
                : truncateText(entry.application)
              } />
            </p>
          </div>

          {/* Prayer */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-purple-600" />
              Prayer
            </div>
            <p className="text-sm text-muted-foreground italic">
              <FormattedText content={isExpanded || entry.prayer.length <= 150 
                ? entry.prayer 
                : truncateText(entry.prayer)
              } />
            </p>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        {(entry.scripture.length > 200 || 
          entry.observation.length > 150 || 
          entry.application.length > 150 || 
          entry.prayer.length > 150) && (
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </Button>
          </div>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {entry.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-3">
            <span>Day {entry.streakDay || 1} of streak</span>
            {entry.isPublic && (
              <Badge variant="secondary" className="text-xs">
                Public
              </Badge>
            )}
            {entry.isSharedWithPastor && (
              <Badge variant="secondary" className="text-xs">
                Shared with Pastor
              </Badge>
            )}
          </div>
          <span>{formatDate(entry.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}