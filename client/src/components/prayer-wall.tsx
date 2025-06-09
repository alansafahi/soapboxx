import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Hand, Plus, CheckCircle, MessageCircle, Users, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import type { PrayerRequest } from "@shared/schema";

const prayerRequestSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Prayer request content is required"),
  isAnonymous: z.boolean().default(false),
  category: z.string().optional(),
  churchId: z.number().optional(),
  isPublic: z.boolean().default(true),
});

type PrayerRequestFormData = z.infer<typeof prayerRequestSchema>;

export default function PrayerWall() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [prayedRequests, setPrayedRequests] = useState<Set<number>>(new Set());
  const [likedRequests, setLikedRequests] = useState<Set<number>>(new Set());
  const [animatingButtons, setAnimatingButtons] = useState<Set<number>>(new Set());

  const form = useForm<PrayerRequestFormData>({
    resolver: zodResolver(prayerRequestSchema),
    defaultValues: {
      title: "",
      content: "",
      isAnonymous: false,
      category: "general",
      churchId: undefined,
      isPublic: true,
    },
  });

  // Fetch prayer requests
  const { data: prayerRequests = [], isLoading } = useQuery<PrayerRequest[]>({
    queryKey: ["/api/prayers"],
  });

  // Pray for request mutation (prayer counter)
  const prayForRequestMutation = useMutation({
    mutationFn: async (prayerRequestId: number) => {
      await apiRequest("POST", `/api/prayers/${prayerRequestId}/pray`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      toast({
        title: "Prayer Added",
        description: "Thank you for praying for this request.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add prayer. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Like prayer mutation (separate from pray counter)
  const likePrayerMutation = useMutation({
    mutationFn: async (prayerRequestId: number) => {
      const response = await fetch(`/api/prayers/${prayerRequestId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to toggle prayer like');
      return response.json();
    },
    onSuccess: (data, prayerRequestId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      setLikedRequests(prev => {
        const newSet = new Set(prev);
        if (data.liked) {
          newSet.add(prayerRequestId);
        } else {
          newSet.delete(prayerRequestId);
        }
        return newSet;
      });
      toast({
        title: data.liked ? "Liked" : "Unliked",
        description: data.liked ? "Prayer request liked" : "Prayer request unliked",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to toggle like. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create prayer request mutation
  const createPrayerMutation = useMutation({
    mutationFn: async (data: PrayerRequestFormData) => {
      await apiRequest("POST", "/api/prayers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Prayer Request Posted",
        description: "Your prayer request has been added to the Prayer Wall.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit prayer request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePrayForRequest = (prayerRequestId: number) => {
    // Add animation state
    setAnimatingButtons(prev => new Set([...Array.from(prev), prayerRequestId]));
    
    // Toggle prayed state optimistically
    const isCurrentlyPrayed = prayedRequests.has(prayerRequestId);
    setPrayedRequests(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyPrayed) {
        newSet.delete(prayerRequestId);
      } else {
        newSet.add(prayerRequestId);
      }
      return newSet;
    });

    // Remove animation state after animation completes
    setTimeout(() => {
      setAnimatingButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete(prayerRequestId);
        return newSet;
      });
    }, 400);

    prayForRequestMutation.mutate(prayerRequestId);
  };

  const handleLikePrayer = (prayerRequestId: number) => {
    likePrayerMutation.mutate(prayerRequestId);
  };

  const handleCreatePrayer = (data: PrayerRequestFormData) => {
    createPrayerMutation.mutate(data);
  };

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prayer Wall Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-0 shadow-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center space-x-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Hand className="w-6 h-6 text-purple-600" />
            <span>Prayer Wall</span>
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Share your prayer requests and pray for others in our community
          </p>
          <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{prayerRequests.length} requests</span>
            </div>
            <div className="flex items-center space-x-1">
              <Hand className="w-4 h-4" />
              <span>Community prayers</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Create Prayer Request Button */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Prayer Request to Wall
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Prayer Request</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreatePrayer)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief prayer request title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prayer Request</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please pray for..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isAnonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Post Anonymously</FormLabel>
                      <div className="text-sm text-gray-500">
                        Hide your name from this request
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPrayerMutation.isPending}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {createPrayerMutation.isPending ? "Posting..." : "Post to Wall"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Prayer Requests */}
      <div className="space-y-4">
        <AnimatePresence>
          {prayerRequests.map((prayer) => (
            <motion.div
              key={prayer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src="/placeholder-avatar.png" />
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {prayer.isAnonymous ? "?" : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {prayer.isAnonymous ? "Anonymous" : "Community Member"}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(prayer.createdAt?.toString() || new Date().toISOString())}</span>
                            {prayer.isAnswered && (
                              <Badge className="bg-green-100 text-green-800 ml-2">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Answered
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    {prayer.title && (
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{prayer.title}</h4>
                    )}
                    
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {prayer.content}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex space-x-4">
                        {/* Pray Button (Prayer Counter) */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrayForRequest(prayer.id)}
                            disabled={prayForRequestMutation.isPending}
                            className={`text-sm transition-all duration-300 ${
                              prayedRequests.has(prayer.id)
                                ? 'text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100'
                                : prayer.isAnswered 
                                  ? 'text-green-500 hover:text-green-600 hover:bg-green-50' 
                                  : 'text-purple-500 hover:text-purple-600 hover:bg-purple-50'
                            }`}
                          >
                            <motion.div
                              animate={animatingButtons.has(prayer.id) ? {
                                scale: [1, 1.4, 1],
                                rotate: [0, 10, -10, 0]
                              } : {}}
                              transition={{ duration: 0.4 }}
                            >
                              <Hand className="w-4 h-4 mr-1" />
                            </motion.div>
                            <motion.span
                              animate={animatingButtons.has(prayer.id) ? {
                                scale: [1, 1.1, 1]
                              } : {}}
                              transition={{ duration: 0.4 }}
                            >
                              {prayer.isAnswered 
                                ? `${(prayer.prayerCount || 0) + (prayedRequests.has(prayer.id) ? 1 : 0)} prayed` 
                                : `${(prayer.prayerCount || 0) + (prayedRequests.has(prayer.id) ? 1 : 0)} praying`
                              }
                            </motion.span>
                          </Button>
                        </motion.div>
                        
                        {/* Like Button (Separate from prayer counter) */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleLikePrayer(prayer.id)}
                            disabled={likePrayerMutation.isPending}
                            className={`transition-all duration-300 ${
                              likedRequests.has(prayer.id) 
                                ? 'text-red-600 hover:text-red-700' 
                                : 'text-gray-500 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${likedRequests.has(prayer.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </motion.div>

                        {/* Comments Button (Placeholder) */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500 hover:text-blue-500 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">Support</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {prayerRequests.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Hand className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Prayer Requests Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Be the first to share a prayer request with the community.
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Prayer Request
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}