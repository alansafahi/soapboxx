import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { 
  FileText, 
  Search, 
  Plus, 
  Star, 
  Grid3X3, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Clock,
  Lightbulb
} from 'lucide-react';
import { CommunicationState } from './UnifiedCommunicationHub';
import { useToast } from '../../hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';

interface TemplateLibraryProps {
  state: CommunicationState;
  updateState: (updates: Partial<CommunicationState>) => void;
  templates: any;
  isLoading: boolean;
  onApplyTemplate: (template: any) => void;
}

export default function TemplateLibrary({ 
  state, 
  updateState, 
  templates, 
  isLoading, 
  onApplyTemplate 
}: TemplateLibraryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'announcements'
  });

  const { templates: templateState, message } = state;

  // Smart template suggestions based on message content and type
  const getSmartSuggestions = () => {
    if (!templates?.length) return [];
    
    const allTemplates = [
      ...(templates.announcements || []),
      ...(templates.emergencies || []),
      ...(templates.prayers || []),
      ...(templates.custom || [])
    ];

    // Filter by message type first
    let suggestions = allTemplates.filter(template => {
      if (message.type === 'prayer_request') return template.category === 'prayers';
      if (message.type === 'urgent') return template.category === 'emergencies';
      if (message.type === 'event') return template.name?.toLowerCase().includes('event');
      return template.category === 'announcements';
    });

    // If we have content, do keyword matching
    if (message.content || message.title) {
      const keywords = (message.content + ' ' + message.title).toLowerCase();
      suggestions = suggestions.filter(template => {
        const templateText = (template.content + ' ' + template.subject + ' ' + template.name).toLowerCase();
        return keywords.split(' ').some(word => 
          word.length > 3 && templateText.includes(word)
        );
      });
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  };

  const smartSuggestions = getSmartSuggestions();

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/communications/templates', data),
    onSuccess: () => {
      toast({
        title: "Template saved successfully",
        description: "Your custom template has been added to the library."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/communications/templates'] });
      setNewTemplate({ name: '', subject: '', content: '', category: 'announcements' });
      updateState({ templates: { ...templateState, creating: false } });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save template",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PUT', `/api/communications/templates/${data.id}`, data),
    onSuccess: () => {
      toast({
        title: "Template updated successfully",
        description: "Your template changes have been saved."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/communications/templates'] });
      updateState({ templates: { ...templateState, editing: null } });
      setNewTemplate({ name: '', subject: '', content: '', category: 'announcements' });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update template",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/communications/templates/${id}`),
    onSuccess: () => {
      toast({
        title: "Template deleted",
        description: "The template has been removed from your library."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/communications/templates'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete template",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSaveTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast({
        title: "Missing required fields",
        description: "Please enter both a name and content for your template.",
        variant: "destructive"
      });
      return;
    }

    if (templateState.editing) {
      updateTemplateMutation.mutate({
        id: templateState.editing.id,
        ...newTemplate
      });
    } else {
      createTemplateMutation.mutate(newTemplate);
    }
  };

  const handleEditTemplate = (template: any) => {
    setNewTemplate({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category || 'announcements'
    });
    updateState({ 
      templates: { 
        ...templateState, 
        editing: template, 
        creating: true 
      } 
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  const handleCancelEdit = () => {
    setNewTemplate({ name: '', subject: '', content: '', category: 'announcements' });
    updateState({ 
      templates: { 
        ...templateState, 
        creating: false, 
        editing: null 
      } 
    });
  };



  // Get all templates in a flat array
  const allTemplates = templates && typeof templates === 'object' ? [
    ...(templates.announcements || []),
    ...(templates.emergencies || []), 
    ...(templates.prayers || [])
  ] : [];

  // Filter templates based on search term
  const filteredTemplates = allTemplates.filter((template: any) => 
    !templateState.searchTerm || 
    template.name.toLowerCase().includes(templateState.searchTerm.toLowerCase()) ||
    template.content.toLowerCase().includes(templateState.searchTerm.toLowerCase())
  );

  return (
    <Card className="h-fit w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Template Library
        </CardTitle>
        
        {/* Quick Actions Bar */}
        <div className="flex items-center gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={templateState.searchTerm}
              onChange={(e) => updateState({ 
                templates: { ...templateState, searchTerm: e.target.value } 
              })}
              className="pl-8"
            />
          </div>
          <Button
            size="sm"
            onClick={() => updateState({ 
              templates: { ...templateState, creating: !templateState.creating } 
            })}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            New
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Smart Suggestions */}
        {smartSuggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Lightbulb className="w-4 h-4" />
              Suggested Templates
            </div>
            <div className="space-y-2">
              {smartSuggestions.map((template: any) => (
                <div key={template.id} className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-blue-800 dark:text-blue-200">
                        {template.name}
                      </h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {template.subject}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onApplyTemplate(template)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-200"
                      >
                        Use
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
          </div>
        )}

        {/* Template Creation Form */}
        {templateState.creating && (
          <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
            <h4 className="font-medium text-sm">
              {templateState.editing ? 'Edit Template' : 'Create New Template'}
            </h4>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="template-name" className="text-xs">Template Name</Label>
                  <Input
                    id="template-name"
                    placeholder="e.g., Weekly Newsletter"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    size="sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="template-category" className="text-xs">Category</Label>
                  <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcements">Announcements</SelectItem>
                      <SelectItem value="emergencies">Emergencies</SelectItem>
                      <SelectItem value="prayers">Prayers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="template-subject" className="text-xs">Subject Line</Label>
                <Input
                  id="template-subject"
                  placeholder="e.g., This Week at Our Church"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  size="sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="template-content" className="text-xs">Message Content</Label>
                <Textarea
                  id="template-content"
                  placeholder="Enter your template message content..."
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleSaveTemplate}
                  disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                  className="flex-1"
                >
                  {(createTemplateMutation.isPending || updateTemplateMutation.isPending) ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      {templateState.editing ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    templateState.editing ? 'Update Template' : 'Save Template'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Templates List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <Clock className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Loading templates...</p>
            </div>
          ) : filteredTemplates.length > 0 ? (
            <>
              <div className="text-sm font-medium text-muted-foreground">
                All Templates ({filteredTemplates.length})
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTemplates.map((template: any) => (
                  <div key={template.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <span className="truncate">{template.name}</span>
                          {template.isCustom && (
                            <Badge variant="secondary" className="text-xs">Custom</Badge>
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {template.subject}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onApplyTemplate(template)}
                          className="text-xs px-2"
                        >
                          Use
                        </Button>
                        {template.isCustom && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {templateState.searchTerm ? 'No templates match your search' : 'No templates available'}
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => updateState({ 
                  templates: { ...templateState, creating: true } 
                })}
                className="mt-2"
              >
                Create Your First Template
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}