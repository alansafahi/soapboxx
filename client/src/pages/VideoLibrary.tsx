import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { 
  Play, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Heart, 
  MessageCircle, 
  Calendar,
  User,
  Clock,
  Upload,
  Edit3,
  Trash2,
  BarChart3
} from "lucide-react";

interface Video {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  category: string;
  tags: string[];
  bibleReferences: string[];
  speaker: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  phase: string;
  generationType: string;
  isPublic: boolean;
  publishedAt: string;
  createdAt: string;
  uploadedBy: string;
}

export default function VideoLibrary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Fetch videos
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['/api/videos', { category: selectedCategory !== 'all' ? selectedCategory : undefined }],
  });

  // Video upload mutation
  const uploadVideoMutation = useMutation({
    mutationFn: async (videoData: any) => {
      return await apiRequest('/api/videos', {
        method: 'POST',
        body: JSON.stringify(videoData),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      setIsUploadDialogOpen(false);
      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
    },
  });

  // Video like mutation
  const likeVideoMutation = useMutation({
    mutationFn: async (videoId: number) => {
      return await apiRequest(`/api/videos/${videoId}/like`, {
        method: 'POST',
        body: JSON.stringify({ reactionType: 'like' }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
    },
  });

  // Record video view
  const recordViewMutation = useMutation({
    mutationFn: async ({ videoId, watchDuration, completionPercentage }: {
      videoId: number;
      watchDuration: number;
      completionPercentage: number;
    }) => {
      return await apiRequest(`/api/videos/${videoId}/view`, {
        method: 'POST',
        body: JSON.stringify({
          watchDuration,
          completionPercentage,
          deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
          quality: '720p',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  const filteredVideos = videos.filter((video: Video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.speaker?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleVideoPlay = (video: Video) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
    // Record view when video starts playing
    recordViewMutation.mutate({
      videoId: video.id,
      watchDuration: 0,
      completionPercentage: 0,
    });
  };

  const handleUploadSubmit = (formData: FormData) => {
    const videoData = {
      title: formData.get('title'),
      description: formData.get('description'),
      videoUrl: formData.get('videoUrl'),
      thumbnailUrl: formData.get('thumbnailUrl'),
      duration: parseInt(formData.get('duration') as string) || 0,
      category: formData.get('category'),
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()),
      bibleReferences: (formData.get('bibleReferences') as string).split(',').map(ref => ref.trim()),
      speaker: formData.get('speaker'),
      isPublic: formData.get('isPublic') === 'on',
      churchId: 1, // Default church for demo
    };

    uploadVideoMutation.mutate(videoData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Video Library
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Spiritual content and devotionals for your faith journey
            </p>
          </div>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload New Video</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUploadSubmit(formData);
              }}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input name="title" required placeholder="Enter video title" />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea name="description" placeholder="Describe your video content" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="videoUrl">Video URL</Label>
                      <Input name="videoUrl" required placeholder="https://..." />
                    </div>
                    <div>
                      <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                      <Input name="thumbnailUrl" placeholder="https://..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="devotional">Devotional</SelectItem>
                          <SelectItem value="sermon">Sermon</SelectItem>
                          <SelectItem value="testimony">Testimony</SelectItem>
                          <SelectItem value="study">Bible Study</SelectItem>
                          <SelectItem value="prayer">Prayer</SelectItem>
                          <SelectItem value="worship">Worship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (seconds)</Label>
                      <Input name="duration" type="number" placeholder="300" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="speaker">Speaker</Label>
                    <Input name="speaker" placeholder="Pastor or speaker name" />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input name="tags" placeholder="faith, hope, love" />
                  </div>
                  <div>
                    <Label htmlFor="bibleReferences">Bible References (comma-separated)</Label>
                    <Input name="bibleReferences" placeholder="John 3:16, Romans 8:28" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch name="isPublic" />
                    <Label htmlFor="isPublic">Make video public</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={uploadVideoMutation.isPending}>
                      {uploadVideoMutation.isPending ? 'Uploading...' : 'Upload Video'}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search videos, speakers, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="devotional">Devotional</SelectItem>
              <SelectItem value="sermon">Sermon</SelectItem>
              <SelectItem value="testimony">Testimony</SelectItem>
              <SelectItem value="study">Bible Study</SelectItem>
              <SelectItem value="prayer">Prayer</SelectItem>
              <SelectItem value="worship">Worship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Video Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video: Video) => (
              <Card key={video.id} className="group hover:shadow-lg transition-shadow duration-200">
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900">
                      <Play className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
                    <Button
                      onClick={() => handleVideoPlay(video)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 text-gray-900 hover:bg-opacity-100"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Play
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {video.duration && formatDuration(video.duration)}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge className="text-xs capitalize">
                      {video.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  {video.speaker && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <User className="h-3 w-3 mr-1" />
                      {video.speaker}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {video.viewCount}
                      </div>
                      <button
                        onClick={() => likeVideoMutation.mutate(video.id)}
                        className="flex items-center hover:text-red-500 transition-colors"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        {video.likeCount}
                      </button>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(video.publishedAt)}
                    </div>
                  </div>
                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {video.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredVideos.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Play className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No videos found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Video Player Dialog */}
        <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{selectedVideo?.title}</DialogTitle>
            </DialogHeader>
            {selectedVideo && (
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={selectedVideo.videoUrl}
                    controls
                    className="w-full h-full"
                    onTimeUpdate={(e) => {
                      const video = e.currentTarget;
                      const completionPercentage = (video.currentTime / video.duration) * 100;
                      // Record progress periodically
                      if (Math.floor(video.currentTime) % 30 === 0) {
                        recordViewMutation.mutate({
                          videoId: selectedVideo.id,
                          watchDuration: Math.floor(video.currentTime),
                          completionPercentage: Math.floor(completionPercentage),
                        });
                      }
                    }}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge className="capitalize">{selectedVideo.category}</Badge>
                      {selectedVideo.speaker && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-1" />
                          {selectedVideo.speaker}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="h-4 w-4 mr-1" />
                        {selectedVideo.viewCount}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => likeVideoMutation.mutate(selectedVideo.id)}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {selectedVideo.likeCount}
                      </Button>
                    </div>
                  </div>
                  
                  {selectedVideo.description && (
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedVideo.description}
                    </p>
                  )}
                  
                  {selectedVideo.bibleReferences && selectedVideo.bibleReferences.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Bible References:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedVideo.bibleReferences.map((ref, index) => (
                          <Badge key={index} variant="outline">
                            {ref}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}