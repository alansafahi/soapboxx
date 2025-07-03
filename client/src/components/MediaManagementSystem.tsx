import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Upload, 
  Image, 
  Video, 
  Music, 
  FileText, 
  Folder, 
  Download, 
  Eye, 
  Edit2, 
  Trash2, 
  MoreHorizontal,
  Search,
  Filter,
  Grid,
  List,
  Play,
  Pause,
  Check,
  X,
  FolderPlus,
  Share2,
  Copy,
  Star,
  Archive,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

interface MediaFile {
  id: number;
  churchId?: number;
  uploadedBy: string;
  fileName: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  publicUrl?: string;
  thumbnailUrl?: string;
  category?: string;
  title?: string;
  description?: string;
  tags: string[];
  isPublic: boolean;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  downloadCount: number;
  viewCount: number;
  duration?: number;
  dimensions?: { width: number; height: number };
  metadata?: Record<string, unknown>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface MediaCollection {
  id: number;
  churchId?: number;
  createdBy: string;
  name: string;
  description?: string;
  coverImageId?: number;
  isPublic: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

const MEDIA_CATEGORIES = [
  "sermon",
  "worship",
  "event",
  "announcement",
  "ministry",
  "youth",
  "children",
  "music",
  "teaching",
  "testimonial",
  "other"
];

const FILE_TYPE_ICONS = {
  image: Image,
  video: Video,
  audio: Music,
  document: FileText,
  other: FileText
};

export default function MediaManagementSystem() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFileType, setSelectedFileType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles2, setSelectedFiles2] = useState<number[]>([]);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);

  // Fetch media files
  const { data: mediaFiles = [], isLoading: loadingFiles } = useQuery({
    queryKey: ["/api/media/files"],
  });

  // Fetch media collections
  const { data: collections = [], isLoading: loadingCollections } = useQuery({
    queryKey: ["/api/media/collections"],
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload Successful",
        description: "Media files have been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/media/files"] });
      setSelectedFiles([]);
      setIsUploading(false);
      setUploadProgress(0);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  // Update file mutation
  const updateFileMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<MediaFile> }) => {
      const response = await apiRequest("PATCH", `/api/media/files/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "File Updated",
        description: "Media file has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/media/files"] });
      setEditingFile(null);
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/media/files/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "File Deleted",
        description: "Media file has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/media/files"] });
    },
  });

  // Create collection mutation
  const createCollectionMutation = useMutation({
    mutationFn: async (data: Omit<MediaCollection, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiRequest("POST", "/api/media/collections", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Collection Created",
        description: "Media collection has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/media/collections"] });
      setShowCreateCollection(false);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
      formData.append(`files`, file);
    });

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    uploadMutation.mutate(formData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredFiles = Array.isArray(mediaFiles) ? mediaFiles.filter((file: MediaFile) => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    const matchesFileType = selectedFileType === 'all' || file.fileType === selectedFileType;
    
    return matchesSearch && matchesCategory && matchesFileType;
  }) : [];

  const getFileTypeIcon = (fileType: string) => {
    const IconComponent = FILE_TYPE_ICONS[fileType as keyof typeof FILE_TYPE_ICONS] || FileText;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Media Management</h2>
          <p className="text-muted-foreground">
            Upload, organize, and manage your church's media files
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCreateCollection(true)}
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            New Collection
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>
            Select multiple files to upload. Supported formats: Images, Videos, Audio, Documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Selected Files:</h4>
                <div className="grid gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {getFileTypeIcon(file.type.split('/')[0])}
                        <span className="text-sm">{file.name}</span>
                        <Badge variant="secondary">{formatFileSize(file.size)}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
                  </div>
                )}
                
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {MEDIA_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedFileType} onValueChange={setSelectedFileType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="File Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Files */}
      <Tabs defaultValue="files" className="w-full">
        <TabsList>
          <TabsTrigger value="files">Files ({filteredFiles.length})</TabsTrigger>
          <TabsTrigger value="collections">Collections ({collections.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          {loadingFiles ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Upload className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No media files found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Upload your first media files to get started
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-2"
            }>
              {filteredFiles.map((file: MediaFile) => (
                <Card key={file.id} className={viewMode === 'list' ? "p-4" : ""}>
                  {viewMode === 'grid' ? (
                    <div className="relative">
                      {file.thumbnailUrl ? (
                        <img 
                          src={file.thumbnailUrl} 
                          alt={file.originalName}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-muted rounded-t-lg flex items-center justify-center">
                          {getFileTypeIcon(file.fileType)}
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setEditingFile(file)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteFileMutation.mutate(file.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-medium truncate">{file.title || file.originalName}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatFileSize(file.fileSize)}
                          {file.duration && ` • ${formatDuration(file.duration)}`}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          {file.category && (
                            <Badge variant="secondary" className="text-xs">
                              {file.category}
                            </Badge>
                          )}
                          <Badge variant={file.isApproved ? "default" : "destructive"} className="text-xs">
                            {file.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{file.downloadCount} downloads</span>
                          <span>{file.viewCount} views</span>
                        </div>
                      </CardContent>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        {getFileTypeIcon(file.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{file.title || file.originalName}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.fileSize)}</span>
                          <span>{format(new Date(file.createdAt), 'MMM d, yyyy')}</span>
                          <span>{file.downloadCount} downloads</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.category && (
                          <Badge variant="secondary">{file.category}</Badge>
                        )}
                        <Badge variant={file.isApproved ? "default" : "destructive"}>
                          {file.isApproved ? "Approved" : "Pending"}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setEditingFile(file)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteFileMutation.mutate(file.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(collections) && collections.map((collection: MediaCollection) => (
              <Card key={collection.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Folder className="h-5 w-5" />
                    <h4 className="font-medium">{collection.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {collection.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {collection.itemCount} items
                    </span>
                    <Badge variant={collection.isPublic ? "default" : "secondary"}>
                      {collection.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Image className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Total Files</p>
                    <p className="text-2xl font-bold">{filteredFiles.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Total Downloads</p>
                    <p className="text-2xl font-bold">
                      {filteredFiles.reduce((sum, file) => sum + file.downloadCount, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Total Views</p>
                    <p className="text-2xl font-bold">
                      {filteredFiles.reduce((sum, file) => sum + file.viewCount, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Collections</p>
                    <p className="text-2xl font-bold">{collections.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit File Dialog */}
      {editingFile && (
        <Dialog open={!!editingFile} onOpenChange={() => setEditingFile(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Media File</DialogTitle>
              <DialogDescription>
                Update the details for this media file.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title"
                  defaultValue={editingFile.title || ''}
                  placeholder="Enter title..."
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  defaultValue={editingFile.description || ''}
                  placeholder="Enter description..."
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={editingFile.category || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDIA_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingFile(null)}>
                  Cancel
                </Button>
                <Button>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Collection Dialog */}
      <Dialog open={showCreateCollection} onOpenChange={setShowCreateCollection}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>
              Create a new media collection to organize your files.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="collectionName">Collection Name</Label>
              <Input 
                id="collectionName"
                placeholder="Enter collection name..."
              />
            </div>
            <div>
              <Label htmlFor="collectionDescription">Description</Label>
              <Textarea 
                id="collectionDescription"
                placeholder="Enter description..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateCollection(false)}>
                Cancel
              </Button>
              <Button>
                Create Collection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}