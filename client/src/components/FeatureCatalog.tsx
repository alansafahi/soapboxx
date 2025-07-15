import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { 
  ChevronDown, ChevronRight, Users, Calendar, MessageSquare, Heart, 
  BookOpen, Volume2, Headphones, PlayCircle, Settings, UserCog,
  DollarSign, User, Church, Mail, Bell, Search, TrendingUp,
  Shield, Database, Globe, Smartphone, Zap, Star, Award,
  Activity, BarChart, FileText, Camera, Video, Music, Share2
} from "lucide-react";

interface Feature {
  name: string;
  description: string;
  status: 'Active' | 'Beta' | 'Coming Soon';
  icon: React.ReactNode;
  details?: string[];
}

interface FeatureCategory {
  name: string;
  description: string;
  icon: React.ReactNode;
  features: Feature[];
}

interface UserGroup {
  name: string;
  description: string;
  color: string;
  categories: FeatureCategory[];
}

export default function FeatureCatalog() {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    members: true,
    church: false
  });
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const featureGroups: UserGroup[] = [
    {
      name: "Member Features",
      description: "Core functionality for individual community members",
      color: "bg-blue-500",
      categories: [
        {
          name: "Community & Social",
          description: "Connect and engage with your faith community",
          icon: <Users className="w-5 h-5" />,
          features: [
            {
              name: "Social Feed",
              description: "Share updates, photos, and thoughts with your community",
              status: "Active",
              icon: <Activity className="w-4 h-4" />,
              details: ["Post text, images, and videos", "Like and comment on posts", "Share prayer requests", "Community celebrations"]
            },
            {
              name: "Church Discovery",
              description: "Find and connect with local churches",
              status: "Active",
              icon: <Church className="w-4 h-4" />,
              details: ["Search by location and denomination", "View church profiles and services", "Read reviews and ratings", "Contact church staff"]
            },
            {
              name: "Events",
              description: "Discover and participate in community events",
              status: "Active",
              icon: <Calendar className="w-4 h-4" />,
              details: ["Browse upcoming events", "RSVP and track attendance", "Get event reminders", "View event photos and updates"]
            },
            {
              name: "Messages",
              description: "Direct messaging with community members",
              status: "Active",
              icon: <MessageSquare className="w-4 h-4" />,
              details: ["One-on-one conversations", "Group messaging", "Share prayer requests privately", "Connect with ministry leaders"]
            },
            {
              name: "Prayer Wall",
              description: "Share and respond to prayer requests",
              status: "Active",
              icon: <Heart className="w-4 h-4" />,
              details: ["Post prayer requests", "Pray for others", "Create prayer circles", "Anonymous prayer options"]
            }
          ]
        },
        {
          name: "Spiritual Growth",
          description: "Tools to deepen your faith journey",
          icon: <BookOpen className="w-5 h-5" />,
          features: [
            {
              name: "Daily Bible Reading",
              description: "Structured Bible reading plans and devotionals",
              status: "Active",
              icon: <BookOpen className="w-4 h-4" />,
              details: ["Multiple reading plans", "Daily verses and reflections", "Progress tracking", "Reading streaks and achievements"]
            },
            {
              name: "Audio Bible",
              description: "Listen to scripture on the go",
              status: "Active",
              icon: <Volume2 className="w-4 h-4" />,
              details: ["Multiple Bible versions", "Professional narration", "Download for offline listening", "Playback speed control"]
            },
            {
              name: "Devotional Routines",
              description: "Guided spiritual practices and meditations",
              status: "Active",
              icon: <Headphones className="w-4 h-4" />,
              details: ["Morning and evening routines", "Guided prayers", "Meditation sessions", "Custom routine builder"]
            },
            {
              name: "Video Library",
              description: "Educational and inspirational video content",
              status: "Active",
              icon: <PlayCircle className="w-4 h-4" />,
              details: ["Sermons and teachings", "Biblical documentaries", "Worship music videos", "Personal testimony stories"]
            },
            {
              name: "Mood Check-ins",
              description: "Track spiritual and emotional wellness",
              status: "Beta",
              icon: <Activity className="w-4 h-4" />,
              details: ["Daily mood tracking", "Spiritual health metrics", "Personalized content recommendations", "Prayer and support suggestions"]
            }
          ]
        },
        {
          name: "Personal Management",
          description: "Manage your profile and giving",
          icon: <User className="w-5 h-5" />,
          features: [
            {
              name: "Profile Management",
              description: "Customize your community presence",
              status: "Active",
              icon: <User className="w-4 h-4" />,
              details: ["Personal information", "Privacy settings", "Ministry interests", "Connection preferences"]
            },
            {
              name: "Donations & Giving",
              description: "Support your church and ministries",
              status: "Active",
              icon: <DollarSign className="w-4 h-4" />,
              details: ["One-time and recurring donations", "Multiple payment methods", "Giving history and receipts", "Special campaign support"]
            },
            {
              name: "Two-Factor Authentication",
              description: "Secure your account with enhanced protection",
              status: "Active",
              icon: <Shield className="w-4 h-4" />,
              details: ["SMS verification", "Authenticator app support", "Backup codes", "Account security monitoring"]
            }
          ]
        }
      ]
    },
    {
      name: "Church Administration",
      description: "Comprehensive tools for church staff and leadership",
      color: "bg-purple-500",
      categories: [
        {
          name: "Member Management",
          description: "Manage church community and membership",
          icon: <Users className="w-5 h-5" />,
          features: [
            {
              name: "Member Directory",
              description: "Comprehensive member database management",
              status: "Active",
              icon: <Users className="w-4 h-4" />,
              details: ["Member profiles and contact info", "Family groupings", "Attendance tracking", "Member engagement metrics"]
            },
            {
              name: "Role Management",
              description: "Assign and manage user permissions",
              status: "Active",
              icon: <UserCog className="w-4 h-4" />,
              details: ["Custom role creation", "Permission assignments", "Staff and volunteer roles", "Access level controls"]
            },
            {
              name: "Volunteer Coordination",
              description: "Organize and schedule volunteers",
              status: "Beta",
              icon: <Award className="w-4 h-4" />,
              details: ["Volunteer signup sheets", "Skill-based matching", "Schedule management", "Recognition and rewards"]
            }
          ]
        },
        {
          name: "Communication",
          description: "Reach and engage your congregation",
          icon: <Mail className="w-5 h-5" />,
          features: [
            {
              name: "Mass Communication",
              description: "Send announcements to your congregation",
              status: "Active",
              icon: <Mail className="w-4 h-4" />,
              details: ["Email campaigns", "SMS notifications", "Push notifications", "Targeted messaging by groups"]
            },
            {
              name: "Event Management",
              description: "Create and manage church events",
              status: "Active",
              icon: <Calendar className="w-4 h-4" />,
              details: ["Event creation and promotion", "Registration management", "Attendance tracking", "Event feedback collection"]
            },
            {
              name: "Prayer Request Management",
              description: "Moderate and respond to prayer needs",
              status: "Active",
              icon: <Heart className="w-4 h-4" />,
              details: ["Prayer request moderation", "Pastoral response tools", "Prayer circle management", "Confidential prayer handling"]
            }
          ]
        },
        {
          name: "Analytics & Reporting",
          description: "Insights into church health and growth",
          icon: <BarChart className="w-5 h-5" />,
          features: [
            {
              name: "Engagement Analytics",
              description: "Track member participation and engagement",
              status: "Active",
              icon: <TrendingUp className="w-4 h-4" />,
              details: ["Member activity metrics", "Event attendance trends", "App usage statistics", "Spiritual growth indicators"]
            },
            {
              name: "Donation Tracking",
              description: "Monitor giving patterns and campaigns",
              status: "Active",
              icon: <DollarSign className="w-4 h-4" />,
              details: ["Giving analytics", "Campaign performance", "Donor engagement", "Financial reporting tools"]
            },
            {
              name: "Growth Metrics",
              description: "Track church growth and outreach effectiveness",
              status: "Beta",
              icon: <BarChart className="w-4 h-4" />,
              details: ["Membership growth trends", "Visitor conversion rates", "Ministry effectiveness", "Community impact metrics"]
            }
          ]
        },
        {
          name: "Content Management",
          description: "Manage church resources and media",
          icon: <FileText className="w-5 h-5" />,
          features: [
            {
              name: "Sermon Library",
              description: "Upload and organize sermon content",
              status: "Active",
              icon: <Video className="w-4 h-4" />,
              details: ["Video and audio uploads", "Sermon series organization", "Search and categorization", "Member access controls"]
            },
            {
              name: "Bible Study Materials",
              description: "Create and share study resources",
              status: "Beta",
              icon: <BookOpen className="w-4 h-4" />,
              details: ["Study guide creation", "Resource sharing", "Discussion facilitation", "Progress tracking"]
            },
            {
              name: "Worship Resources",
              description: "Manage music and worship materials",
              status: "Coming Soon",
              icon: <Music className="w-4 h-4" />,
              details: ["Song library management", "Worship planning tools", "Lyric display system", "Music licensing tracking"]
            }
          ]
        },
        {
          name: "AI-Powered Pastoral Tools",
          description: "Intelligent sermon creation and content distribution",
          icon: <Zap className="w-5 h-5" />,
          features: [
            {
              name: "Sermon Creation Studio",
              description: "AI-powered sermon preparation with biblical research",
              status: "Active",
              icon: <BookOpen className="w-4 h-4" />,
              details: ["Biblical research assistant with commentary", "Intelligent sermon outliner", "Illustration library with relevance scoring", "Content enhancer for theological accuracy"]
            },
            {
              name: "Content Distribution Hub",
              description: "Transform sermons into multi-platform content",
              status: "Active",
              icon: <Share2 className="w-4 h-4" />,
              details: ["Social media posts for Facebook, Twitter, Instagram", "Email newsletters and campaigns", "Small group study guides", "Church bulletin inserts"]
            },
            {
              name: "Engagement Analytics Dashboard",
              description: "Track sermon effectiveness and congregation response",
              status: "Active",
              icon: <BarChart className="w-4 h-4" />,
              details: ["Real-time engagement metrics", "Feedback sentiment analysis", "AI-generated insights and recommendations", "Performance trends and optimization"]
            },
            {
              name: "AI Personalization",
              description: "Intelligent content recommendations",
              status: "Beta",
              icon: <Star className="w-4 h-4" />,
              details: ["Personalized content delivery", "Smart event recommendations", "Optimal communication timing", "Ministry matching algorithms"]
            },
            {
              name: "Multi-language Support",
              description: "Serve diverse communities",
              status: "Coming Soon",
              icon: <Globe className="w-4 h-4" />,
              details: ["Content translation", "Multi-language interfaces", "Cultural adaptation", "Global community features"]
            },
            {
              name: "Mobile Optimization",
              description: "Enhanced mobile experience",
              status: "Active",
              icon: <Smartphone className="w-4 h-4" />,
              details: ["Native mobile features", "Offline capability", "Push notifications", "Location-based services"]
            }
          ]
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Beta':
        return 'bg-yellow-100 text-yellow-800';
      case 'Coming Soon':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          SoapBox Super App - Feature Catalog
        </h1>
        <p className="text-lg text-gray-600">
          Comprehensive overview of all platform features organized by user type and functionality
        </p>
      </div>

      {featureGroups.map((group) => (
        <Card key={group.name} className="border-2">
          <Collapsible
            open={expandedGroups[group.name.toLowerCase().replace(' ', '_')]}
            onOpenChange={() => toggleGroup(group.name.toLowerCase().replace(' ', '_'))}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${group.color} rounded-lg flex items-center justify-center text-white`}>
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{group.name}</CardTitle>
                      <p className="text-gray-600">{group.description}</p>
                    </div>
                  </div>
                  {expandedGroups[group.name.toLowerCase().replace(' ', '_')] ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0 space-y-6">
                {group.categories.map((category) => (
                  <Card key={category.name} className="border border-gray-200">
                    <Collapsible
                      open={expandedCategories[`${group.name}_${category.name}`]}
                      onOpenChange={() => toggleCategory(`${group.name}_${category.name}`)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                {category.icon}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{category.name}</h3>
                                <p className="text-sm text-gray-600">{category.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{category.features.length} features</Badge>
                              {expandedCategories[`${group.name}_${category.name}`] ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="grid gap-4">
                            {category.features.map((feature) => (
                              <div key={feature.name} className="border border-gray-100 rounded-lg p-4 bg-white">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 text-gray-600">
                                      {feature.icon}
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900">{feature.name}</h4>
                                      <p className="text-sm text-gray-600">{feature.description}</p>
                                    </div>
                                  </div>
                                  <Badge className={getStatusColor(feature.status)}>
                                    {feature.status}
                                  </Badge>
                                </div>
                                
                                {feature.details && (
                                  <div className="mt-3 pl-9">
                                    <ul className="text-xs text-gray-500 space-y-1">
                                      {feature.details.map((detail, idx) => (
                                        <li key={idx} className="flex items-center">
                                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                          {detail}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Feature Development Status
          </h3>
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Active - Fully functional</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span>Beta - Testing phase</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
              <span>Coming Soon - In development</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}