import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Heart, 
  Share2, 
  RefreshCw, 
  Sparkles, 
  BookOpen,
  Sun,
  Star
} from "lucide-react";

interface DailyInspiration {
  id: number;
  title: string;
  content: string;
  verse?: string;
  verseReference?: string;
  category: string;
  createdAt: string;
}

export default function DailyInspiration() {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inspiration, isLoading, refetch } = useQuery({
    queryKey: ['/api/inspiration/daily'],
    retry: false,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (inspirationId: number) => {
      await apiRequest(`/api/inspiration/${inspirationId}/read`, {
        method: 'POST',
      });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ inspirationId, action }: { inspirationId: number; action: 'add' | 'remove' }) => {
      if (action === 'add') {
        await apiRequest(`/api/inspiration/${inspirationId}/favorite`, {
          method: 'POST',
        });
      } else {
        await apiRequest(`/api/inspiration/${inspirationId}/favorite`, {
          method: 'DELETE',
        });
      }
    },
    onSuccess: (_, variables) => {
      setIsFavorited(variables.action === 'add');
      toast({
        title: variables.action === 'add' ? "Added to favorites" : "Removed from favorites",
        description: variables.action === 'add' ? "You can find this inspiration in your favorites." : "Removed from your favorite inspirations.",
      });
    },
  });

  const shareMutation = useMutation({
    mutationFn: async (inspirationId: number) => {
      await apiRequest(`/api/inspiration/${inspirationId}/share`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      setIsShared(true);
      toast({
        title: "Shared successfully",
        description: "Your inspiration has been shared with the community.",
      });
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      await refetch();
    },
    onSuccess: () => {
      toast({
        title: "New inspiration loaded",
        description: "Here's fresh spiritual guidance for your day.",
      });
    },
  });

  const handleFavorite = () => {
    if (!inspiration) return;
    
    const action = isFavorited ? 'remove' : 'add';
    favoriteMutation.mutate({ inspirationId: inspiration.id, action });
  };

  const handleShare = () => {
    if (!inspiration) return;
    
    shareMutation.mutate(inspiration.id);
  };

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  // Mark as read when component mounts and inspiration is available
  useState(() => {
    if (inspiration && !markAsReadMutation.isSuccess) {
      markAsReadMutation.mutate(inspiration.id);
    }
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      faith: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      hope: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      love: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      strength: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      peace: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      joy: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      wisdom: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      grace: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      faith: Star,
      hope: Sun,
      love: Heart,
      strength: Sparkles,
      peace: BookOpen,
      joy: Sun,
      wisdom: BookOpen,
      grace: Sparkles,
    };
    const IconComponent = icons[category as keyof typeof icons] || BookOpen;
    return <IconComponent className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!inspiration) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                No inspiration available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check back later for your daily spiritual guidance.
              </p>
            </div>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="bg-white dark:bg-gray-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={inspiration.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Daily Inspiration
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                
                <Badge 
                  className={`${getCategoryColor(inspiration.category)} border-0 px-3 py-1`}
                >
                  <motion.div className="flex items-center space-x-1">
                    {getCategoryIcon(inspiration.category)}
                    <span className="capitalize font-medium">{inspiration.category}</span>
                  </motion.div>
                </Badge>
              </div>

              {/* Title */}
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold text-gray-900 dark:text-white leading-tight"
              >
                {inspiration.title}
              </motion.h2>

              {/* Content */}
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg"
              >
                {inspiration.content}
              </motion.p>

              {/* Bible Verse */}
              {inspiration.verse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-blue-500"
                >
                  <p className="text-gray-800 dark:text-gray-200 italic text-lg leading-relaxed">
                    "{inspiration.verse}"
                  </p>
                  {inspiration.verseReference && (
                    <p className="text-blue-600 dark:text-blue-400 font-medium mt-2 text-sm">
                      — {inspiration.verseReference}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFavorite}
                    disabled={favoriteMutation.isPending}
                    className={`transition-all duration-300 ${
                      isFavorited 
                        ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900' 
                        : 'text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                    </motion.div>
                    {isFavorited ? 'Favorited' : 'Favorite'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    disabled={shareMutation.isPending || isShared}
                    className="text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-300"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                    </motion.div>
                    {isShared ? 'Shared' : 'Share'}
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshMutation.isPending}
                  className="bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                >
                  <motion.div
                    animate={{ rotate: refreshMutation.isPending ? 360 : 0 }}
                    transition={{ duration: 1, repeat: refreshMutation.isPending ? Infinity : 0 }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                  </motion.div>
                  New Inspiration
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}