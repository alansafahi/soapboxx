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
  Activity, BarChart, FileText, Camera, Video, Music, Target,
  PieChart, Clock, ThumbsUp, Share, Megaphone, Eye, CheckCircle,
  Lightbulb, Mic, Clipboard, Handshake, CreditCard, Lock,
  Monitor, Palette, Wifi, Radio, Building, Phone
} from "lucide-react";

interface Feature {
  name: string;
  description: string;
  businessValue: string;
  implementation: string;
  priority: 'High' | 'Medium' | 'Low';
  timeline: string;
  roi: string;
  icon: React.ReactNode;
}

interface RoleCategory {
  name: string;
  description: string;
  icon: React.ReactNode;
  features: Feature[];
}

interface ChurchRole {
  name: string;
  description: string;
  painPoints: string[];
  color: string;
  categories: RoleCategory[];
}

export default function RoleSpecificFeatures() {
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({
    'church_admin': true,
    'lead_pastor': false,
    'social_media': false,
    'church_staff': false
  });
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleRole = (roleId: string) => {
    setExpandedRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const churchRoles: ChurchRole[] = [
    {
      name: "Church Administrators",
      description: "Operations managers who oversee church business functions, member management, and facility coordination",
      painPoints: [
        "Managing member databases across multiple systems",
        "Coordinating volunteer schedules and communications",
        "Tracking attendance and engagement metrics",
        "Processing donations and financial reporting",
        "Maintaining security and data privacy compliance"
      ],
      color: "bg-blue-600",
      categories: [
        {
          name: "Member Database & CRM",
          description: "Comprehensive member management with advanced analytics",
          icon: <Database className="w-5 h-5" />,
          features: [
            {
              name: "Advanced Member Profiles",
              description: "Complete member lifecycle management with family groupings, attendance history, and engagement scoring",
              businessValue: "Reduces administrative overhead by 60% and improves member retention through better tracking",
              implementation: "Enhanced database schema with automated data collection and smart categorization",
              priority: "High",
              timeline: "2-3 weeks",
              roi: "40% reduction in admin time, 25% improvement in member engagement",
              icon: <Users className="w-4 h-4" />
            },
            {
              name: "Automated Attendance Tracking",
              description: "QR code check-ins, event tracking, and pattern analysis with predictive insights",
              businessValue: "Identifies at-risk members and provides early intervention opportunities",
              implementation: "Mobile QR scanning, geofence detection, and AI-powered attendance analytics",
              priority: "High",
              timeline: "3-4 weeks",
              roi: "30% better member retention through early intervention",
              icon: <CheckCircle className="w-4 h-4" />
            },
            {
              name: "Smart Member Segmentation",
              description: "AI-powered member categorization for targeted communications and ministry matching",
              businessValue: "Improves ministry placement accuracy by 50% and increases volunteer participation",
              implementation: "Machine learning algorithms analyzing engagement patterns and preferences",
              priority: "Medium",
              timeline: "4-5 weeks",
              roi: "35% increase in ministry participation rates",
              icon: <Target className="w-4 h-4" />
            }
          ]
        },
        {
          name: "Financial Management & Reporting",
          description: "Comprehensive donation tracking and financial analytics",
          icon: <PieChart className="w-5 h-5" />,
          features: [
            {
              name: "Real-time Giving Dashboard",
              description: "Live donation tracking with campaign performance, donor analytics, and tax reporting automation",
              businessValue: "Increases giving transparency and enables data-driven stewardship decisions",
              implementation: "Integrated payment processing with automated receipt generation and tax documentation",
              priority: "High",
              timeline: "2-3 weeks",
              roi: "20% increase in overall giving through better visibility and engagement",
              icon: <TrendingUp className="w-4 h-4" />
            },
            {
              name: "Donor Engagement Analytics",
              description: "Predictive modeling for donor retention and giving pattern analysis",
              businessValue: "Identifies major gift opportunities and prevents donor churn",
              implementation: "AI algorithms analyzing giving history, engagement, and communication preferences",
              priority: "Medium",
              timeline: "3-4 weeks",
              roi: "15% increase in donor retention and 25% improvement in major gift identification",
              icon: <Heart className="w-4 h-4" />
            },
            {
              name: "Automated Financial Reporting",
              description: "One-click generation of financial statements, budget variance reports, and compliance documentation",
              businessValue: "Reduces month-end closing time from days to hours",
              implementation: "Template-based reporting with automated data aggregation and formatting",
              priority: "Medium",
              timeline: "2-3 weeks",
              roi: "75% reduction in financial reporting time",
              icon: <FileText className="w-4 h-4" />
            }
          ]
        },
        {
          name: "Volunteer Coordination",
          description: "Streamlined volunteer management and scheduling",
          icon: <Handshake className="w-5 h-5" />,
          features: [
            {
              name: "Smart Volunteer Matching",
              description: "AI-powered volunteer placement based on skills, availability, and ministry needs",
              businessValue: "Increases volunteer satisfaction and reduces coordinator workload by 50%",
              implementation: "Skills assessment, availability calendars, and intelligent recommendation engine",
              priority: "High",
              timeline: "3-4 weeks",
              roi: "40% improvement in volunteer retention and placement accuracy",
              icon: <Award className="w-4 h-4" />
            },
            {
              name: "Automated Scheduling System",
              description: "Self-service volunteer signup with conflict detection and reminder notifications",
              businessValue: "Eliminates scheduling conflicts and reduces last-minute cancellations",
              implementation: "Calendar integration with automated notifications and substitute finder",
              priority: "High",
              timeline: "2-3 weeks",
              roi: "60% reduction in scheduling conflicts and coordinator time",
              icon: <Calendar className="w-4 h-4" />
            },
            {
              name: "Volunteer Recognition Platform",
              description: "Automated milestone tracking and recognition system with achievement badges",
              businessValue: "Increases volunteer engagement and long-term commitment",
              implementation: "Gamification system with automated recognition and celebration features",
              priority: "Low",
              timeline: "2-3 weeks",
              roi: "30% increase in volunteer engagement and retention",
              icon: <Star className="w-4 h-4" />
            }
          ]
        }
      ]
    },
    {
      name: "Lead Pastors & Senior Pastors",
      description: "Spiritual leaders focused on congregational care, vision casting, and church growth strategy",
      painPoints: [
        "Limited visibility into congregational spiritual health",
        "Difficulty tracking pastoral care needs across large congregations",
        "Time-consuming sermon preparation and resource management",
        "Lack of data-driven insights for strategic decision making",
        "Balancing administrative duties with pastoral care"
      ],
      color: "bg-purple-600",
      categories: [
        {
          name: "Congregational Health Analytics",
          description: "Deep insights into spiritual growth and community engagement",
          icon: <Activity className="w-5 h-5" />,
          features: [
            {
              name: "Spiritual Health Dashboard",
              description: "Comprehensive view of congregation's spiritual metrics including prayer requests, Bible engagement, and ministry participation",
              businessValue: "Enables data-driven pastoral decisions and identifies spiritual growth opportunities",
              implementation: "Analytics engine aggregating spiritual activities with trend analysis and alerts",
              priority: "High",
              timeline: "3-4 weeks",
              roi: "50% improvement in pastoral care effectiveness and member spiritual growth tracking",
              icon: <Heart className="w-4 h-4" />
            },
            {
              name: "Member Care Prioritization",
              description: "AI-powered system identifying members needing pastoral attention based on engagement patterns",
              businessValue: "Ensures no member falls through cracks and optimizes pastoral time allocation",
              implementation: "Predictive algorithms analyzing attendance, giving, and participation patterns",
              priority: "High",
              timeline: "4-5 weeks",
              roi: "40% improvement in pastoral care coverage and member satisfaction",
              icon: <Target className="w-4 h-4" />
            },
            {
              name: "Church Growth Analytics",
              description: "Strategic insights into church growth patterns, visitor conversion, and ministry effectiveness",
              businessValue: "Provides data foundation for strategic planning and ministry resource allocation",
              implementation: "Growth tracking with cohort analysis and ministry ROI measurement",
              priority: "Medium",
              timeline: "3-4 weeks",
              roi: "25% improvement in strategic decision accuracy and ministry effectiveness",
              icon: <TrendingUp className="w-4 h-4" />
            }
          ]
        },
        {
          name: "Sermon & Teaching Tools",
          description: "Enhanced content creation and delivery systems",
          icon: <Mic className="w-5 h-5" />,
          features: [
            {
              name: "AI-Powered Sermon Assistant",
              description: "Intelligent research tool providing biblical commentary, illustration suggestions, and outline generation",
              businessValue: "Reduces sermon prep time by 40% while improving content quality and biblical depth",
              implementation: "OpenAI integration with biblical database and illustration library",
              priority: "High",
              timeline: "4-5 weeks",
              roi: "6 hours saved per week in sermon preparation, improved sermon engagement",
              icon: <Lightbulb className="w-4 h-4" />
            },
            {
              name: "Multimedia Sermon Library",
              description: "Organized archive of sermons with AI-powered tagging, search, and content recommendations",
              businessValue: "Enables content reuse and provides foundation for teaching series development",
              implementation: "Video/audio processing with automated transcription and intelligent categorization",
              priority: "Medium",
              timeline: "3-4 weeks",
              roi: "30% faster content development and improved resource accessibility",
              icon: <Video className="w-4 h-4" />
            },
            {
              name: "Congregation Feedback System",
              description: "Real-time sermon feedback and engagement tracking with anonymous input options",
              businessValue: "Improves preaching effectiveness and identifies topics of high congregational interest",
              implementation: "Mobile-friendly feedback forms with sentiment analysis and trend tracking",
              priority: "Low",
              timeline: "2-3 weeks",
              roi: "20% improvement in sermon engagement and pastoral effectiveness",
              icon: <ThumbsUp className="w-4 h-4" />
            }
          ]
        },
        {
          name: "Strategic Leadership Tools",
          description: "Executive-level insights for church leadership and vision casting",
          icon: <Building className="w-5 h-5" />,
          features: [
            {
              name: "Leadership Dashboard",
              description: "Executive summary of key church metrics including growth, engagement, finances, and ministry health",
              businessValue: "Enables informed leadership decisions and board reporting with confidence",
              implementation: "Executive-level reporting with key performance indicators and trend analysis",
              priority: "High",
              timeline: "2-3 weeks",
              roi: "Improved leadership decision quality and 50% faster board meeting preparation",
              icon: <BarChart className="w-4 h-4" />
            },
            {
              name: "Vision Tracking System",
              description: "Progress monitoring for church vision initiatives with milestone tracking and impact measurement",
              businessValue: "Ensures vision implementation stays on track and demonstrates progress to stakeholders",
              implementation: "Goal setting framework with automated progress tracking and reporting",
              priority: "Medium",
              timeline: "3-4 weeks",
              roi: "40% improvement in vision implementation success rate",
              icon: <Eye className="w-4 h-4" />
            }
          ]
        }
      ]
    },
    {
      name: "Social Media Managers",
      description: "Digital evangelists responsible for online presence, content creation, and community engagement",
      painPoints: [
        "Creating consistent, engaging spiritual content across platforms",
        "Managing multiple social media accounts efficiently",
        "Measuring spiritual impact of digital outreach",
        "Coordinating content calendar with church events",
        "Growing online community while maintaining authentic engagement"
      ],
      color: "bg-pink-600",
      categories: [
        {
          name: "Content Creation & Management",
          description: "AI-powered content generation and scheduling tools",
          icon: <Palette className="w-5 h-5" />,
          features: [
            {
              name: "AI Content Generator",
              description: "Automated creation of social media posts, graphics, and video content based on sermons and biblical themes",
              businessValue: "Reduces content creation time by 70% while maintaining theological accuracy",
              implementation: "OpenAI integration with biblical content database and branded template system",
              priority: "High",
              timeline: "4-5 weeks",
              roi: "15 hours saved per week, 200% increase in content output quality",
              icon: <Zap className="w-4 h-4" />
            },
            {
              name: "Multi-Platform Scheduler",
              description: "Unified posting system optimized for each platform's best practices and timing",
              businessValue: "Maximizes reach and engagement while reducing manual posting time",
              implementation: "Social media API integration with platform-specific optimization",
              priority: "High",
              timeline: "3-4 weeks",
              roi: "50% improvement in engagement rates, 80% time savings on posting",
              icon: <Clock className="w-4 h-4" />
            },
            {
              name: "Visual Content Studio",
              description: "Template-based graphic design tool with church branding and biblical imagery library",
              businessValue: "Maintains brand consistency while enabling rapid visual content creation",
              implementation: "Design tool integration with branded templates and stock imagery",
              priority: "Medium",
              timeline: "3-4 weeks",
              roi: "60% faster graphic creation, improved brand consistency",
              icon: <Camera className="w-4 h-4" />
            }
          ]
        },
        {
          name: "Engagement & Analytics",
          description: "Community building and performance measurement tools",
          icon: <TrendingUp className="w-5 h-5" />,
          features: [
            {
              name: "Social Listening Dashboard",
              description: "Monitor mentions, hashtags, and community conversations across all platforms",
              businessValue: "Identifies engagement opportunities and potential pastoral care needs in digital space",
              implementation: "Social media monitoring with sentiment analysis and alert system",
              priority: "High",
              timeline: "3-4 weeks",
              roi: "40% improvement in community engagement and crisis prevention",
              icon: <Search className="w-4 h-4" />
            },
            {
              name: "Digital Discipleship Tracking",
              description: "Measure spiritual engagement through online Bible studies, prayer requests, and faith discussions",
              businessValue: "Quantifies digital ministry impact and identifies online discipleship opportunities",
              implementation: "Engagement analytics with spiritual growth indicators and conversion tracking",
              priority: "Medium",
              timeline: "4-5 weeks",
              roi: "30% increase in online-to-offline ministry conversion",
              icon: <BookOpen className="w-4 h-4" />
            },
            {
              name: "Influencer Partnership Manager",
              description: "Identify and collaborate with faith-based content creators and church members with large followings",
              businessValue: "Expands reach through authentic partnerships and member advocacy",
              implementation: "Influencer discovery tool with collaboration workflow and impact tracking",
              priority: "Low",
              timeline: "2-3 weeks",
              roi: "50% increase in organic reach through partnerships",
              icon: <Megaphone className="w-4 h-4" />
            }
          ]
        },
        {
          name: "Event Promotion & Live Streaming",
          description: "Digital event management and broadcast capabilities",
          icon: <Radio className="w-5 h-5" />,
          features: [
            {
              name: "Live Streaming Studio",
              description: "Professional broadcasting setup with multi-camera support, graphics overlay, and chat moderation",
              businessValue: "Extends church reach to homebound members and attracts digital-first visitors",
              implementation: "Streaming platform integration with production tools and interactive features",
              priority: "High",
              timeline: "5-6 weeks",
              roi: "300% increase in service attendance through online participation",
              icon: <Monitor className="w-4 h-4" />
            },
            {
              name: "Event Amplification System",
              description: "Automated promotion campaigns for church events across all social platforms",
              businessValue: "Increases event attendance and community awareness through consistent promotion",
              implementation: "Event management integration with automated social media campaign generation",
              priority: "Medium",
              timeline: "3-4 weeks",
              roi: "40% increase in event attendance and engagement",
              icon: <Megaphone className="w-4 h-4" />
            }
          ]
        }
      ]
    },
    {
      name: "Church Staff",
      description: "Ministry coordinators, administrative assistants, and support staff managing daily operations",
      painPoints: [
        "Juggling multiple communication channels and tools",
        "Coordinating events and volunteer schedules manually",
        "Lack of unified system for member information",
        "Time-consuming administrative tasks",
        "Difficulty accessing information when working remotely"
      ],
      color: "bg-green-600",
      categories: [
        {
          name: "Unified Communication Hub",
          description: "Centralized communication and collaboration platform",
          icon: <MessageSquare className="w-5 h-5" />,
          features: [
            {
              name: "Staff Communication Center",
              description: "Internal messaging system with department channels, task assignments, and priority alerts",
              businessValue: "Improves staff coordination and reduces communication gaps by 60%",
              implementation: "Team messaging platform with role-based channels and notification management",
              priority: "High",
              timeline: "2-3 weeks",
              roi: "4 hours saved per week per staff member, improved project coordination",
              icon: <MessageSquare className="w-4 h-4" />
            },
            {
              name: "Member Contact System",
              description: "Integrated phone, email, and text messaging with conversation history and follow-up tracking",
              businessValue: "Ensures consistent member communication and prevents duplicate outreach",
              implementation: "Unified communication platform with member interaction history",
              priority: "High",
              timeline: "3-4 weeks",
              roi: "50% improvement in member communication efficiency",
              icon: <Phone className="w-4 h-4" />
            },
            {
              name: "Digital Resource Library",
              description: "Searchable repository of forms, templates, procedures, and training materials",
              businessValue: "Reduces new staff training time and ensures consistency in procedures",
              implementation: "Document management system with search functionality and version control",
              priority: "Medium",
              timeline: "2-3 weeks",
              roi: "40% reduction in training time and improved procedure compliance",
              icon: <FileText className="w-4 h-4" />
            }
          ]
        },
        {
          name: "Event & Ministry Coordination",
          description: "Streamlined planning and execution tools",
          icon: <Calendar className="w-5 h-5" />,
          features: [
            {
              name: "Event Planning Workflow",
              description: "Step-by-step event management with automated task assignments and deadline tracking",
              businessValue: "Ensures nothing falls through cracks and reduces event planning stress",
              implementation: "Workflow automation with task templates and progress tracking",
              priority: "High",
              timeline: "3-4 weeks",
              roi: "50% reduction in event planning time and improved success rate",
              icon: <Clipboard className="w-4 h-4" />
            },
            {
              name: "Resource Booking System",
              description: "Equipment, room, and vehicle reservation system with conflict prevention",
              businessValue: "Eliminates double-bookings and ensures optimal resource utilization",
              implementation: "Reservation system with calendar integration and automated confirmations",
              priority: "Medium",
              timeline: "2-3 weeks",
              roi: "70% reduction in scheduling conflicts and resource waste",
              icon: <Building className="w-4 h-4" />
            },
            {
              name: "Vendor Management Portal",
              description: "Centralized vendor information, contracts, and payment tracking",
              businessValue: "Streamlines vendor relationships and ensures timely payments",
              implementation: "Vendor database with contract management and payment automation",
              priority: "Low",
              timeline: "2-3 weeks",
              roi: "30% improvement in vendor relationship management",
              icon: <Handshake className="w-4 h-4" />
            }
          ]
        },
        {
          name: "Mobile Productivity Tools",
          description: "On-the-go access and task management",
          icon: <Smartphone className="w-5 h-5" />,
          features: [
            {
              name: "Mobile Member Directory",
              description: "Complete member information accessible via mobile with offline capability",
              businessValue: "Enables effective ministry even when away from office or during events",
              implementation: "Mobile app with offline sync and secure member data access",
              priority: "High",
              timeline: "4-5 weeks",
              roi: "Improved member care and staff flexibility",
              icon: <Users className="w-4 h-4" />
            },
            {
              name: "Task Management System",
              description: "Personal and team task tracking with deadline alerts and priority management",
              businessValue: "Ensures important tasks don't get forgotten and improves productivity",
              implementation: "Task management with mobile notifications and team collaboration",
              priority: "Medium",
              timeline: "2-3 weeks",
              roi: "25% improvement in task completion rate and deadline adherence",
              icon: <CheckCircle className="w-4 h-4" />
            },
            {
              name: "Emergency Communication",
              description: "Rapid alert system for urgent church communications and crisis management",
              businessValue: "Ensures rapid response during emergencies and critical situations",
              implementation: "Push notification system with priority levels and confirmation tracking",
              priority: "Medium",
              timeline: "2-3 weeks",
              roi: "Critical for emergency response and crisis management",
              icon: <Bell className="w-4 h-4" />
            }
          ]
        }
      ]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Role-Specific Value Enhancement Plan
        </h1>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          Targeted feature enhancements designed to maximize value for specific church leadership roles. 
          Each feature includes business value analysis, implementation approach, and ROI projections.
        </p>
      </div>

      {churchRoles.map((role) => (
        <Card key={role.name} className="border-2">
          <Collapsible
            open={expandedRoles[role.name.toLowerCase().replace(/[^a-z0-9]/g, '_')]}
            onOpenChange={() => toggleRole(role.name.toLowerCase().replace(/[^a-z0-9]/g, '_'))}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${role.color} rounded-lg flex items-center justify-center text-white`}>
                      <UserCog className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-xl">{role.name}</CardTitle>
                      <p className="text-gray-600">{role.description}</p>
                    </div>
                  </div>
                  {expandedRoles[role.name.toLowerCase().replace(/[^a-z0-9]/g, '_')] ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0 space-y-6">
                {/* Pain Points Section */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">Current Pain Points:</h3>
                  <ul className="text-sm text-red-800 space-y-1">
                    {role.painPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Feature Categories */}
                {role.categories.map((category) => (
                  <Card key={category.name} className="border border-gray-200">
                    <Collapsible
                      open={expandedCategories[`${role.name}_${category.name}`]}
                      onOpenChange={() => toggleCategory(`${role.name}_${category.name}`)}
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
                              {expandedCategories[`${role.name}_${category.name}`] ? (
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
                          <div className="grid gap-6">
                            {category.features.map((feature) => (
                              <div key={feature.name} className="border border-gray-100 rounded-lg p-6 bg-white">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 text-gray-600 flex items-center justify-center">
                                      {feature.icon}
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-lg text-gray-900">{feature.name}</h4>
                                      <p className="text-sm text-gray-600">{feature.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Badge className={getPriorityColor(feature.priority)}>
                                      {feature.priority}
                                    </Badge>
                                    <Badge variant="outline">{feature.timeline}</Badge>
                                  </div>
                                </div>
                                
                                <div className="grid md:grid-cols-3 gap-4 mt-4">
                                  <div className="bg-blue-50 p-3 rounded-lg">
                                    <h5 className="font-medium text-blue-900 mb-1">Business Value</h5>
                                    <p className="text-xs text-blue-800">{feature.businessValue}</p>
                                  </div>
                                  <div className="bg-green-50 p-3 rounded-lg">
                                    <h5 className="font-medium text-green-900 mb-1">ROI Expected</h5>
                                    <p className="text-xs text-green-800">{feature.roi}</p>
                                  </div>
                                  <div className="bg-purple-50 p-3 rounded-lg">
                                    <h5 className="font-medium text-purple-900 mb-1">Implementation</h5>
                                    <p className="text-xs text-purple-800">{feature.implementation}</p>
                                  </div>
                                </div>
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

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Implementation Priority Framework
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold">H</span>
              </div>
              <h4 className="font-semibold mb-2">High Priority</h4>
              <p className="text-gray-600">Core functionality that directly addresses major pain points and provides immediate ROI</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold">M</span>
              </div>
              <h4 className="font-semibold mb-2">Medium Priority</h4>
              <p className="text-gray-600">Enhanced features that improve efficiency and provide competitive advantages</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold">L</span>
              </div>
              <h4 className="font-semibold mb-2">Low Priority</h4>
              <p className="text-gray-600">Nice-to-have features that provide additional value and user satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}