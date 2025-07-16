import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { Plus, BookOpen, Heart, Share2, Star, Calendar, Zap } from "lucide-react";
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

export default function SoapPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SoapEntry | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's S.O.A.P. entries
  const { data: userEntries = [], isLoading: userLoading } = useQuery({
    queryKey: ['/api/soap'],
    queryFn: () => apiRequest('GET', '/api/soap'),
  });

  // Fetch public S.O.A.P. entries for community feed
  const { data: publicEntries = [], isLoading: publicLoading } = useQuery({
    queryKey: ['/api/soap/public'],
    queryFn: () => apiRequest('GET', '/api/soap/public'),
  });

  // Fetch user's S.O.A.P. streak
  const { data: streakData } = useQuery({
    queryKey: ['/api/soap/streak/current'],
    queryFn: async () => {
      const user = await apiRequest('GET', '/api/auth/user');
      return apiRequest('GET', `/api/soap/streak/${user.id}`);
    },
  });

  // Delete S.O.A.P. entry mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/soap/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/soap'] });
      queryClient.invalidateQueries({ queryKey: ['/api/soap/public'] });
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
    queryClient.invalidateQueries({ queryKey: ['/api/soap'] });
    queryClient.invalidateQueries({ queryKey: ['/api/soap/public'] });
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
                  {userEntries.filter(entry => entry.isPublic).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="my-entries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-entries" className="gap-2">
            <BookOpen className="h-4 w-4" />
            My Entries
          </TabsTrigger>
          <TabsTrigger value="community" className="gap-2">
            <Heart className="h-4 w-4" />
            Community
          </TabsTrigger>
        </TabsList>

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
              {userEntries.map((entry) => (
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
              {publicEntries.map((entry) => (
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