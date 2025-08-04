import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { WeeklyCheckin } from '@/components/WeeklyCheckin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, TrendingUp, Target, Award } from 'lucide-react';

export function WeeklyCheckinPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/weekly-checkin/stats'],
  });

  const { data: history } = useQuery({
    queryKey: ['/api/weekly-checkin/history'],
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Spiritual Check-in</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Take time each week to reflect on your spiritual journey, celebrate growth, and set intentions for the week ahead.
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{stats.streakCount}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 mr-1" />
                  Current Streak
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalCheckins}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <Award className="w-4 h-4 mr-1" />
                  Total Check-ins
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.averageSpiritalGrowth}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Avg Growth
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">{stats.longestStreak}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <Target className="w-4 h-4 mr-1" />
                  Best Streak
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Growth Areas Insights */}
        {stats && (stats.strongAreas.length > 0 || stats.improvementAreas.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {stats.strongAreas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-green-700">Your Strengths</CardTitle>
                  <CardDescription>Areas where you're thriving</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.strongAreas.map((area: string, index: number) => (
                      <Badge key={index} className="bg-green-100 text-green-800 mr-2 mb-2">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {stats.improvementAreas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-blue-700">Growth Opportunities</CardTitle>
                  <CardDescription>Areas to focus on this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.improvementAreas.map((area: string, index: number) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Weekly Check-in Form */}
        <WeeklyCheckin />

        {/* Recent Check-ins History */}
        {history && history.length > 0 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Your Recent Check-ins</CardTitle>
              <CardDescription>
                Track your spiritual growth over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.slice(0, 3).map((checkin: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold">Week of {checkin.week}</div>
                      <Badge variant="outline">
                        Avg: {((checkin.spiritualGrowth + checkin.prayerLife + checkin.bibleReading + 
                               checkin.communityConnection + checkin.serviceOpportunities + 
                               checkin.emotionalWellbeing) / 6).toFixed(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="text-gray-600">Spiritual Growth</div>
                        <Progress value={(checkin.spiritualGrowth / 5) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="text-gray-600">Prayer Life</div>
                        <Progress value={(checkin.prayerLife / 5) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="text-gray-600">Bible Reading</div>
                        <Progress value={(checkin.bibleReading / 5) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="text-gray-600">Community</div>
                        <Progress value={(checkin.communityConnection / 5) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="text-gray-600">Service</div>
                        <Progress value={(checkin.serviceOpportunities / 5) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="text-gray-600">Wellbeing</div>
                        <Progress value={(checkin.emotionalWellbeing / 5) * 100} className="h-2" />
                      </div>
                    </div>
                    
                    {checkin.gratitude && checkin.gratitude.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm text-gray-600 mb-1">Gratitude:</div>
                        <div className="text-sm">{checkin.gratitude.slice(0, 2).join(', ')}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default WeeklyCheckinPage;