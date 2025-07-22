import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Image as ImageIcon, Expand, Calendar, User, MessageSquare } from 'lucide-react';

interface ImageData {
  id: string;
  source: 'discussions' | 'prayer_requests' | 'soap_entries';
  title: string;
  content: string;
  imageData: string;
  author: string;
  createdAt: string;
  metadata?: any;
}

const ImageGallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  const { data: images, isLoading, error } = useQuery({
    queryKey: ['/api/images/gallery'],
    queryFn: async () => {
      const response = await fetch('/api/images/gallery');
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      return response.json() as ImageData[];
    }
  });

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'discussions':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'prayer_requests':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'soap_entries':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'discussions':
        return <MessageSquare className="w-3 h-3" />;
      case 'prayer_requests':
        return <span className="text-xs">🙏</span>;
      case 'soap_entries':
        return <span className="text-xs">📖</span>;
      default:
        return <ImageIcon className="w-3 h-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading image gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">Failed to load image gallery</p>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">No images found in database</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Image Gallery</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {images.length} image{images.length !== 1 ? 's' : ''} found in database
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <MessageSquare className="w-3 h-3 mr-1" />
            Discussions
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            🙏 Prayers
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            📖 S.O.A.P.
          </Badge>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image) => (
          <Card key={`${image.source}-${image.id}`} className="group hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-0">
              {/* Image Thumbnail */}
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                <img
                  src={image.imageData}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onClick={() => setSelectedImage(image)}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setSelectedImage(image)}
                  >
                    <Expand className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>

                {/* Source Badge */}
                <div className="absolute top-2 left-2">
                  <Badge className={`text-xs ${getSourceBadgeColor(image.source)}`}>
                    {getSourceIcon(image.source)}
                    <span className="ml-1 capitalize">{image.source.replace('_', ' ')}</span>
                  </Badge>
                </div>
              </div>

              {/* Image Info */}
              <div className="p-3">
                <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate mb-1">
                  {image.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <User className="w-3 h-3" />
                  <span className="truncate">{image.author}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image Detail Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getSourceIcon(selectedImage.source)}
                  {selectedImage.title}
                  <Badge className={`ml-2 ${getSourceBadgeColor(selectedImage.source)}`}>
                    {selectedImage.source.replace('_', ' ')}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Full Size Image */}
                <div className="flex justify-center">
                  <img
                    src={selectedImage.imageData}
                    alt={selectedImage.title}
                    className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>

                {/* Content Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Content</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-h-32 overflow-y-auto">
                      {selectedImage.content}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Author:</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{selectedImage.author}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Created:</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        {new Date(selectedImage.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Source:</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2 capitalize">
                        {selectedImage.source.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">ID:</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{selectedImage.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageGallery;