import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Filter, Search, Upload, Grid, List, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface GalleryImage {
  id: number;
  title: string;
  description?: string;
  url: string;
  collection: string;
  tags: string[];
  uploadedBy: string;
  uploaderName: string;
  uploaderAvatar?: string;
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
  isLiked: boolean;
  isSaved: boolean;
  churchId?: number;
}

const categories = [
  { value: 'all', label: 'All Images', icon: '🖼️' },
  { value: 'worship', label: 'Moments of Worship', icon: '🙏' },
  { value: 'testimonies', label: 'User Testimonies', icon: '✨' },
  { value: 'events', label: 'Events & Gatherings', icon: '📅' },
  { value: 'sacred-spaces', label: 'Sacred Spaces', icon: '⛪' },
  { value: 'verses', label: 'Visual Verse Cards', icon: '📖' },
  { value: 'art', label: 'Art & Creativity', icon: '🎨' },
  { value: 'daily-inspiration', label: 'Daily Inspiration', icon: '🌅' },
];

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Liked' },
  { value: 'staff-picks', label: 'Staff Picks' },
];

export default function ImageGallery() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    image: null as File | null,
    title: '',
    description: '',
    category: '',
    tags: '',
    visibility: 'church'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['/api/gallery/images', selectedCategory, sortBy, searchQuery],
    queryFn: () => apiRequest('GET', `/api/gallery/images?collection=${selectedCategory}&limit=20&offset=0`),
  });

  const likeMutation = useMutation({
    mutationFn: (imageId: number) => apiRequest('POST', `/api/gallery/images/${imageId}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery/images'] });
      toast({ title: 'Image liked!' });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (imageId: number) => apiRequest('POST', `/api/gallery/images/${imageId}/save`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery/images'] });
      toast({ title: 'Image saved to favorites!' });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!uploadForm.image) {
        throw new Error('No image selected');
      }
      
      const data = new FormData();
      data.append('image', uploadForm.image);
      data.append('title', uploadForm.title);
      data.append('description', uploadForm.description);
      data.append('collection', uploadForm.category);
      data.append('tags', JSON.stringify(uploadForm.tags.split(',').map(t => t.trim()).filter(t => t)));
      
      return apiRequest('POST', '/api/gallery/upload', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery/images'] });
      setShowUploadDialog(false);
      setUploadForm({
        image: null,
        title: '',
        description: '',
        category: '',
        tags: '',
        visibility: 'church'
      });
      toast({ title: 'Image uploaded successfully!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive'
      });
    }
  });

  const handleLike = (imageId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    likeMutation.mutate(imageId);
  };

  const handleSave = (imageId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    saveMutation.mutate(imageId);
  };

  const handleShare = (image: GalleryImage, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: image.title,
        text: image.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard!' });
    }
  };

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadForm.image || !uploadForm.title || !uploadForm.category) {
      toast({
        title: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-4">
            <ImageIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Image Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A sacred space for visual inspiration, community moments, and spiritual storytelling
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="mb-8 space-y-4">
          {/* Search and Upload */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search images, tags, verses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Share Image
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Share an Image</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="image">Image File</Label>
                    <Input 
                      id="image" 
                      type="file" 
                      accept="image/*" 
                      required 
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setUploadForm(prev => ({ ...prev, image: file }));
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Give your image a title..." 
                      required 
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Share the story behind this image..." 
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={uploadForm.category} onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.icon} {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input 
                      id="tags" 
                      placeholder="faith, worship, community..." 
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select value={uploadForm.visibility} onValueChange={(value) => setUploadForm(prev => ({ ...prev, visibility: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="church">Church Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={uploadMutation.isPending}>
                    {uploadMutation.isPending ? 'Uploading...' : 'Share Image'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedCategory === category.value
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.icon} {category.label}
              </Badge>
            ))}
          </div>

          {/* Sort and View Options */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'masonry' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('masonry')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Image Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No images found
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-4">
              Be the first to share an inspiring image with the community
            </p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Share Your First Image
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === 'masonry'
              ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6'
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          }>
            {images.map((image: GalleryImage) => (
              <Card
                key={image.id}
                className="break-inside-avoid mb-6 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{ height: viewMode === 'grid' ? '200px' : 'auto' }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 text-gray-900 hover:bg-white"
                        onClick={(e) => handleLike(image.id, e)}
                      >
                        <Heart className={`w-4 h-4 ${image.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 text-gray-900 hover:bg-white"
                        onClick={(e) => handleShare(image, e)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {image.title}
                  </h3>
                  {image.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {image.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {image.uploadedBy?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {image.uploadedBy || 'Anonymous'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {image.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {image.commentsCount || 0}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {categories.find(c => c.value === image.collection)?.icon} {image.collection}
                    </Badge>
                  </div>
                  {image.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {image.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {image.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{image.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Image Detail Modal */}
        {selectedImage && (
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="relative">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedImage.title}
                    </h2>
                    {selectedImage.description && (
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedImage.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedImage.uploaderAvatar} />
                      <AvatarFallback>
                        {selectedImage.uploaderName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedImage.uploaderName || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedImage.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      variant={selectedImage.isLiked ? "default" : "outline"}
                      onClick={() => handleLike(selectedImage.id)}
                      className="flex-1"
                    >
                      <Heart className={`w-4 h-4 mr-2 ${selectedImage.isLiked ? 'fill-current' : ''}`} />
                      {selectedImage.likesCount || 0} Likes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleShare(selectedImage)}
                      className="flex-1"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  {selectedImage.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedImage.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}