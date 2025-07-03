import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Heart, MessageCircle, Share, Bookmark, Eye, ChevronDown, ChevronUp, MapPin, Users, Award, TrendingUp, Zap } from 'lucide-react';

export default function PrayerWallPreview() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const mockPrayerRequests = [
    {
      id: 1,
      author: "Sarah M.",
      role: "Youth Member",
      church: "Grace Community Church",
      category: "health",
      urgent: true,
      title: "Surgery Recovery Prayer",
      content: "Please pray for my grandmother who is having heart surgery tomorrow. She's been struggling with her health for months and the doctors say this is a critical procedure. We're trusting in God's healing power but would appreciate prayers for the surgical team, her recovery, and peace for our family during this difficult time. Thank you for your prayers.",
      reactions: { praying: 23, heart: 15, fire: 8, praise: 12 },
      prayingUsers: ["Mike R.", "Jennifer K.", "Pastor Tom", "Maria S.", "+19 others"],
      updates: [
        { text: "Surgery went well! Praise God! 🙏", timestamp: "2 hours ago" }
      ],
      timestamp: "4 hours ago",
      answered: true
    },
    {
      id: 2,
      author: "David L.",
      role: "Church Leader",
      church: "New Life Baptist Church",
      category: "career",
      urgent: false,
      title: "Job Interview Guidance",
      content: "I have an important job interview next week that could really help our family financially. Please pray for wisdom, confidence, and God's will to be done.",
      reactions: { praying: 18, heart: 9, fire: 5, praise: 3 },
      prayingUsers: ["Lisa T.", "Robert G.", "Elena R.", "+15 others"],
      updates: [],
      timestamp: "6 hours ago",
      answered: false
    },
    {
      id: 3,
      author: "Maria G.",
      role: "Youth Member",
      church: "Sacred Heart Catholic Church",
      category: "spiritual",
      urgent: false,
      title: "Strength in Faith Journey",
      content: "Going through a challenging season and struggling to feel God's presence. Would appreciate prayers for renewed faith and peace.",
      reactions: { praying: 31, heart: 22, fire: 14, praise: 8 },
      prayingUsers: ["Father Lopez", "Catherine O.", "Youth Group", "+28 others"],
      updates: [],
      timestamp: "1 day ago",
      answered: false
    }
  ];

  const categories = [
    { id: 'all', label: 'All Prayers', icon: '🙏', count: 47 },
    { id: 'health', label: 'Health', icon: '💊', count: 12 },
    { id: 'career', label: 'Career', icon: '💼', count: 8 },
    { id: 'relationships', label: 'Relationships', icon: '❤️', count: 15 },
    { id: 'spiritual', label: 'Spiritual Growth', icon: '✝️', count: 9 },
    { id: 'urgent', label: 'Urgent', icon: '⚡', count: 3 }
  ];

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : '🙏';
  };

  const filteredRequests = selectedCategory === 'all' 
    ? mockPrayerRequests 
    : mockPrayerRequests.filter(req => req.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Enhanced Prayer Wall Preview
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Review the proposed improvements for deeper engagement, better usability, and community growth
          </p>
        </div>

        <Tabs defaultValue="enhanced" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="enhanced">Enhanced Prayer Wall</TabsTrigger>
            <TabsTrigger value="features">New Features</TabsTrigger>
            <TabsTrigger value="analytics">Analytics & Recognition</TabsTrigger>
          </TabsList>

          <TabsContent value="enhanced" className="space-y-6">
            {/* Category Filters */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Prayer Categories & Filters</h3>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-2"
                    >
                      <span>{category.icon}</span>
                      {category.label}
                      <Badge variant="secondary" className="ml-1">
                        {category.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prayer Requests Feed */}
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card 
                  key={request.id} 
                  className={`transition-all duration-200 hover:shadow-lg ${
                    request.urgent ? 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white' : ''
                  } ${request.answered ? 'border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {request.author.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{request.author}</span>
                            <Badge variant="outline" className="text-xs">
                              {request.role}
                            </Badge>
                            {request.urgent && (
                              <Badge variant="destructive" className="text-xs flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Urgent
                              </Badge>
                            )}
                            {request.answered && (
                              <Badge variant="default" className="text-xs bg-green-600">
                                ✓ Answered
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {request.church}
                            <span>•</span>
                            <span>{request.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(request.category)}</span>
                        <Button variant="ghost" size="sm">
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{request.title}</h4>
                      <div className="text-gray-700">
                        {expandedCard === request.id ? (
                          <div>
                            <p>{request.content}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedCard(null)}
                              className="mt-2 text-blue-600 p-0 h-auto"
                            >
                              <ChevronUp className="w-4 h-4 mr-1" />
                              Show Less
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <p className="line-clamp-3">
                              {request.content.length > 150 
                                ? `${request.content.substring(0, 150)}...` 
                                : request.content
                              }
                            </p>
                            {request.content.length > 150 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedCard(request.id)}
                                className="mt-2 text-blue-600 p-0 h-auto"
                              >
                                <ChevronDown className="w-4 h-4 mr-1" />
                                Read More
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Prayer Updates */}
                    {request.updates.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <h5 className="font-semibold text-green-800 text-sm mb-2">Prayer Update:</h5>
                        {request.updates.map((update, index) => (
                          <div key={index} className="text-green-700 text-sm">
                            <p>{update.text}</p>
                            <span className="text-green-600 text-xs">{update.timestamp}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Rich Reactions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="flex items-center gap-2 text-blue-600">
                          🙏 <span className="font-semibold">{request.reactions.praying}</span>
                          <span className="text-sm">Praying</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                          ❤️ <span>{request.reactions.heart}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                          🔥 <span>{request.reactions.fire}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                          🙌 <span>{request.reactions.praise}</span>
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <Eye className="w-4 h-4" />
                          Who's Praying
                        </Button>
                      </div>
                    </div>

                    {/* Who's Praying Preview */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-800">
                          {request.reactions.praying} people praying
                        </span>
                      </div>
                      <div className="text-sm text-blue-700">
                        {request.prayingUsers.join(", ")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Prayer Circles */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Prayer Circles
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Create private or public prayer groups for Bible studies, ministries, or families.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold">Youth Ministry Circle</div>
                        <div className="text-sm text-gray-600">15 members • 3 active prayers</div>
                      </div>
                      <Badge>Private</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold">Recovery Support Group</div>
                        <div className="text-sm text-gray-600">8 members • 2 active prayers</div>
                      </div>
                      <Badge variant="outline">Public</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ETHOS AI Suggestions */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-5 h-5 bg-purple-600 rounded text-white text-xs flex items-center justify-center font-bold">E</div>
                    ETHOS Scripture Suggestions
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    AI-powered scripture and prayer suggestions based on prayer request content.
                  </p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-sm font-semibold text-purple-800 mb-2">
                      Suggested for "Health Prayer":
                    </div>
                    <div className="text-purple-700 text-sm">
                      "Cast all your anxiety on him because he cares for you." - 1 Peter 5:7
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      Add to Prayer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Social Sharing */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Share className="w-5 h-5 text-green-600" />
                    Social Sharing & Growth
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Share prayer requests as faith-friendly cards to invite others to pray.
                  </p>
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
                    <div className="text-sm opacity-90">Join me in prayer</div>
                    <div className="font-semibold">Surgery Recovery Prayer</div>
                    <div className="text-sm opacity-90 mt-2">
                      Pray with us on SoapBox Super App
                    </div>
                  </div>
                  <Button className="mt-3 w-full">
                    Generate Shareable Card
                  </Button>
                </CardContent>
              </Card>

              {/* Silent Prayer Mode */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Eye className="w-5 h-5 text-gray-600" />
                    Silent Prayer Mode
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Private prayer requests that track prayer count without public visibility.
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">Silent Request</div>
                        <div className="text-xs text-gray-600">Only you can see this</div>
                      </div>
                      <div className="text-sm text-gray-600">12 prayers</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Weekly Prayer Impact */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Prayer Impact Badges
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">🏆</div>
                        <div>
                          <div className="font-semibold text-sm">Prayer Warrior</div>
                          <div className="text-xs text-gray-600">50+ prayers this week</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">🙏</div>
                        <div>
                          <div className="font-semibold text-sm">Faithful Intercessor</div>
                          <div className="text-xs text-gray-600">Daily prayer streak: 7 days</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Answered Prayers Count */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                    Answered Prayers
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">127</div>
                    <div className="text-sm text-gray-600">Prayers answered this month</div>
                    <div className="mt-4 space-y-2">
                      <div className="text-xs text-gray-600">Recent answers:</div>
                      <div className="text-sm">• Job interview success</div>
                      <div className="text-sm">• Successful surgery</div>
                      <div className="text-sm">• Family reconciliation</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Prayer Engagement Heatmap */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Engagement Trends
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Health Prayers</span>
                        <span className="text-purple-600">↑ 25%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '75%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Youth Prayers</span>
                        <span className="text-green-600">↑ 15%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Career Prayers</span>
                        <span className="text-blue-600">↑ 8%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard Preview */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Weekly Prayer Leaderboard</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                      <div>
                        <div className="font-semibold">Sarah M.</div>
                        <div className="text-sm text-gray-600">Grace Community Church</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">87 prayers</div>
                      <div className="text-sm text-gray-600">15 requests posted</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">2</div>
                      <div>
                        <div className="font-semibold">Pastor Tom</div>
                        <div className="text-sm text-gray-600">New Life Baptist Church</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">72 prayers</div>
                      <div className="text-sm text-gray-600">8 requests posted</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">3</div>
                      <div>
                        <div className="font-semibold">Maria G.</div>
                        <div className="text-sm text-gray-600">Sacred Heart Catholic Church</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">68 prayers</div>
                      <div className="text-sm text-gray-600">12 requests posted</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Approval Section */}
        <Card className="mt-8 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <h3 className="text-xl font-semibold text-blue-900">Ready for Implementation?</h3>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 mb-4">
              Review all the enhanced features above and let me know which ones you'd like to implement in the actual Prayer Wall.
            </p>
            <div className="flex gap-4">
              <Button className="bg-green-600 hover:bg-green-700">
                Approve All Features
              </Button>
              <Button variant="outline">
                Select Specific Features
              </Button>
              <Button variant="outline">
                Request Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}