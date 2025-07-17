import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SoapPostCard } from '@/components/SoapPostCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function SavedReflections() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savedEntries = [], isLoading } = useQuery({
    queryKey: ['/api/user/saved-soap'],
  });

  const removeSavedMutation = useMutation({
    mutationFn: async (soapId: number) => {
      await apiRequest('DELETE', `/api/soap/saved/${soapId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/saved-soap'] });
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      toast({
        title: "Removed from collection",
        description: "This reflection is no longer saved.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to remove",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-64 bg-gray-100"></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Saved Reflections
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your collection of saved S.O.A.P. reflections for inspiration and revisitation
        </p>
      </div>

      {savedEntries.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <CardTitle className="text-xl text-gray-600 dark:text-gray-400">
              No Saved Reflections Yet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              When you save S.O.A.P. reflections from the community feed, they'll appear here for easy access.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="mx-auto"
            >
              <Heart className="w-4 h-4 mr-2" />
              Explore Community Feed
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {savedEntries.length} saved reflection{savedEntries.length !== 1 ? 's' : ''}
          </div>
          
          {savedEntries.map((entry: any) => (
            <div key={entry.id} className="relative">
              {/* Enhanced SoapPostCard with remove option */}
              <SoapPostCard 
                post={entry}
                showRemoveOption={true}
                onRemove={() => removeSavedMutation.mutate(entry.id)}
                isRemoving={removeSavedMutation.isPending}
              />
              
              {/* Saved indicator and metadata */}
              <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 px-6">
                <span className="flex items-center">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Saved on {new Date(entry.savedAt).toLocaleDateString()}
                </span>
                {entry.bookmarkNotes && (
                  <span className="italic">
                    Note: {entry.bookmarkNotes}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}