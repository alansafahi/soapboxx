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
  MoreHorizontal,
  Flag
} from "lucide-react";
import { FlagContentDialog } from "./content-moderation/FlagContentDialog";
import ShareDialog from "./ShareDialog";
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
  
  // Parse markdown images and videos
  const parseMarkdown = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    
    // Match markdown images: ![alt](url)
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = imageRegex.exec(text)) !== null) {
      // Add text before the image
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Add the image
      parts.push({
        type: 'image',
        alt: match[1],
        src: match[2],
        index: parts.length
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts.length === 0 ? [text] : parts;
  };
  
  const parts = parseMarkdown(formattedContent);
  
  return (
    <span>
      {parts.map((part, index) => {
        if (typeof part === 'object' && part.type === 'image') {
          return (
            <img 
              key={part.index} 
              src={part.src} 
              alt={part.alt} 
              className="max-w-full h-auto rounded-lg my-2 border"
              style={{ maxHeight: '300px' }}
            />
          );
        }
        
        // Handle text formatting for string parts
        const textPart = typeof part === 'string' ? part : '';
        return (
          <span key={index}>
            {textPart.split(/(\*\*.*?\*\*|\*.*?\*|_.*?_)/).map((textSegment, segIndex) => {
              if (textSegment.startsWith('**') && textSegment.endsWith('**')) {
                return <strong key={segIndex}>{textSegment.slice(2, -2)}</strong>;
              } else if (textSegment.startsWith('*') && textSegment.endsWith('*')) {
                return <em key={segIndex}>{textSegment.slice(1, -1)}</em>;
              } else if (textSegment.startsWith('_') && textSegment.endsWith('_')) {
                return <u key={segIndex}>{textSegment.slice(1, -1)}</u>;
              }
              return textSegment.split('\n').map((line, lineIndex, lines) => (
                lineIndex < lines.length - 1 ? (
                  <span key={lineIndex}>{line}<br /></span>
                ) : line
              ));
            })}
          </span>
        );
      })}
    </span>
  );
};

interface ExtendedSoapEntry extends SoapEntry {
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl: string;
  };
}

interface SoapEntryCardProps {
  entry: ExtendedSoapEntry;
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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch current user to check if this is their entry
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/user'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Determine if this is the current user's entry to show proper name
  const isCurrentUserEntry = currentUser && entry.userId === (currentUser as any)?.id;
  
  // Use author data if available (for community entries), otherwise fallback to current user logic
  const getDisplayName = () => {
    if (entry.author) {
      return `${entry.author.firstName || ''} ${entry.author.lastName || ''}`.trim() || 'Anonymous';
    }
    return isCurrentUserEntry 
      ? `${(currentUser as any)?.firstName || (currentUser as any)?.username || 'You'}`
      : 'Anonymous';
  };
  
  const displayName = getDisplayName();
  
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

  const handleShare = () => {
    setShareDialogOpen(true);
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
              <AvatarImage src={entry.author?.profileImageUrl || (isCurrentUserEntry ? (currentUser as any)?.profileImageUrl : '') || ''} />
              <AvatarFallback>
                {entry.author?.firstName && entry.author?.lastName
                  ? `${entry.author.firstName.charAt(0)}${entry.author.lastName.charAt(0)}`.toUpperCase()
                  : isCurrentUserEntry && (currentUser as any)?.firstName && (currentUser as any)?.lastName
                  ? `${(currentUser as any).firstName.charAt(0)}${(currentUser as any).lastName.charAt(0)}`.toUpperCase()
                  : (entry.author?.firstName?.charAt(0) || (currentUser as any)?.firstName?.charAt(0) || 'A').toUpperCase()}
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
                  
                  <FlagContentDialog
                    contentType="soap_entry"
                    contentId={entry.id}
                    trigger={
                      <DropdownMenuItem className="gap-2 text-orange-600 focus:text-orange-600">
                        <Flag className="h-4 w-4" />
                        Report Entry
                      </DropdownMenuItem>
                    }
                  />
                  
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={onDelete} 
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Entry
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
              <FormattedText content={entry.observation && entry.observation.trim() 
                ? (isExpanded || entry.observation.length <= 150 
                    ? entry.observation 
                    : truncateText(entry.observation))
                : "Add your observations about this scripture..."
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
              <FormattedText content={entry.application && entry.application.trim() 
                ? (isExpanded || entry.application.length <= 150 
                    ? entry.application 
                    : truncateText(entry.application))
                : "How does this apply to your life?..."
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
              <FormattedText content={entry.prayer && entry.prayer.trim() 
                ? (isExpanded || entry.prayer.length <= 150 
                    ? entry.prayer 
                    : truncateText(entry.prayer))
                : "Write your prayer based on this scripture..."
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
      
      {/* Enhanced Share Dialog */}
      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        title={`Share S.O.A.P. Entry - ${entry.scriptureReference || 'Scripture Reflection'}`}
        content={`Check out this S.O.A.P. entry: "${entry.scriptureReference || 'Scripture Reflection'}"\n\nScripture: ${entry.scripture.substring(0, 100)}${entry.scripture.length > 100 ? '...' : ''}\n\nShared from SoapBox Super App`}
        url={`https://www.soapboxsuperapp.com/soap-journal`}
      />
    </Card>
  );
}