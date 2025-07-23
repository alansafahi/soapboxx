import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Heart, 
  Calendar,
  AlertTriangle,
  BarChart3,
  Activity,
  Clock
} from "lucide-react";
import { format } from "date-fns";

interface EngagementOverview {
  checkInsThisWeek: number;
  checkInsLastWeek: number;
  checkInTrend: string;
  bibleReadingsThisWeek: number;
  bibleReadingsLastWeek: number;
  bibleReadingTrend: string;
  eventAttendanceThisWeek: number;
  eventAttendanceLastWeek: number;
  eventTrend: string;
  prayersThisWeek: number;
  prayersLastWeek: number;
  prayerTrend: string;
}

interface MemberCheckInsData {
  totalMembers: number;
  activeMembers: number;
  averageCheckins: number;
  members: Array<{
    id: string;
    name: string;
    email: string;
    checkInsThisPeriod: number;
    lastCheckIn: Date;
  }>;
}

interface DevotionAnalytics {
  totalReadings: number;
  uniqueReaders: number;
  averageEngagement: number;
  mostPopularVerses: Array<{
    reference: string;
    readCount: number;
  }>;
}

interface AtRiskMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  daysSinceLastActivity: number;
}

export function AdminAnalyticsDashboard() {
  const { user } = useAuth();
  
  const { data: engagementData, isLoading: engagementLoading } = useQuery<EngagementOverview>({
    queryKey: ['/api/admin-portal/engagement-overview'],
    enabled: !!user
  });

  const { data: checkInsData, isLoading: checkInsLoading } = useQuery<MemberCheckInsData>({
    queryKey: ['/api/admin-portal/member-checkins'],
    enabled: !!user
  });

  const { data: devotionData, isLoading: devotionLoading } = useQuery<DevotionAnalytics>({
    queryKey: ['/api/admin-portal/devotion-analytics'],
    enabled: !!user
  });

  const { data: atRiskMembers, isLoading: atRiskLoading } = useQuery<AtRiskMember[]>({
    queryKey: ['/api/admin-portal/at-risk-members'],
    enabled: !!user
  });

  const { data: prayerData, isLoading: prayerLoading } = useQuery({
    queryKey: ['/api/admin-portal/analytics/prayer-engagement'],
    enabled: !!user
  });

  const { data: devotionalData, isLoading: devotionalLoading } = useQuery({
    queryKey: ['/api/admin-portal/analytics/devotional-completions'],
    queryFn: () => fetch('/api/admin-portal/analytics/devotional-completions?devotional=Lent').then(res => res.json()),
    enabled: !!user
  });

  const renderTrendIcon = (trend: string) => {
    const isPositive = trend.startsWith('+');
    return isPositive ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const renderTrendBadge = (trend: string) => {
    // Handle NaN, null, undefined, or empty trend values
    const safeTrend = trend && !isNaN(Number(trend.replace(/[^0-9.-]/g, ''))) ? trend : '0%';
    const isPositive = safeTrend.startsWith('+');
    return (
      <Badge variant={isPositive ? "default" : "destructive"} className="ml-2">
        {safeTrend}
      </Badge>
    );
  };

  if (engagementLoading || checkInsLoading || devotionLoading || atRiskLoading || prayerLoading || devotionalLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Member Engagement Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track spiritual growth and community participation across your congregation
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Last updated: {format(new Date(), 'MMM d, yyyy h:mm a')}</span>
        </div>
      </div>

      {/* Engagement Overview Cards */}
      {engagementData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Weekly Check-ins
              </CardTitle>
              <Heart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {engagementData.checkInsThisWeek}
              </div>
              <div className="flex items-center text-xs text-purple-700 dark:text-purple-300">
                {renderTrendIcon(engagementData.checkInTrend)}
                <span className="ml-1">vs last week</span>
                {renderTrendBadge(engagementData.checkInTrend)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Bible Readings
              </CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {engagementData.bibleReadingsThisWeek}
              </div>
              <div className="flex items-center text-xs text-blue-700 dark:text-blue-300">
                {renderTrendIcon(engagementData.bibleReadingTrend)}
                <span className="ml-1">vs last week</span>
                {renderTrendBadge(engagementData.bibleReadingTrend)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Event Attendance
              </CardTitle>
              <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {engagementData.eventAttendanceThisWeek}
              </div>
              <div className="flex items-center text-xs text-green-700 dark:text-green-300">
                {renderTrendIcon(engagementData.eventTrend)}
                <span className="ml-1">vs last week</span>
                {renderTrendBadge(engagementData.eventTrend)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Prayer Requests
              </CardTitle>
              <Heart className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                {engagementData.prayersThisWeek}
              </div>
              <div className="flex items-center text-xs text-amber-700 dark:text-amber-300">
                {renderTrendIcon(engagementData.prayerTrend)}
                <span className="ml-1">vs last week</span>
                {renderTrendBadge(engagementData.prayerTrend)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Check-ins Details */}
        {checkInsData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Users className="mr-2 h-5 w-5 text-[#5A2671]" />
                Member Check-in Overview
              </CardTitle>
              <CardDescription>
                Spiritual wellness tracking for your congregation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#5A2671]">
                    {checkInsData.totalMembers}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Members</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {checkInsData.activeMembers}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active This Week</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {checkInsData.averageCheckins}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Check-ins</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Recent Activity</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {checkInsData.members.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div>
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          {member.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Last check-in: {format(new Date(member.lastCheckIn), 'MMM d')}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-[#5A2671] text-white">
                        {member.checkInsThisPeriod} this week
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bible Reading Analytics */}
        {devotionData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <BookOpen className="mr-2 h-5 w-5 text-[#5A2671]" />
                Scripture Engagement
              </CardTitle>
              <CardDescription>
                Bible reading habits and popular verses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#5A2671]">
                    {devotionData.totalReadings}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Readings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {devotionData.uniqueReaders}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Unique Readers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {devotionData.averageEngagement}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Engagement</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Most Popular Verses</h4>
                <div className="space-y-2">
                  {devotionData.mostPopularVerses.map((verse, index) => (
                    <div key={verse.reference} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-[#5A2671] text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                          {index + 1}
                        </div>
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          {verse.reference}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {verse.readCount} reads
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prayer Engagement Analytics */}
        {prayerData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Heart className="mr-2 h-5 w-5 text-[#5A2671]" />
                Prayer Engagement (This Week)
              </CardTitle>
              <CardDescription>
                Members who prayed for others and prayer activity metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold text-[#5A2671]">
                    {prayerData.activePrayerWarriors || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Prayer Warriors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {prayerData.supportProvided || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Prayers Offered</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {prayerData.prayerEngagementRate || 0}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {prayerData.totalPrayers || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Prayer Requests</div>
                </div>
              </div>
              
              {prayerData.membersWhoPrayedForOthers && prayerData.membersWhoPrayedForOthers.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Top Prayer Supporters This Week</h4>
                  <div className="space-y-2">
                    {prayerData.membersWhoPrayedForOthers.slice(0, 5).map((member) => (
                      <div key={member.userId} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{member.email}</p>
                        </div>
                        <Badge variant="secondary" className="bg-[#5A2671] text-white">
                          {member.prayersOffered} prayers
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Devotional Completions */}
        {devotionalData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <BookOpen className="mr-2 h-5 w-5 text-[#5A2671]" />
                Devotional Completions
              </CardTitle>
              <CardDescription>
                {devotionalData.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {devotionalData.totalCompletions || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Members completed {devotionalData.devotionalName} devotional
                </div>
              </div>
              
              {devotionalData.completions && devotionalData.completions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Recent Completions</h4>
                  <div className="space-y-2">
                    {devotionalData.completions.slice(0, 5).map((completion) => (
                      <div key={completion.userId} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{completion.name}</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{completion.series}</p>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {completion.progress}% complete
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* At-Risk Members */}
      {atRiskMembers && atRiskMembers.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-700">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-800 dark:text-amber-200">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Members Needing Pastoral Care
            </CardTitle>
            <CardDescription>
              Members who haven't been active recently and may benefit from outreach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {atRiskMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {member.firstName} {member.lastName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {member.email}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">
                      {member.daysSinceLastActivity} days inactive
                    </Badge>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Consider reaching out
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {atRiskMembers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-700">
                <Button className="w-full bg-[#5A2671] hover:bg-[#4A1F5F] text-white">
                  <Activity className="mr-2 h-4 w-4" />
                  Generate Pastoral Care Report
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Analytics help you understand your congregation's spiritual journey and identify opportunities for pastoral care and community growth.
        </p>
      </div>
    </div>
  );
}