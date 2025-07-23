import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { Plus, BookOpen, Heart, Share2, Star, Calendar, Zap, Globe } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { SoapEntryForm } from "../components/SoapEntryForm";
import { SoapEntryCard } from "../components/SoapEntryCard";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import type { SoapEntry } from "../../../shared/schema";
import { useAuth } from "../hooks/useAuth";

export default function SoapPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SoapEntry | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch user's S.O.A.P. entries
  const { data: userEntries = [], isLoading: userLoading } = useQuery({
    queryKey: ['/api/soap-entries'],
    queryFn: () => apiRequest('GET', '/api/soap-entries'),
  });

  // Fetch ALL public S.O.A.P. entries platform-wide
  const { data: allEntries = [], isLoading: allLoading } = useQuery({
    queryKey: ['/api/soap-entries/all'],
    queryFn: () => apiRequest('GET', '/api/soap-entries/all'),
  });

  // Fetch public S.O.A.P. entries for community feed (same church)
  const { data: publicEntries = [], isLoading: publicLoading } = useQuery({
    queryKey: ['/api/soap-entries/public'],
    queryFn: () => apiRequest('GET', '/api/soap-entries/public'),
  });

  // Fetch user's S.O.A.P. streak
  const { data: streakData } = useQuery({
    queryKey: ['/api/soap-entries/streak/current'],
    queryFn: async () => {
      const user = await apiRequest('GET', '/api/auth/user');
      return apiRequest('GET', `/api/soap-entries/streak/${user.id}`);
    },
  });

  // Delete S.O.A.P. entry mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/soap-entries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/soap-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/soap-entries/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/soap-entries/public'] });
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
      toast({
        title: "S.O.A.P. entry deleted",
        description: "Your entry has been removed successfully.",
      });
    },
    onError: (error: any) => {
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
      toast({
        title: "Error",
        description: `Failed to delete S.O.A.P. entry: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (entry: SoapEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setEntryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      deleteMutation.mutate(entryToDelete);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/soap-entries'] });
    queryClient.invalidateQueries({ queryKey: ['/api/soap-entries/all'] });
    queryClient.invalidateQueries({ queryKey: ['/api/soap-entries/public'] });
    queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
    queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
    handleFormClose();
    toast({
      title: editingEntry ? "S.O.A.P. entry updated" : "S.O.A.P. entry created",
      description: editingEntry 
        ? "Your reflection has been updated successfully."
        : "Your spiritual reflection has been saved.",
    });
  };

  if (showForm) {
    return (
      <SoapEntryForm
        entry={editingEntry}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">S.O.A.P. Journal</h1>
          <p className="text-muted-foreground">
            Scripture • Observation • Application • Prayer
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Entry
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{streakData?.streak || 0} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{userEntries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Share2 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shared Entries</p>
                <p className="text-2xl font-bold">
                  {userEntries.filter((entry: SoapEntry) => entry.isPublic).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all-entries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-entries" className="gap-2">
            <Globe className="h-4 w-4" />
            All Entries
          </TabsTrigger>
          <TabsTrigger value="my-entries" className="gap-2">
            <BookOpen className="h-4 w-4" />
            My Entries
          </TabsTrigger>
          <TabsTrigger value="community" className="gap-2">
            <Heart className="h-4 w-4" />
            Community
          </TabsTrigger>
        </TabsList>

        {/* All Entries Tab */}
        <TabsContent value="all-entries" className="space-y-6">
          <div className="text-center py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              All Public S.O.A.P. Entries
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Discover spiritual insights from believers across the entire SoapBox platform
            </p>
          </div>

          {allLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : allEntries.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Public Entries Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Be the first to share a S.O.A.P. entry publicly with the community
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {allEntries.map((entry: SoapEntry) => (
                <SoapEntryCard 
                  key={entry.id} 
                  entry={entry} 
                  onDelete={() => handleDelete(entry.id)}
                  onEdit={() => handleEdit(entry)}
                  showActions={entry.userId === user?.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Entries Tab */}
        <TabsContent value="my-entries" className="space-y-6">
          {userLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading your S.O.A.P. entries...</p>
              </div>
            </div>
          ) : userEntries.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Start Your S.O.A.P. Journey</h3>
                  <p className="text-muted-foreground">
                    Create your first spiritual reflection using the S.O.A.P. method.
                  </p>
                </div>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Entry
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6">
              {userEntries.map((entry: SoapEntry) => (
                <SoapEntryCard
                  key={entry.id}
                  entry={entry}
                  showActions={true}
                  onEdit={() => handleEdit(entry)}
                  onDelete={() => handleDelete(entry.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community" className="space-y-6">
          {publicLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading community entries...</p>
              </div>
            </div>
          ) : publicEntries.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No Community Entries Yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to share a S.O.A.P. entry with the community!
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6">
              {publicEntries.map((entry: SoapEntry) => (
                <SoapEntryCard
                  key={entry.id}
                  entry={entry}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete S.O.A.P. Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this S.O.A.P. entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setEntryToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}