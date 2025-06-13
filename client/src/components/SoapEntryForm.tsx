import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BookOpen, Eye, Users, Lightbulb, Save, Sparkles, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSoapEntrySchema, type SoapEntry } from "@shared/schema";
import { z } from "zod";

const formSchema = insertSoapEntrySchema.extend({
  devotionalDate: z.string(),
});

type FormData = z.infer<typeof formSchema>;

interface SoapEntryFormProps {
  entry?: SoapEntry | null;
  onClose: () => void;
  onSuccess: () => void;
}

const moodOptions = [
  { value: "peaceful", label: "Peaceful", color: "bg-blue-100 text-blue-800" },
  { value: "grateful", label: "Grateful", color: "bg-green-100 text-green-800" },
  { value: "inspired", label: "Inspired", color: "bg-purple-100 text-purple-800" },
  { value: "struggling", label: "Struggling", color: "bg-orange-100 text-orange-800" },
  { value: "hopeful", label: "Hopeful", color: "bg-yellow-100 text-yellow-800" },
  { value: "reflective", label: "Reflective", color: "bg-indigo-100 text-indigo-800" },
  { value: "joyful", label: "Joyful", color: "bg-pink-100 text-pink-800" },
  { value: "seeking", label: "Seeking", color: "bg-gray-100 text-gray-800" },
];

export function SoapEntryForm({ entry, onClose, onSuccess }: SoapEntryFormProps) {
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scripture: entry?.scripture || "",
      scriptureReference: entry?.scriptureReference || "",
      observation: entry?.observation || "",
      application: entry?.application || "",
      prayer: entry?.prayer || "",
      moodTag: entry?.moodTag || "peaceful",
      isPublic: entry?.isPublic || false,
      isSharedWithGroup: entry?.isSharedWithGroup || false,
      isSharedWithPastor: entry?.isSharedWithPastor || false,
      aiAssisted: entry?.aiAssisted || false,
      tags: entry?.tags || [],
      devotionalDate: entry?.devotionalDate 
        ? new Date(entry.devotionalDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      estimatedReadTime: entry?.estimatedReadTime || 5,
    },
  });

  // Get current user for church context
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: () => apiRequest('/api/auth/user'),
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        churchId: user?.churchId || 1,
        devotionalDate: new Date(data.devotionalDate),
        tags: data.tags || [],
      };

      if (entry) {
        return apiRequest(`/api/soap/${entry.id}`, {
          method: 'PUT',
          body: payload,
        });
      } else {
        return apiRequest('/api/soap', {
          method: 'POST',
          body: payload,
        });
      }
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save S.O.A.P. entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  // AI assistance mutation
  const aiAssistMutation = useMutation({
    mutationFn: async () => {
      const currentData = form.getValues();
      return apiRequest('/api/soap/ai-assist', {
        method: 'POST',
        body: {
          scripture: currentData.scripture,
          scriptureReference: currentData.scriptureReference,
          currentObservation: currentData.observation,
          currentApplication: currentData.application,
          currentPrayer: currentData.prayer,
        },
      });
    },
    onSuccess: (suggestions) => {
      // Apply AI suggestions to form fields
      if (suggestions.observation && !form.getValues('observation')) {
        form.setValue('observation', suggestions.observation);
      }
      if (suggestions.application && !form.getValues('application')) {
        form.setValue('application', suggestions.application);
      }
      if (suggestions.prayer && !form.getValues('prayer')) {
        form.setValue('prayer', suggestions.prayer);
      }
      
      // Mark as AI-assisted
      form.setValue('aiAssisted', true);
      
      toast({
        title: "AI suggestions applied",
        description: "Your S.O.A.P. entry has been enhanced with spiritual insights.",
      });
    },
    onError: () => {
      toast({
        title: "AI assistance unavailable",
        description: "Could not generate suggestions at this time. Continue manually.",
        variant: "destructive",
      });
    },
  });

  const handleAIAssist = async () => {
    const scripture = form.getValues('scripture');
    if (!scripture.trim()) {
      toast({
        title: "Scripture required",
        description: "Please enter a scripture passage before requesting AI assistance.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingAI(true);
    try {
      await aiAssistMutation.mutateAsync();
    } finally {
      setIsLoadingAI(false);
    }
  };

  const onSubmit = (data: FormData) => {
    saveMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onClose} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {entry ? 'Edit S.O.A.P. Entry' : 'New S.O.A.P. Entry'}
            </h1>
            <p className="text-muted-foreground">Scripture • Observation • Application • Prayer</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Scripture Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Scripture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="scriptureReference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scripture Reference</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John 3:16, Psalm 23:1-3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scripture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scripture Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the Bible verse or passage..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* AI Assistance */}
            <Card className="border-dashed">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <div>
                      <h3 className="font-semibold">AI-Powered Spiritual Insights</h3>
                      <p className="text-sm text-muted-foreground">
                        Get thoughtful suggestions for your reflection
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAIAssist}
                    disabled={isLoadingAI || !form.watch('scripture')}
                    className="gap-2"
                  >
                    {isLoadingAI ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Get AI Suggestions
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* S.O.A.P. Sections */}
            <div className="grid gap-6">
              {/* Observation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Observation
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    What does this passage say? What stands out to you?
                  </p>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="observation"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="What do you observe in this scripture? What key themes, words, or phrases stand out?"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Application */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Application
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    How does this apply to your life? What is God saying to you?
                  </p>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="application"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="How can you apply this scripture to your life today? What changes or actions is God calling you to make?"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Prayer */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Prayer
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Turn your thoughts into a prayer to God
                  </p>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="prayer"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Write a prayer based on your observations and applications..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Entry Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="devotionalDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Devotional Date
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="moodTag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spiritual Mood</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your spiritual mood" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {moodOptions.map((mood) => (
                              <SelectItem key={mood.value} value={mood.value}>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className={mood.color}>
                                    {mood.label}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Sharing Options */}
                <div className="space-y-4">
                  <h4 className="font-medium">Sharing Options</h4>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">
                              Share with Community
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Make this entry visible in the community feed
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

                    <FormField
                      control={form.control}
                      name="isSharedWithPastor"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">
                              Share with Pastor
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Allow your pastor to see this reflection
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
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="gap-2"
              >
                {saveMutation.isPending ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {entry ? 'Update Entry' : 'Save Entry'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}