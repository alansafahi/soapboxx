import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BookOpen, 
  Calendar, 
  Heart, 
  Briefcase, 
  DollarSign, 
  Sunrise,
  Filter,
  Search,
  Star,
  Clock,
  Users,
  Play,
  CheckCircle
} from "lucide-react";

interface DevotionalPack {
  id: string;
  title: string;
  description: string;
  duration: number;
  verses: number;
  category: string;
  difficulty: string;
  tags: string[];
  imageUrl?: string;
  isPopular: boolean;
}

interface DevotionalContent {
  title: string;
  currentDay: number;
  verse: {
    reference: string;
    text: string;
    theme: string;
    dayTitle: string;
  };
  reflection: {
    question: string;
    application: string;
    prayer: string;
  };
}

export default function DevotionalPacks() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPack, setSelectedPack] = useState<DevotionalPack | null>(null);
  const [currentDay, setCurrentDay] = useState(1);

  const { data: devotionalPacks = [], isLoading } = useQuery({
    queryKey: ['/api/bible/devotional-packs'],
  });

  const { data: packContent } = useQuery({
    queryKey: ['/api/bible/devotional-packs', selectedPack?.id, currentDay],
    enabled: !!selectedPack,
  });

  const categories = ["all", "Spiritual Growth", "Career & Purpose", "Healing & Comfort", "Relationships", "Stewardship", "Life Changes"];

  const filteredPacks = devotionalPacks.filter((pack: DevotionalPack) => {
    const matchesCategory = selectedCategory === "all" || pack.category === selectedCategory;
    const matchesSearch = pack.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pack.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pack.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Spiritual Growth": return Heart;
      case "Career & Purpose": return Briefcase;
      case "Healing & Comfort": return Heart;
      case "Relationships": return Users;
      case "Stewardship": return DollarSign;
      case "Life Changes": return Sunrise;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A2671]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Thematic Devotional Packs</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Focused Bible studies for specific life situations and growth areas
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search devotional packs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-64">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Popular Packs */}
      {searchTerm === "" && selectedCategory === "all" && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Popular Devotional Packs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {devotionalPacks
              .filter((pack: DevotionalPack) => pack.isPopular)
              .map((pack: DevotionalPack) => {
                const CategoryIcon = getCategoryIcon(pack.category);
                return (
                  <Card key={pack.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#5A2671]">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CategoryIcon className="h-8 w-8 text-[#5A2671]" />
                        <Badge className="bg-yellow-100 text-yellow-800">Popular</Badge>
                      </div>
                      <CardTitle className="text-lg">{pack.title}</CardTitle>
                      <CardDescription>{pack.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{pack.duration} days</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{pack.verses} verses</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{pack.category}</Badge>
                          <Badge className={getDifficultyColor(pack.difficulty)}>
                            {pack.difficulty}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {pack.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <Button 
                          className="w-full bg-[#5A2671] hover:bg-[#4A1F5F]"
                          onClick={() => setSelectedPack(pack)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Devotional
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* All Packs */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {searchTerm || selectedCategory !== "all" ? "Search Results" : "All Devotional Packs"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPacks.map((pack: DevotionalPack) => {
            const CategoryIcon = getCategoryIcon(pack.category);
            return (
              <Card key={pack.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CategoryIcon className="h-6 w-6 text-[#5A2671]" />
                    {pack.isPopular && (
                      <Badge className="bg-yellow-100 text-yellow-800">Popular</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{pack.title}</CardTitle>
                  <CardDescription>{pack.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{pack.duration} days</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{pack.verses} verses</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{pack.category}</Badge>
                      <Badge className={getDifficultyColor(pack.difficulty)}>
                        {pack.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {pack.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full bg-[#5A2671] hover:bg-[#4A1F5F]"
                      onClick={() => setSelectedPack(pack)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Devotional
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Devotional Pack Content Dialog */}
      <Dialog open={!!selectedPack} onOpenChange={() => setSelectedPack(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#5A2671]" />
              {selectedPack?.title}
            </DialogTitle>
          </DialogHeader>
          
          {packContent && (
            <div className="space-y-6">
              {/* Progress */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Day {currentDay} of {selectedPack?.duration}
                    </span>
                  </div>
                  <Progress 
                    value={(currentDay / (selectedPack?.duration || 1)) * 100} 
                    className="h-2"
                  />
                </CardContent>
              </Card>

              {/* Day Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}
                  disabled={currentDay === 1}
                >
                  Previous Day
                </Button>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">{(packContent && packContent.verse && packContent.verse.dayTitle) ? packContent.verse.dayTitle : `Day ${currentDay}`}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentDay(Math.min(selectedPack?.duration || 1, currentDay + 1))}
                  disabled={currentDay === selectedPack?.duration}
                >
                  Next Day
                </Button>
              </div>

              {/* Daily Content */}
              <Tabs defaultValue="verse" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="verse">Today's Verse</TabsTrigger>
                  <TabsTrigger value="reflection">Reflection</TabsTrigger>
                  <TabsTrigger value="prayer">Prayer</TabsTrigger>
                </TabsList>
                
                <TabsContent value="verse" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{packContent.verse.reference}</CardTitle>
                      <CardDescription>{packContent.verse.theme}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <blockquote className="text-lg italic text-gray-700 dark:text-gray-300 border-l-4 border-[#5A2671] pl-4">
                        "{packContent.verse.text}"
                      </blockquote>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="reflection" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Reflection Question</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {packContent.reflection.question}
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          Practical Application
                        </h4>
                        <p className="text-blue-800 dark:text-blue-200">
                          {packContent.reflection.application}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="prayer" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Guided Prayer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                        <p className="text-purple-800 dark:text-purple-200 italic">
                          "{packContent.reflection.prayer}"
                        </p>
                      </div>
                      <div className="mt-4 flex justify-center">
                        <Button 
                          variant="outline"
                          className="border-[#5A2671] text-[#5A2671] hover:bg-[#5A2671] hover:text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Day Complete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}