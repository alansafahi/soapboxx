import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Users, Search, Mail, MessageSquare, Shield, Info } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLocation } from "wouter";
import { Alert, AlertDescription } from "../components/ui/alert";

interface SearchUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  churchId?: number;
  role?: string;
  isDiscoverable?: boolean;
}

export default function PeoplePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Get user's church info for context
  const { data: userChurch } = useQuery<{ name: string; id: number }>({
    queryKey: ["/api/user/church"],
    enabled: !!user,
  });

  const handleSearch = async () => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm.trim())}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.users || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'church_admin': 'Church Admin',
      'pastor': 'Pastor',
      'lead_pastor': 'Lead Pastor',
      'member': 'Member',
      'volunteer': 'Volunteer',
      'staff': 'Staff'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Church Members
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find and connect with members from your church community
          </p>
        </div>
      </div>

      {/* Privacy Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Privacy Protected:</strong> You can only search for members within your church. 
          Personal contact information is only visible to church staff.
        </AlertDescription>
      </Alert>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Church Members
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching || searchTerm.length < 2}
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
          
          {userChurch && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Searching within: <strong>{(userChurch as { name: string }).name}</strong>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results</span>
              <Badge variant="outline">
                {searchResults.length} {searchResults.length === 1 ? "member" : "members"} found
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No members found matching "{searchTerm}"
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Try searching with a different name or email
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((member) => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.profileImageUrl} />
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {member.firstName} {member.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {member.username}
                          </p>
                          {member.role && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {getRoleDisplayName(member.role)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setLocation(`/messages?contact=${member.id}&name=${encodeURIComponent(`${member.firstName} ${member.lastName}`)}`)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        {/* Only show email for church staff */}
                        {(user?.role === 'church_admin' || user?.role === 'pastor' || user?.role === 'lead_pastor' || user?.role === 'soapbox_owner') && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.location.href = `mailto:${member.email}`}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium mb-1">How to use Church Member Search:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Search for members by their first name, last name, or email address</li>
                <li>You can only find members from your own church community</li>
                <li>Contact information is protected - only church staff can see email addresses</li>
                <li>Use the message button to start conversations with other members</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}