import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { Trophy, Heart, Zap, Calendar } from "lucide-react";

interface CheckIn {
  id: number;
  userId: string;
  mood: string;
  moodEmoji?: string;
  moodScore?: number;
  notes?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

const moodEmojis: { [key: string]: string } = {
  grateful: "🙏",
  blessed: "✝️",
  peaceful: "🕊️",
  loved: "❤️",
  inspired: "🔥",
  hopeful: "🌟",
  joyful: "😊",
  reflective: "🤔",
  seeking: "🔍",
  struggling: "😔",
};

export default function RecentCheckInsStrip() {
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: recentCheckIns = [], isLoading } = useQuery({
    queryKey: ["/api/mood-checkins/recent"],
    queryFn: async () => {
      const response = await fetch("/api/mood-checkins/recent", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch recent check-ins");
      return response.json();
    },
  });

  const handleCheckInClick = (checkIn: CheckIn) => {
    setSelectedCheckIn(checkIn);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recent Check-Ins</h3>
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded mt-2 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentCheckIns.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recent Check-Ins</h3>
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">No recent check-ins to show</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recent Check-Ins</h3>
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
          {recentCheckIns.map((checkIn: CheckIn) => {
            const mood = checkIn.mood?.split(',')[0]?.trim().toLowerCase() || 'peaceful';
            const moodEmoji = checkIn.moodEmoji || moodEmojis[mood] || '🙏';
            
            return (
              <button
                key={checkIn.id}
                onClick={() => handleCheckInClick(checkIn)}
                className="flex-shrink-0 flex flex-col items-center space-y-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="relative">
                  <Avatar className="w-16 h-16 border-2 border-purple-200 dark:border-purple-700 group-hover:border-purple-400 transition-colors">
                    <AvatarImage src={checkIn.user?.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                      {checkIn.user?.firstName?.[0]}{checkIn.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Mood emoji badge */}
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-gray-800 rounded-full border-2 border-purple-200 dark:border-purple-700 flex items-center justify-center text-sm">
                    {moodEmoji}
                  </div>
                  
                  {/* Mood score badge */}
                  {checkIn.moodScore && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {checkIn.moodScore}
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[4rem]">
                    {checkIn.user?.firstName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(checkIn.createdAt), { addSuffix: false })}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Check-In Detail Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedCheckIn?.user?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                  {selectedCheckIn?.user?.firstName?.[0]}{selectedCheckIn?.user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{selectedCheckIn?.user?.firstName} {selectedCheckIn?.user?.lastName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                  {selectedCheckIn && formatDistanceToNow(new Date(selectedCheckIn.createdAt), { addSuffix: true })}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription>
              View detailed information about this mood check-in
            </DialogDescription>
          </DialogHeader>

          {selectedCheckIn && (
            <div className="space-y-4">
              {/* Mood Display */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {selectedCheckIn.moodEmoji || moodEmojis[selectedCheckIn.mood?.split(',')[0]?.trim().toLowerCase() || 'peaceful'] || '🙏'}
                </span>
                <div>
                  <p className="font-medium">Mood</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCheckIn.mood}</p>
                </div>
              </div>

              {/* Mood Score */}
              {selectedCheckIn.moodScore && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Mood Score</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCheckIn.moodScore}/5</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedCheckIn.notes && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Reflection</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCheckIn.notes}</p>
                  </div>
                </div>
              )}

              {/* Check-in time */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">Check-in Time</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(selectedCheckIn.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}