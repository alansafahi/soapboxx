import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Globe, Users } from "lucide-react";
import type { Church } from "@shared/schema";

export default function ChurchDiscovery() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch nearby churches
  const { data: churches = [], isLoading } = useQuery<Church[]>({
    queryKey: ["/api/churches/nearby"],
  });

  // Join church mutation
  const joinChurchMutation = useMutation({
    mutationFn: async (churchId: number) => {
      await apiRequest("POST", `/api/churches/${churchId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/churches/nearby"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/churches"] });
      toast({
        title: "Church Joined",
        description: "You have successfully connected with this church!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to join church. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleJoinChurch = (churchId: number) => {
    joinChurchMutation.mutate(churchId);
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-3 h-3 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />
      );
    }

    return stars;
  };

  const getDenominationColor = (denomination?: string) => {
    if (!denomination) return "bg-gray-100 text-gray-700";
    
    const colors = [
      "bg-blue-100 text-blue-700",
      "bg-green-100 text-green-700",
      "bg-purple-100 text-purple-700",
      "bg-orange-100 text-orange-700",
      "bg-pink-100 text-pink-700",
    ];
    
    const hash = denomination.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border border-gray-100 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Discover Churches</CardTitle>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {churches.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No churches found</h3>
            <p className="text-gray-600 text-sm">
              We're working to connect more churches in your area. Check back soon!
            </p>
          </div>
        ) : (
          churches.slice(0, 3).map((church) => (
            <div 
              key={church.id} 
              className="border border-gray-100 rounded-xl p-4 hover:border-faith-blue transition-colors cursor-pointer"
            >
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                  {church.imageUrl ? (
                    <img 
                      src={church.imageUrl} 
                      alt={`${church.name} building`} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-faith-blue to-blue-600 flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-faith-blue">
                          {church.name[0]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                        {church.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        {church.denomination && (
                          <Badge className={`text-xs ${getDenominationColor(church.denomination)}`}>
                            {church.denomination}
                          </Badge>
                        )}
                        {church.city && church.state && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {church.city}, {church.state}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {church.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {church.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {church.rating && church.rating > 0 ? (
                        <div className="flex items-center space-x-1">
                          <div className="flex">
                            {renderStarRating(church.rating)}
                          </div>
                          <span className="text-xs text-gray-500">
                            {church.rating.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No rating yet</span>
                      )}
                      
                      {church.memberCount && church.memberCount > 0 && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {church.memberCount}
                        </span>
                      )}
                    </div>
                    
                    <Button 
                      size="sm"
                      onClick={() => handleJoinChurch(church.id)}
                      disabled={joinChurchMutation.isPending}
                      className="text-faith-blue hover:text-blue-600 hover:bg-light-blue text-xs font-medium h-7 px-3"
                      variant="ghost"
                    >
                      {joinChurchMutation.isPending ? "Connecting..." : "Connect"}
                    </Button>
                  </div>
                  
                  {/* Contact Information */}
                  {(church.phone || church.website) && (
                    <div className="flex items-center space-x-3 mt-2 pt-2 border-t border-gray-100">
                      {church.phone && (
                        <a 
                          href={`tel:${church.phone}`}
                          className="text-xs text-gray-500 hover:text-faith-blue flex items-center"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </a>
                      )}
                      {church.website && (
                        <a 
                          href={church.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-500 hover:text-faith-blue flex items-center"
                        >
                          <Globe className="w-3 h-3 mr-1" />
                          Website
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {churches.length > 3 && (
          <div className="text-center pt-2">
            <Button variant="outline" size="sm" className="text-faith-blue border-faith-blue hover:bg-light-blue">
              View {churches.length - 3} More Churches
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
