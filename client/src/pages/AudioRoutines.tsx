import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Play, Headphones, Settings, Volume2 } from 'lucide-react';
// import AudioRoutinePlayer from '@/components/AudioRoutinePlayer';

export default function AudioRoutines() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(null);

  const { data: routines = [], isLoading } = useQuery({
    queryKey: ['/api/audio/routines', selectedCategory],
    enabled: true
  });

  const { data: selectedRoutine } = useQuery({
    queryKey: ['/api/audio/routines', selectedRoutineId],
    enabled: !!selectedRoutineId
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'morning': return '🌅';
      case 'evening': return '🌙';
      case 'midday': return '☀️';
      default: return '✨';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'morning': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'evening': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'midday': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (selectedRoutine) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedRoutineId(null)}
              className="mb-4"
            >
              ← Back to Routines
            </Button>
          </div>
          
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Play className="h-6 w-6 text-purple-600" />
                {selectedRoutine.name}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedRoutine.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Headphones className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Audio Routine Player</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Duration: {formatDuration(selectedRoutine.totalDuration || 0)}
                  </p>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Play className="h-4 w-4 mr-2" />
                    Start Routine
                  </Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Headphones className="h-8 w-8 text-purple-600" />
                Audio Spiritual Routines
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Guided meditation, prayer, and scripture experiences with personalized audio
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routines</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="midday">Midday</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Volume2 className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Multiple Voices</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Choose from warm, gentle, peaceful, or authoritative voice options to match your spiritual needs
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Play className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Autoplay Sequences</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Seamless transitions between meditation, prayer, scripture, and reflection segments
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Settings className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Music Beds</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Ambient backgrounds including gentle piano, nature sounds, and worship instrumentals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Routines Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Available Routines
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routines.map((routine: any) => (
                <Card 
                  key={routine.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-200 dark:hover:border-purple-700"
                  onClick={() => setSelectedRoutineId(routine.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(routine.category)}</span>
                        <Badge className={getCategoryColor(routine.category)}>
                          {routine.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {formatDuration(routine.totalDuration)}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-purple-800 dark:text-purple-300">
                      {routine.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {routine.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Steps: {routine.steps?.length || 0}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          routine.autoAdvance 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                        }`}>
                          {routine.autoAdvance ? 'Auto-advance' : 'Manual'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {routine.steps?.slice(0, 3).map((step: any, index: number) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-xs"
                          >
                            {step.type}
                          </span>
                        ))}
                        {routine.steps?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs">
                            +{routine.steps.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoutineId(routine.id);
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Routine
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && routines.length === 0 && (
            <Card className="text-center p-12">
              <CardContent>
                <Headphones className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No routines available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back later for new audio spiritual experiences
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Audio Technology Info */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Advanced Audio Technology
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Voice Synthesis</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                High-quality text-to-speech with multiple voice personas designed for spiritual content delivery
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Adaptive Pacing</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Automatically adjusts reading speed and pauses based on content type and spiritual practice
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Ambient Integration</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Seamlessly blends voice content with carefully selected background music and nature sounds
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Progress Tracking</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Remembers your progress and preferences across sessions for a personalized experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}