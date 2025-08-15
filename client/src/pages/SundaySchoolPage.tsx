import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  PenTool, 
  Play, 
  Star,
  Clock,
  UserCheck,
  TrendingUp,
  Settings
} from 'lucide-react';

interface LessonPlan {
  id: string;
  title: string;
  ageGroup: string;
  topic: string;
  scripture: string;
  duration: number;
  status: 'draft' | 'published' | 'in-use';
  lastModified: string;
  materials: string[];
}

interface Class {
  id: string;
  name: string;
  ageGroup: string;
  teacherName: string;
  studentCount: number;
  nextLesson: string;
  status: 'active' | 'upcoming' | 'completed';
}

export default function SundaySchoolPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const recentLessons: LessonPlan[] = [
    {
      id: '1',
      title: 'The Parable of the Good Samaritan',
      ageGroup: 'Ages 8-12',
      topic: 'Compassion & Kindness',
      scripture: 'Luke 10:25-37',
      duration: 45,
      status: 'published',
      lastModified: '2 days ago',
      materials: ['Bible', 'Activity Sheets', 'Coloring Pages', 'Craft Supplies']
    },
    {
      id: '2',
      title: 'David and Goliath',
      ageGroup: 'Ages 5-8',
      topic: 'Courage & Faith',
      scripture: '1 Samuel 17',
      duration: 30,
      status: 'in-use',
      lastModified: '1 week ago',
      materials: ['Bible', 'Story Props', 'Action Cards']
    },
    {
      id: '3',
      title: 'The Birth of Jesus',
      ageGroup: 'Ages 3-6',
      topic: 'Christmas Story',
      scripture: 'Luke 2:1-20',
      duration: 25,
      status: 'draft',
      lastModified: '3 days ago',
      materials: ['Bible', 'Nativity Set', 'Songs', 'Coloring Pages']
    }
  ];

  const classes: Class[] = [
    {
      id: '1',
      name: 'Little Lambs',
      ageGroup: 'Ages 3-5',
      teacherName: 'Sarah Johnson',
      studentCount: 12,
      nextLesson: 'God Made Everything',
      status: 'active'
    },
    {
      id: '2',
      name: 'Growing Eagles',
      ageGroup: 'Ages 6-8',
      teacherName: 'Michael Davis',
      studentCount: 15,
      nextLesson: 'Jesus Feeds 5000',
      status: 'upcoming'
    },
    {
      id: '3',
      name: 'Faith Builders',
      ageGroup: 'Ages 9-12',
      teacherName: 'Emily Rodriguez',
      studentCount: 18,
      nextLesson: 'The Ten Commandments',
      status: 'active'
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      'draft': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'published': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'in-use': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'upcoming': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'completed': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    
    return variants[status as keyof typeof variants] || variants.draft;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sunday School Hub</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create, manage, and deliver engaging Sunday School lessons
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <PenTool className="w-4 h-4 mr-2" />
            Create New Lesson
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Lessons</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Classes</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">45</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">92%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lessons">Lesson Plans</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <PenTool className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Created lesson: "The Good Samaritan"</span>
                  </div>
                  <span className="text-xs text-gray-500">2 days ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Play className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Started lesson with Faith Builders class</span>
                  </div>
                  <span className="text-xs text-gray-500">1 week ago</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Added 3 new students to Little Lambs</span>
                  </div>
                  <span className="text-xs text-gray-500">2 weeks ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Classes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                This Week's Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {classes.map((classItem) => (
                  <div key={classItem.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{classItem.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{classItem.ageGroup} • {classItem.teacherName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">Next: {classItem.nextLesson}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusBadge(classItem.status)}>
                        {classItem.status}
                      </Badge>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {classItem.studentCount} students
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Lesson Plans</h2>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <PenTool className="w-4 h-4 mr-2" />
              Create New Lesson
            </Button>
          </div>
          
          <div className="grid gap-4">
            {recentLessons.map((lesson) => (
              <Card key={lesson.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{lesson.title}</h3>
                        <Badge className={getStatusBadge(lesson.status)}>
                          {lesson.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div>
                          <span className="font-medium">Age Group:</span> {lesson.ageGroup}
                        </div>
                        <div>
                          <span className="font-medium">Topic:</span> {lesson.topic}
                        </div>
                        <div>
                          <span className="font-medium">Scripture:</span> {lesson.scripture}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {lesson.duration} min
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Materials: {lesson.materials.join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-6">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Class Management</h2>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Add New Class
            </Button>
          </div>
          
          <div className="grid gap-6">
            {classes.map((classItem) => (
              <Card key={classItem.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{classItem.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{classItem.ageGroup}</p>
                    </div>
                    <Badge className={getStatusBadge(classItem.status)}>
                      {classItem.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Teacher:</span>
                      <p className="text-gray-600 dark:text-gray-400">{classItem.teacherName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Students:</span>
                      <p className="text-gray-600 dark:text-gray-400">{classItem.studentCount} enrolled</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Next Lesson:</span>
                      <p className="text-gray-600 dark:text-gray-400">{classItem.nextLesson}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Manage Students</Button>
                    <Button variant="outline" size="sm">Attendance</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Weekly Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Schedule Coming Soon</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We're working on a comprehensive scheduling system for your Sunday School classes.
                </p>
                <Button variant="outline">Request Feature</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}