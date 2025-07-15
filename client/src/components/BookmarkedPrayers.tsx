import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Heart, MessageCircle, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BookmarkedPrayer {
  id: number;
  title: string | null;
  content: string;
  category: string | null;
  isAnonymous: boolean | null;
  isUrgent: boolean | null;
  isAnswered: boolean | null;
  createdAt: Date | null;
  authorFirstName: string | null;
  authorLastName: string | null;
  authorEmail: string | null;
  authorProfileImageUrl: string | null;
  prayerCount: number;
  responseCount: number;
}

const BookmarkedPrayers = () => {
  const { data: bookmarkedPrayers, isLoading, error } = useQuery<BookmarkedPrayer[]>({
    queryKey: ['/api/prayers/bookmarked'],
    queryFn: async () => {
      const response = await fetch('/api/prayers/bookmarked', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch bookmarked prayers');
      }
      return response.json();
    }
  });

  const getAuthorDisplayName = (prayer: BookmarkedPrayer) => {
    if (prayer.isAnonymous) {
      return "Anonymous";
    }
    
    if (prayer.authorFirstName && prayer.authorLastName) {
      return `${prayer.authorFirstName} ${prayer.authorLastName}`;
    }
    
    if (prayer.authorFirstName) {
      return prayer.authorFirstName;
    }
    
    if (prayer.authorEmail) {
      return prayer.authorEmail.split('@')[0];
    }
    
    return "Community Member";
  };

  const getAuthorInitials = (prayer: BookmarkedPrayer) => {
    if (prayer.isAnonymous) {
      return "?";
    }
    
    if (prayer.authorFirstName && prayer.authorLastName) {
      return `${prayer.authorFirstName[0]}${prayer.authorLastName[0]}`;
    }
    
    if (prayer.authorFirstName) {
      return prayer.authorFirstName[0];
    }
    
    if (prayer.authorEmail) {
      return prayer.authorEmail[0].toUpperCase();
    }
    
    return "CM";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Bookmark className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">My Bookmarked Prayers</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <Bookmark className="h-12 w-12 mx-auto mb-2" />
          <p>Failed to load bookmarked prayers</p>
          <p className="text-sm text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!bookmarkedPrayers || bookmarkedPrayers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">
          <Bookmark className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-medium mb-2">No Bookmarked Prayers</h3>
          <p>When you bookmark prayer requests, they'll appear here for easy access.</p>
        </div>
        <Button variant="outline" onClick={() => window.location.href = '/prayer-wall'}>
          Visit Prayer Wall
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bookmark className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">My Bookmarked Prayers</h2>
        </div>
        <Badge variant="secondary">
          {bookmarkedPrayers.length} {bookmarkedPrayers.length === 1 ? 'prayer' : 'prayers'}
        </Badge>
      </div>

      <div className="grid gap-4">
        {bookmarkedPrayers.map((prayer) => (
          <Card key={prayer.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={prayer.isAnonymous ? undefined : prayer.authorProfileImageUrl || undefined} 
                      alt={getAuthorDisplayName(prayer)}
                    />
                    <AvatarFallback className="text-xs">
                      {getAuthorInitials(prayer)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{getAuthorDisplayName(prayer)}</p>
                    {prayer.createdAt && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(prayer.createdAt), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {prayer.isUrgent && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                  {prayer.isAnswered && (
                    <Badge variant="default" className="text-xs bg-green-600">
                      Answered
                    </Badge>
                  )}
                  {prayer.category && (
                    <Badge variant="outline" className="text-xs">
                      {prayer.category}
                    </Badge>
                  )}
                </div>
              </div>
              {prayer.title && (
                <CardTitle className="text-lg leading-tight">
                  {prayer.title}
                </CardTitle>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {prayer.content}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{prayer.prayerCount || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{prayer.responseCount || 0}</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/prayer-wall'}
                >
                  View on Prayer Wall
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BookmarkedPrayers;