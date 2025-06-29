import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Upload, Play, Clock, User, Calendar, Filter, Search, Grid, List, Bell, Lightbulb, Heart, BookOpen, Users, Flame, GraduationCap } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VideoContent {
  id: number;
  title: string;
  description: string;
  videoUrl?: string;
  url?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  duration: string | number;
  category: string;
  uploadedBy: string;
  uploadedAt?: string;
  createdAt?: string;
  views?: number;
  viewCount?: number;
  tags: string[] | string;
  speaker?: string;
}

export default function VideoLibrary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    file: null as File | null
  });

  // Fetch videos from API
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['/api/videos'],
  });

  // Upload video mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video uploaded successfully!",
      });
      setIsUploadOpen(false);
      setUploadForm({
        title: '',
        description: '',
        category: '',
        tags: '',
        file: null
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpload = () => {
    if (!uploadForm.title || !uploadForm.description || !uploadForm.category || !uploadForm.file) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a video file.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description);
    formData.append('category', uploadForm.category);
    formData.append('tags', uploadForm.tags);
    formData.append('video', uploadForm.file);

    uploadMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      const maxSize = 500 * 1024 * 1024; // 500MB

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Please select a valid video file (MP4, WebM, or OGG).",
          variant: "destructive",
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: "Error",
          description: "File size must be less than 500MB.",
          variant: "destructive",
        });
        return;
      }

      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'sermons', label: 'Sermons' },
    { value: 'devotionals', label: 'Devotionals' },
    { value: 'bible-studies', label: 'Bible Studies' },
    { value: 'worship', label: 'Worship' },
    { value: 'testimonies', label: 'Testimonies' },
    { value: 'youth', label: 'Youth' },
    { value: 'children', label: 'Children' },
    { value: 'prayer', label: 'Prayer' },
    { value: 'conference', label: 'Conference' },
  ];

  // Map database fields to frontend interface and filter videos
  const mappedVideos = videos.map((video: any) => ({
    ...video,
    url: video.videoUrl || video.url,
    thumbnail: video.thumbnailUrl || video.thumbnail,
    uploadedAt: video.createdAt || video.uploadedAt,
    views: video.viewCount || video.views || 0,
    tags: typeof video.tags === 'string' ? 
      (video.tags.startsWith('{') ? 
        JSON.parse(video.tags.replace(/"/g, '"')) : 
        video.tags.split(',').map((tag: string) => tag.trim())) 
      : video.tags || [],
    duration: typeof video.duration === 'number' ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : video.duration
  }));

  const filteredVideos = mappedVideos.filter((video: VideoContent) => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show enhanced coming soon state if no videos available
  if (!videos || videos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
        {/* Background Hero Image/Video Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900"></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          {/* Enhanced Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Video className="w-8 h-8 text-purple-400" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Video Library
                </h1>
              </div>
              <p className="text-lg text-gray-300 max-w-2xl">
                Spiritual videos, devotionals, and community content to deepen your journey with God.
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Upload Video - Admin/Pastor Only */}
              {user && ['admin', 'church-admin', 'pastor', 'lead-pastor'].some(role => 
                (user as any)?.role?.includes?.(role) || (user as any)?.roles?.includes?.(role)
              ) && (
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Video
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload Video</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Share spiritual content with your community
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={uploadForm.title}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Enter video title"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={uploadForm.description}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Describe your video content"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            {categories.slice(1).map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                          id="tags"
                          value={uploadForm.tags}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Enter tags separated by commas"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="video">Video File *</Label>
                        <Input
                          id="video"
                          type="file"
                          accept="video/mp4,video/webm,video/ogg"
                          onChange={handleFileChange}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        <p className="text-sm text-gray-400 mt-1">
                          Supported formats: MP4, WebM, OGG. Max size: 500MB.
                        </p>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => setIsUploadOpen(false)}
                          variant="outline"
                          className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpload}
                          disabled={uploadMutation.isPending}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          {uploadMutation.isPending ? 'Uploading...' : 'Upload Video'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {/* Suggest Topic - All Users */}
              <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
                <Lightbulb className="w-4 h-4 mr-2" />
                Suggest a Topic
              </Button>
              
              {/* Notify When Ready */}
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <Bell className="w-4 h-4 mr-2" />
                Notify Me
              </Button>
            </div>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"></div>
              <div className="relative bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-3xl p-12">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    "The Word, in motion."
                  </span>
                  <br />
                  <span className="text-white">Your faith journey, visualized.</span>
                </h2>
              </div>
            </div>
          </div>

          {/* Coming Soon Block */}
          <div className="text-center mb-16">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl flex items-center justify-center shadow-2xl">
              <Video className="w-16 h-16 text-white" />
            </div>
            
            <h3 className="text-3xl font-bold mb-6">Coming Soon: A spiritual video library for the modern believer.</h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              We're curating sermons, daily devotionals, short teachings, and visual Bible guides—crafted by pastors and creators you trust.
            </p>
            
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold text-lg shadow-lg">
              ✨ Be first to watch. Be first to share.
            </div>
            
            {/* Progress Bar with Milestones */}
            <div className="w-full max-w-2xl mx-auto mt-12">
              <div className="flex justify-between text-sm text-gray-400 mb-3">
                <span>Planning</span>
                <span>Development</span>
                <span>Testing</span>
                <span>Launch</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full relative" style={{ width: '75%' }}>
                  <div className="absolute right-0 top-0 w-4 h-4 bg-purple-400 rounded-full -mt-0.5 shadow-lg"></div>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-3">Development Progress: 75% Complete</p>
            </div>
          </div>

          {/* Preview Categories */}
          <div className="mb-16">
            <h4 className="text-2xl font-bold text-center mb-8">What to Expect</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Flame, title: "Quick Word of Encouragement", desc: "2-5 min daily motivation", color: "from-orange-500 to-red-500" },
                { icon: BookOpen, title: "Bible in a Day Segments", desc: "Guided scripture reading", color: "from-blue-500 to-purple-500" },
                { icon: Heart, title: "Guided Prayer Meditations", desc: "Peaceful spiritual practice", color: "from-pink-500 to-purple-500" },
                { icon: GraduationCap, title: "Church Leader Training", desc: "Leadership development", color: "from-green-500 to-blue-500" }
              ].map((category, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 transition-all duration-300 backdrop-blur">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center`}>
                      <category.icon className="w-8 h-8 text-white" />
                    </div>
                    <h5 className="font-semibold text-white mb-2">{category.title}</h5>
                    <p className="text-gray-400 text-sm">{category.desc}</p>
                    <div className="mt-4 w-full bg-gray-700 rounded-full h-1">
                      <div className="bg-gray-500 h-1 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Feature Tags */}
          <div className="text-center">
            <h4 className="text-xl font-semibold mb-6">Browse by Interest</h4>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { tag: "#Devotional", color: "bg-purple-600/20 text-purple-300 border-purple-500/30" },
                { tag: "#Youth", color: "bg-blue-600/20 text-blue-300 border-blue-500/30" },
                { tag: "#Leadership", color: "bg-green-600/20 text-green-300 border-green-500/30" },
                { tag: "#Healing", color: "bg-pink-600/20 text-pink-300 border-pink-500/30" },
                { tag: "#AnsweredPrayer", color: "bg-yellow-600/20 text-yellow-300 border-yellow-500/30" },
                { tag: "#Worship", color: "bg-indigo-600/20 text-indigo-300 border-indigo-500/30" }
              ].map((item, index) => (
                <Badge key={index} variant="outline" className={`${item.color} px-4 py-2 text-sm cursor-pointer hover:scale-105 transition-transform`}>
                  {item.tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main video library interface (when videos are available)
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Video Library</h1>
            <p className="text-gray-300">Spiritual content and devotionals for your faith journey</p>
          </div>
          
          {/* Upload button for admin/pastor users */}
          {user && ['admin', 'church-admin', 'pastor', 'lead-pastor'].some(role => 
            (user as any)?.role?.includes?.(role) || (user as any)?.roles?.includes?.(role)
          ) && (
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 text-white border-gray-700">
                {/* Upload dialog content same as above */}
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex bg-gray-800 rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="text-white"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="text-white"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Video Grid */}
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredVideos.map((video: VideoContent) => (
            <Card key={video.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
              <div className="relative">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                  <Play className="w-12 h-12 text-white" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-white mb-2 line-clamp-2">{video.title}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{video.description}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-purple-600 text-white">
                    {video.category}
                  </Badge>
                  {video.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {video.speaker || 'AI Generated'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {video.uploadedAt ? new Date(video.uploadedAt).toLocaleDateString() : 'Recently'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{video.views} views</span>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Play className="w-3 h-3 mr-1" />
                    Watch
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVideos.length === 0 && videos.length > 0 && (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No videos found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}