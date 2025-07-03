import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { isUnauthorizedError } from "../lib/authUtils";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Heart, Plus, CheckCircle, Hand } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { PrayerRequest } from "../../../shared/schema";

const prayerRequestSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Prayer request content is required"),
  isAnonymous: z.boolean().default(false),
  category: z.string().optional(),
  churchId: z.number().optional(),
  isPublic: z.boolean().default(true),
});

type PrayerRequestFormData = z.infer<typeof prayerRequestSchema>;

export default function PrayerRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [prayedRequests, setPrayedRequests] = useState<Set<number>>(new Set());
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
        title: "Prayer Request Submitted",
        description: "Your prayer request has been shared with the community.",
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

  // Pray for request mutation
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

  const handleCreatePrayer = (data: PrayerRequestFormData) => {
    createPrayerMutation.mutate(data);
  };

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

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border-l-4 border-gray-200 pl-4 py-2">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Prayer Requests</CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Submit Prayer Request</DialogTitle>
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
                          <Input placeholder="Brief title for your prayer request" {...field} />
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
                            placeholder="Please share what you would like prayer for..." 
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Submit Anonymously</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Your name will not be shown with this request
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
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createPrayerMutation.isPending}
                      className="bg-gradient-to-r from-faith-blue to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      {createPrayerMutation.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {prayerRequests.length === 0 ? (
          <div className="text-center py-8">
            <Hand className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prayer requests</h3>
            <p className="text-gray-600 text-sm">Be the first to share a prayer request with your community.</p>
          </div>
        ) : (
          prayerRequests.map((prayer) => (
            <div 
              key={prayer.id} 
              className={`border-l-4 pl-4 py-2 ${
                prayer.isAnswered 
                  ? 'border-green-500' 
                  : 'border-faith-blue'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {prayer.isAnonymous ? "Anonymous" : "Community Member"}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(prayer.createdAt?.toString() || new Date().toISOString())}
                </span>
                {prayer.isAnswered && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Answered
                  </Badge>
                )}
              </div>
              
              {prayer.title && (
                <h4 className="font-medium text-gray-900 mb-1">{prayer.title}</h4>
              )}
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-3">{prayer.content}</p>
              
              <div className="flex items-center space-x-3">
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
                          : 'text-faith-blue hover:text-blue-600 hover:bg-blue-50'
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
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handlePrayForRequest(prayer.id)}
                    className="text-gray-500 hover:text-pink-500 hover:bg-pink-50 transition-all duration-300"
                  >
                    <motion.div
                      whileHover={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart className="w-4 h-4" />
                    </motion.div>
                  </Button>
                </motion.div>
              </div>
            </div>
          ))
        )}
        
        <div className="border-t border-gray-100 pt-4">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-faith-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                <Hand className="w-4 h-4 mr-2" />
                Submit Prayer Request
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
