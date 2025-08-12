import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Bookmark, BookmarkCheck, Trash2, Edit2, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SavedSearch {
  id: number;
  name: string;
  description: string | null;
  searchCriteria: any;
  isDefault: boolean;
  useCount: number;
  lastUsed: string | null;
  createdAt: string;
}

interface SavedSearchesProps {
  currentFilters: any;
  onApplySearch: (searchCriteria: any) => void;
}

export function SavedSearches({ currentFilters, onApplySearch }: SavedSearchesProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editSearch, setEditSearch] = useState<SavedSearch | null>(null);
  const [searchName, setSearchName] = useState("");
  const [searchDescription, setSearchDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch saved searches
  const { data: savedSearches = [], isLoading } = useQuery<SavedSearch[]>({
    queryKey: ["/api/saved-searches"],
  });

  // Save new search mutation
  const saveMutation = useMutation({
    mutationFn: async ({ name, description, searchCriteria }: { name: string; description: string; searchCriteria: any }) => {
      return apiRequest("/api/saved-searches", "POST", { name, description, searchCriteria });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-searches"] });
      setSaveDialogOpen(false);
      setSearchName("");
      setSearchDescription("");
      toast({
        title: "Search Saved",
        description: "Your filter combination has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to save search. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete search mutation
  const deleteMutation = useMutation({
    mutationFn: async (searchId: number) => {
      return apiRequest(`/api/saved-searches/${searchId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-searches"] });
      toast({
        title: "Search Deleted",
        description: "The saved search has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete search.",
        variant: "destructive",
      });
    },
  });

  // Use search mutation
  const useSearchMutation = useMutation({
    mutationFn: async (searchId: number) => {
      return apiRequest(`/api/saved-searches/${searchId}/use`, "POST");
    },
    onSuccess: () => {
      // Optionally refetch to update use counts
      queryClient.invalidateQueries({ queryKey: ["/api/saved-searches"] });
    },
  });

  const handleSaveSearch = () => {
    if (!searchName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your saved search.",
        variant: "destructive",
      });
      return;
    }

    // Check if any filters are applied
    const hasFilters = Object.values(currentFilters).some(filter => 
      Array.isArray(filter) ? filter.length > 0 : Boolean(filter)
    );

    if (!hasFilters) {
      toast({
        title: "No Filters Applied",
        description: "Please apply some filters before saving.",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate({
      name: searchName,
      description: searchDescription,
      searchCriteria: currentFilters,
    });
  };

  const handleApplySearch = (search: SavedSearch) => {
    onApplySearch(search.searchCriteria);
    useSearchMutation.mutate(search.id);
    toast({
      title: "Search Applied",
      description: `Applied filters from "${search.name}".`,
    });
  };

  const formatLastUsed = (dateString: string | null) => {
    if (!dateString) return "Never used";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getFilterSummary = (criteria: any) => {
    const summaryParts = [];
    if (criteria.testament?.length > 0) summaryParts.push(`Testament: ${criteria.testament.join(", ")}`);
    if (criteria.difficulty?.length > 0) summaryParts.push(`Difficulty: ${criteria.difficulty.join(", ")}`);
    if (criteria.format?.length > 0) summaryParts.push(`Format: ${criteria.format.join(", ")}`);
    if (criteria.audience?.length > 0) summaryParts.push(`Audience: ${criteria.audience.join(", ")}`);
    return summaryParts.join(" • ") || "No filters";
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled>
          <Bookmark className="h-4 w-4 mr-2" />
          Loading...
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Save Current Search */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Save Search
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current Search</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="e.g., Beginner New Testament Plans"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                placeholder="Notes about this search..."
                value={searchDescription}
                onChange={(e) => setSearchDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="bg-muted p-3 rounded">
              <label className="text-sm font-medium text-muted-foreground">Current Filters:</label>
              <p className="text-sm mt-1">{getFilterSummary(currentFilters)}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSearch} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Search"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Saved Searches Dropdown */}
      {savedSearches.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 mr-2" />
              Saved Searches ({savedSearches.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Your Saved Searches</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {savedSearches.map((search: SavedSearch) => (
                <div
                  key={search.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{search.name}</h4>
                        {search.isDefault && <Badge variant="secondary">Default</Badge>}
                        <Badge variant="outline" className="text-xs">
                          Used {search.useCount} times
                        </Badge>
                      </div>
                      {search.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {search.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mb-2">
                        {getFilterSummary(search.searchCriteria)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last used: {formatLastUsed(search.lastUsed)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApplySearch(search)}
                        disabled={useSearchMutation.isPending}
                      >
                        <BookmarkCheck className="h-4 w-4 mr-2" />
                        Apply
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(search.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}