import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  User,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ContentReport {
  id: number;
  contentType: 'discussion' | 'prayer_request' | 'soap_entry';
  contentId: number;
  reason: string;
  description?: string;
  originalContent?: string;
  contentMetadata?: any;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reporterId: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  contentDetails?: any;
}

export function ModerationDashboard() {
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch content reports
  const { data: reports, isLoading } = useQuery({
    queryKey: ['/api/moderation/reports', selectedStatus],
    queryFn: () => apiRequest('GET', `/api/moderation/reports?status=${selectedStatus}`)
  });

  // Update report status mutation
  const updateReportMutation = useMutation({
    mutationFn: ({ reportId, status, reviewNotes, actionTaken }: {
      reportId: number;
      status: string;
      reviewNotes?: string;
      actionTaken?: string;
    }) => 
      apiRequest('PUT', `/api/moderation/reports/${reportId}`, { status, reviewNotes, actionTaken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/moderation/reports'] });
      toast({
        title: 'Report updated successfully',
        description: 'The content report has been reviewed and updated.',
      });
      setReviewDialogOpen(false);
      setSelectedReport(null);
      setReviewNotes('');
      setActionTaken('');
    },
    onError: () => {
      toast({
        title: 'Failed to update report',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    }
  });

  // Hide content mutation
  const hideContentMutation = useMutation({
    mutationFn: ({ contentType, contentId, reason }: {
      contentType: string;
      contentId: number;
      reason: string;
    }) => 
      apiRequest('POST', `/api/moderation/content/${contentType}/${contentId}/hide`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/moderation/reports'] });
      toast({
        title: 'Content hidden successfully',
        description: 'The content has been hidden from public view.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to hide content',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    }
  });

  // Edit content mutation
  const editContentMutation = useMutation({
    mutationFn: ({ contentType, contentId, content, title }: {
      contentType: string;
      contentId: number;
      content: string;
      title?: string;
    }) => 
      apiRequest('PUT', `/api/moderation/edit-content`, { contentType, contentId, content, title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/moderation/reports'] });
      toast({
        title: 'Content edited successfully',
        description: 'The content has been updated and the original version is preserved for audit.',
      });
      setEditDialogOpen(false);
      setEditedContent('');
      setEditedTitle('');
    },
    onError: () => {
      toast({
        title: 'Failed to edit content',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    }
  });

  const handleReviewReport = (report: ContentReport) => {
    setSelectedReport(report);
    setReviewDialogOpen(true);
  };

  const handleEditContent = (report: ContentReport) => {
    setSelectedReport(report);
    setEditedContent(report.originalContent || '');
    setEditedTitle(report.contentMetadata?.title || '');
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedReport) return;
    
    editContentMutation.mutate({
      contentType: selectedReport.contentType,
      contentId: selectedReport.contentId,
      content: editedContent,
      title: editedTitle
    });
  };

  const handleSubmitReview = () => {
    if (!selectedReport) return;

    updateReportMutation.mutate({
      reportId: selectedReport.id,
      status: actionTaken === 'hide_content' ? 'resolved' : 'reviewed',
      reviewNotes,
      actionTaken,
    });

    // If hiding content, also execute the hide action
    if (actionTaken === 'hide_content') {
      hideContentMutation.mutate({
        contentType: selectedReport.contentType,
        contentId: selectedReport.contentId,
        reason: reviewNotes || 'Content hidden by moderator',
      });
    }
  };

  const handleQuickAction = (report: ContentReport, action: string) => {
    updateReportMutation.mutate({
      reportId: report.id,
      status: action === 'dismiss' ? 'dismissed' : 'resolved',
      actionTaken: action,
    });

    if (action === 'hide_content') {
      hideContentMutation.mutate({
        contentType: report.contentType,
        contentId: report.contentId,
        reason: 'Content hidden by moderator',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'inappropriate': return <AlertTriangle className="h-4 w-4" />;
      case 'harassment': return <MessageSquare className="h-4 w-4" />;
      case 'spam': return <MoreHorizontal className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getContentPreview = (report: ContentReport) => {
    const details = report.contentDetails;
    if (!details) return 'Content no longer available';

    switch (report.contentType) {
      case 'discussion':
        return details.content?.substring(0, 100) + '...';
      case 'prayer_request':
        return details.requestText?.substring(0, 100) + '...';
      case 'soap_entry':
        return details.observation?.substring(0, 100) + '...';
      default:
        return 'Content preview unavailable';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Content Moderation</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Review and manage content reports from your community
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Moderator Dashboard
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Reports</CardTitle>
          <CardDescription>
            Review reports submitted by community members and take appropriate action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedStatus} className="mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Loading reports...</div>
                </div>
              ) : reports?.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No {selectedStatus} reports
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    All clear! No content reports require attention at this time.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports?.map((report: ContentReport) => (
                    <Card key={report.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                              {getReasonIcon(report.reason)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                  {report.reason.replace('_', ' ').toUpperCase()} - {report.contentType.replace('_', ' ')}
                                </h4>
                                <Badge className={getPriorityColor(report.priority)}>
                                  {report.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {getContentPreview(report)}
                              </p>
                              {report.description && (
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                  <strong>Report details:</strong> {report.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  Reporter ID: {report.reporterId}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(report.createdAt), 'MMM d, yyyy HH:mm')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedStatus === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuickAction(report, 'dismiss')}
                                  disabled={updateReportMutation.isPending}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Dismiss
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleQuickAction(report, 'hide_content')}
                                  disabled={updateReportMutation.isPending || hideContentMutation.isPending}
                                >
                                  <EyeOff className="h-4 w-4 mr-1" />
                                  Hide Content
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReviewReport(report)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditContent(report)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Edit Content
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Content Report</DialogTitle>
            <DialogDescription>
              Review the reported content and take appropriate moderation action
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Report Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Content Type:</span>
                    <span className="ml-2 font-medium">{selectedReport.contentType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Reason:</span>
                    <span className="ml-2 font-medium">{selectedReport.reason}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                    <Badge className={getPriorityColor(selectedReport.priority)} size="sm">
                      {selectedReport.priority}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Reported:</span>
                    <span className="ml-2">{format(new Date(selectedReport.createdAt), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                </div>
                {selectedReport.description && (
                  <div className="mt-3">
                    <span className="text-gray-600 dark:text-gray-400">Description:</span>
                    <p className="mt-1">{selectedReport.description}</p>
                  </div>
                )}
              </div>

              {/* Original Content Display */}
              {selectedReport.originalContent && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-red-800 dark:text-red-200">Original Content (Preserved for Review)</h4>
                  <div className="text-sm bg-white dark:bg-gray-900 p-3 rounded border max-h-48 overflow-y-auto">
                    {selectedReport.contentMetadata?.title && (
                      <div className="mb-2">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Title:</span> {selectedReport.contentMetadata.title}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                      {selectedReport.originalContent}
                    </div>
                  </div>
                  {selectedReport.contentMetadata && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Author ID:</span> {selectedReport.contentMetadata.authorId} • 
                      <span className="font-medium ml-2">Created:</span> {selectedReport.contentMetadata.createdAt ? format(new Date(selectedReport.contentMetadata.createdAt), 'MMM d, yyyy') : 'Unknown'}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="action">Action to Take</Label>
                <Select value={actionTaken} onValueChange={setActionTaken}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an action..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_action">No Action Required</SelectItem>
                    <SelectItem value="warning_sent">Warning Sent to User</SelectItem>
                    <SelectItem value="hide_content">Hide Content</SelectItem>
                    <SelectItem value="content_edited">Content Edited</SelectItem>
                    <SelectItem value="escalated">Escalated to Higher Authority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewNotes">Review Notes</Label>
                <Textarea
                  id="reviewNotes"
                  placeholder="Document your review decision and any actions taken..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setReviewDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={!actionTaken || updateReportMutation.isPending}
                  className="flex-1"
                >
                  {updateReportMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Content Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Edit the reported content. The original version will be preserved for audit purposes.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-yellow-800 dark:text-yellow-200">Notice</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  The original content will be preserved in the database for audit purposes. 
                  Only edit content to remove inappropriate material or fix violations.
                </p>
              </div>

              {selectedReport.contentMetadata?.title && (
                <div className="space-y-2">
                  <Label htmlFor="editTitle">Title</Label>
                  <input
                    id="editTitle"
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Enter title..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="editContent">Content</Label>
                <Textarea
                  id="editContent"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={8}
                  className="w-full"
                  placeholder="Enter content..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={!editedContent.trim() || editContentMutation.isPending}
                  className="flex-1"
                >
                  {editContentMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}