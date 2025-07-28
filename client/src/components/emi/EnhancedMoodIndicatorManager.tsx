import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit2, Trash2, Settings, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { EnhancedMoodIndicator, InsertEnhancedMoodIndicator } from "@shared/schema";

const emiSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  emoji: z.string().min(1, "Emoji is required").max(10, "Emoji too long"),
  category: z.string().min(1, "Category is required").max(100, "Category too long"),
  subcategory: z.string().max(100, "Subcategory too long").optional(),
  description: z.string().optional(),
  colorHex: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
  moodScore: z.number().min(1).max(5),
  sortOrder: z.number().min(0).default(0),
});

type EmiFormData = z.infer<typeof emiSchema>;

interface EnhancedMoodIndicatorManagerProps {
  category?: string;
  onMoodSelect?: (mood: EnhancedMoodIndicator) => void;
  showAdminControls?: boolean;
}

export default function EnhancedMoodIndicatorManager({
  category,
  onMoodSelect,
  showAdminControls = false,
}: EnhancedMoodIndicatorManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMood, setEditingMood] = useState<EnhancedMoodIndicator | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(category || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EmiFormData>({
    resolver: zodResolver(emiSchema),
    defaultValues: {
      name: "",
      emoji: "",
      category: selectedCategory,
      subcategory: "",
      description: "",
      colorHex: "#3B82F6",
      moodScore: 3,
      sortOrder: 0,
    },
  });

  // Fetch mood indicators by category
  const { data: moodsByCategory = {}, isLoading } = useQuery({
    queryKey: ["/api/enhanced-mood-indicators/by-category"],
  });

  // Create mood indicator
  const createMoodMutation = useMutation({
    mutationFn: async (data: EmiFormData) => {
      return apiRequest("/api/enhanced-mood-indicators", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enhanced-mood-indicators/by-category"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Mood indicator created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update mood indicator
  const updateMoodMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EmiFormData> }) => {
      return apiRequest(`/api/enhanced-mood-indicators/${id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enhanced-mood-indicators/by-category"] });
      setEditingMood(null);
      form.reset();
      toast({
        title: "Success",
        description: "Mood indicator updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mood indicator
  const deleteMoodMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/enhanced-mood-indicators/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enhanced-mood-indicators/by-category"] });
      toast({
        title: "Success",
        description: "Mood indicator deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmiFormData) => {
    if (editingMood) {
      updateMoodMutation.mutate({ id: editingMood.id, data });
    } else {
      createMoodMutation.mutate(data);
    }
  };

  const handleEdit = (mood: EnhancedMoodIndicator) => {
    setEditingMood(mood);
    form.reset({
      name: mood.name,
      emoji: mood.emoji,
      category: mood.category,
      subcategory: mood.subcategory || "",
      description: mood.description || "",
      colorHex: mood.colorHex || "#3B82F6",
      moodScore: mood.moodScore,
      sortOrder: mood.sortOrder,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this mood indicator?")) {
      deleteMoodMutation.mutate(id);
    }
  };

  const categories = Object.keys(moodsByCategory);
  const filteredCategories = selectedCategory 
    ? { [selectedCategory]: moodsByCategory[selectedCategory] } 
    : moodsByCategory;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="w-6 h-6 text-blue-600" />
            Enhanced Mood Indicators
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage centralized mood indicators used across Reading Plans, Social Feed, and Daily Checkins
          </p>
        </div>

        {showAdminControls && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingMood(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Mood Indicator
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingMood ? "Edit Mood Indicator" : "Add New Mood Indicator"}
                </DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Joyful" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emoji"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emoji</FormLabel>
                        <FormControl>
                          <Input placeholder="😊" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Spiritual States">Spiritual States</SelectItem>
                              <SelectItem value="Emotional Well-being">Emotional Well-being</SelectItem>
                              <SelectItem value="Life Circumstances">Life Circumstances</SelectItem>
                              <SelectItem value="Faith & Worship">Faith & Worship</SelectItem>
                              <SelectItem value="Growth & Transformation">Growth & Transformation</SelectItem>
                              <SelectItem value="Seeking Support">Seeking Support</SelectItem>
                              <SelectItem value="Daily Checkin">Daily Checkin</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Worship" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="moodScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mood Score (1-5)</FormLabel>
                        <FormControl>
                          <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 - Very Low</SelectItem>
                              <SelectItem value="2">2 - Low</SelectItem>
                              <SelectItem value="3">3 - Neutral</SelectItem>
                              <SelectItem value="4">4 - High</SelectItem>
                              <SelectItem value="5">5 - Very High</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="colorHex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input type="color" className="w-12 h-9" {...field} />
                            <Input placeholder="#3B82F6" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe this mood..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMoodMutation.isPending || updateMoodMutation.isPending}
                    >
                      {editingMood ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Category Filter */}
      {!category && (
        <div className="flex items-center space-x-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Mood Indicators by Category */}
      <div className="space-y-6">
        {Object.entries(filteredCategories).map(([categoryName, moods]) => (
          <Card key={categoryName}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{categoryName}</span>
                <Badge variant="secondary">{moods.length} indicators</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {moods.map((mood) => (
                  <div
                    key={mood.id}
                    className={`
                      p-3 rounded-lg border text-center cursor-pointer transition-all
                      hover:shadow-md hover:scale-105
                      ${onMoodSelect ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''}
                    `}
                    style={{ borderColor: mood.colorHex || '#E5E7EB' }}
                    onClick={() => onMoodSelect?.(mood)}
                  >
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                    <div className="text-sm font-medium">{mood.name}</div>
                    {mood.subcategory && (
                      <div className="text-xs text-muted-foreground">{mood.subcategory}</div>
                    )}
                    <div className="flex justify-center mt-1">
                      <Badge variant="outline" className="text-xs">
                        {mood.moodScore}/5
                      </Badge>
                    </div>

                    {showAdminControls && (
                      <div className="flex justify-center space-x-1 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(mood);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(mood.id);
                          }}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {Object.keys(filteredCategories).length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No mood indicators found for the selected category.
          </div>
        )}
      </div>
    </div>
  );
}