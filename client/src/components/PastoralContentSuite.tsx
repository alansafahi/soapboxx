import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, ChevronRight, BookOpen, Mic, Video, Edit3, 
  Search, Brain, Calendar, Share2, Download, Upload,
  Lightbulb, FileText, MessageSquare, Users, Clock,
  Target, TrendingUp, Zap, Star, Globe, Smartphone,
  Settings, Database, Camera, Music, Headphones, Radio,
  Mail, Bell, Eye, CheckCircle, BarChart, PieChart,
  Layers, Workflow, Scissors, Palette, Archive
} from "lucide-react";

interface ContentFeature {
  name: string;
  description: string;
  businessValue: string;
  technicalDetails: string;
  timesSaved: string;
  roi: string;
  priority: 'Critical' | 'High' | 'Medium';
  timeline: string;
  icon: React.ReactNode;
  capabilities: string[];
}

interface ContentCategory {
  name: string;
  description: string;
  icon: React.ReactNode;
  features: ContentFeature[];
}

export default function PastoralContentSuite() {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'sermon_creation': true,
    'content_distribution': false,
    'engagement_analytics': false,
    'resource_management': false,
    'collaborative_tools': false
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const contentCategories: ContentCategory[] = [
    {
      name: "AI-Powered Sermon Creation Studio",
      description: "Comprehensive sermon development platform with biblical research, outline generation, and content enhancement",
      icon: <Edit3 className="w-6 h-6" />,
      features: [
        {
          name: "Biblical Research Assistant",
          description: "AI-powered biblical commentary aggregation with cross-reference suggestions and theological insights",
          businessValue: "Reduces research time by 75% while ensuring theological accuracy and depth",
          technicalDetails: "Integration with multiple biblical databases, commentaries, and theological resources using semantic search and AI analysis",
          timesSaved: "4-6 hours per sermon",
          roi: "6-8 hours weekly time savings allowing focus on pastoral care and leadership",
          priority: "Critical",
          timeline: "4-5 weeks",
          icon: <Search className="w-4 h-4" />,
          capabilities: [
            "Multi-version biblical text comparison",
            "Historical and cultural context analysis",
            "Cross-reference mapping with relevance scoring",
            "Theological commentary synthesis",
            "Hebrew/Greek word study integration",
            "Denominational perspective filtering"
          ]
        },
        {
          name: "Intelligent Sermon Outliner",
          description: "AI generates structured sermon outlines based on biblical text, theme, or liturgical calendar",
          businessValue: "Transforms blank page paralysis into structured foundation for powerful preaching",
          technicalDetails: "Natural language processing analyzing sermon structure patterns and biblical narrative flow",
          timesSaved: "2-3 hours per sermon outline",
          roi: "Consistent sermon quality with 60% faster preparation",
          priority: "Critical",
          timeline: "3-4 weeks",
          icon: <Lightbulb className="w-4 h-4" />,
          capabilities: [
            "Three-point sermon structures",
            "Expository preaching frameworks",
            "Topical sermon organization",
            "Liturgical season alignment",
            "Scripture passage flow analysis",
            "Audience engagement checkpoints"
          ]
        },
        {
          name: "Illustration & Story Library",
          description: "Curated database of sermon illustrations, personal stories, and real-world applications with smart matching",
          businessValue: "Enhances sermon memorability and practical application through relevant, engaging content",
          technicalDetails: "AI-powered content matching based on sermon theme, biblical text, and congregation demographics",
          timesSaved: "1-2 hours finding relevant illustrations",
          roi: "40% improvement in sermon engagement and retention",
          priority: "High",
          timeline: "3-4 weeks",
          icon: <MessageSquare className="w-4 h-4" />,
          capabilities: [
            "Theme-based illustration matching",
            "Personal story template library",
            "Current events integration",
            "Cultural relevance scoring",
            "Age-appropriate content filtering",
            "Copyright-cleared material sourcing"
          ]
        },
        {
          name: "Sermon Content Enhancer",
          description: "AI review and enhancement suggestions for clarity, flow, theological accuracy, and engagement",
          businessValue: "Elevates sermon quality through objective analysis and improvement recommendations",
          technicalDetails: "Natural language analysis evaluating sermon structure, clarity metrics, and engagement factors",
          timesSaved: "1-2 hours in revision and editing",
          roi: "30% improvement in sermon clarity and congregation feedback",
          priority: "High",
          timeline: "4-5 weeks",
          icon: <Star className="w-4 h-4" />,
          capabilities: [
            "Readability and clarity analysis",
            "Theological accuracy verification",
            "Engagement factor assessment",
            "Transition flow optimization",
            "Call-to-action effectiveness",
            "Length and pacing recommendations"
          ]
        }
      ]
    },
    {
      name: "Multi-Channel Content Distribution",
      description: "Automated content adaptation and distribution across multiple platforms and formats",
      icon: <Share2 className="w-6 h-6" />,
      features: [
        {
          name: "Adaptive Content Generator",
          description: "Automatically transforms sermon content into multiple formats: social posts, devotionals, blog articles, and newsletters",
          businessValue: "Maximizes content ROI by reaching different audience segments with optimized messaging",
          technicalDetails: "AI content adaptation engine creating platform-specific versions while maintaining core theological message",
          timesSaved: "6-8 hours weekly in content creation",
          roi: "300% increase in content output with consistent messaging across channels",
          priority: "Critical",
          timeline: "5-6 weeks",
          icon: <Layers className="w-4 h-4" />,
          capabilities: [
            "Social media post generation (Instagram, Facebook, Twitter)",
            "Email newsletter content creation",
            "Blog article adaptation",
            "Devotional series development",
            "Study guide generation",
            "Bulletin insert creation"
          ]
        },
        {
          name: "Professional Video Production Suite",
          description: "Automated video editing, graphics generation, and multi-platform optimization for sermon content",
          businessValue: "Creates professional-quality video content without technical expertise or expensive equipment",
          technicalDetails: "AI-powered video editing with automated scene detection, graphics overlay, and platform optimization",
          timesSaved: "4-6 hours per video production",
          roi: "200% increase in video engagement with 80% reduction in production time",
          priority: "High",
          timeline: "6-8 weeks",
          icon: <Video className="w-4 h-4" />,
          capabilities: [
            "Automated sermon video editing",
            "Dynamic graphics and lower thirds",
            "Scripture overlay synchronization",
            "Platform-specific formatting (YouTube, Instagram, TikTok)",
            "Accessibility features (captions, transcripts)",
            "Thumbnail generation and optimization"
          ]
        },
        {
          name: "Podcast & Audio Distribution",
          description: "Automated audio processing, episode creation, and distribution to major podcast platforms",
          businessValue: "Expands reach to audio-first audiences with minimal additional effort",
          technicalDetails: "Audio processing pipeline with noise reduction, level normalization, and automated publishing",
          timesSaved: "2-3 hours per podcast episode",
          roi: "150% increase in audio content reach with automated production",
          priority: "High",
          timeline: "4-5 weeks",
          icon: <Headphones className="w-4 h-4" />,
          capabilities: [
            "Automated audio enhancement and noise reduction",
            "Episode segmentation and chapter markers",
            "RSS feed generation and management",
            "Multi-platform distribution (Spotify, Apple, Google)",
            "Automated show notes generation",
            "Transcription and searchable content"
          ]
        },
        {
          name: "Worship Integration Suite",
          description: "Seamless integration with worship planning, lyrics display, and congregation engagement tools",
          businessValue: "Creates cohesive worship experience with aligned messaging across all service elements",
          technicalDetails: "Integration APIs connecting sermon themes with song selection, liturgy, and visual elements",
          timesSaved: "2-3 hours in worship coordination",
          roi: "50% improvement in worship flow and thematic coherence",
          priority: "Medium",
          timeline: "5-6 weeks",
          icon: <Music className="w-4 h-4" />,
          capabilities: [
            "Thematic song recommendation",
            "Scripture reading coordination",
            "Visual element synchronization",
            "Prayer focus alignment",
            "Liturgical calendar integration",
            "Congregation response tracking"
          ]
        }
      ]
    },
    {
      name: "Engagement Analytics & Feedback",
      description: "Comprehensive analytics and feedback systems for measuring content effectiveness and spiritual impact",
      icon: <BarChart className="w-6 h-6" />,
      features: [
        {
          name: "Sermon Impact Analytics",
          description: "Detailed metrics on sermon engagement, spiritual response, and long-term congregational growth",
          businessValue: "Provides data-driven insights for improving preaching effectiveness and spiritual impact",
          technicalDetails: "Multi-source analytics combining attendance, engagement, feedback, and spiritual growth indicators",
          timesSaved: "3-4 hours monthly in manual feedback compilation",
          roi: "40% improvement in sermon effectiveness through data-driven refinement",
          priority: "High",
          timeline: "4-5 weeks",
          icon: <TrendingUp className="w-4 h-4" />,
          capabilities: [
            "Real-time engagement tracking during sermons",
            "Post-sermon feedback collection and analysis",
            "Longitudinal spiritual growth measurement",
            "Topic effectiveness comparison",
            "Attention span and retention analytics",
            "Action item completion tracking"
          ]
        },
        {
          name: "Congregation Feedback System",
          description: "Anonymous and identified feedback collection with sentiment analysis and action item generation",
          businessValue: "Creates direct communication channel between pastor and congregation for continuous improvement",
          technicalDetails: "Feedback aggregation platform with AI sentiment analysis and trend identification",
          timesSaved: "2-3 hours weekly in feedback processing",
          roi: "60% improvement in congregation satisfaction and engagement",
          priority: "High",
          timeline: "3-4 weeks",
          icon: <MessageSquare className="w-4 h-4" />,
          capabilities: [
            "Anonymous feedback collection",
            "Sentiment analysis and emotion tracking",
            "Topic suggestion and request system",
            "Prayer request integration",
            "Follow-up action automation",
            "Trend analysis and reporting"
          ]
        },
        {
          name: "Spiritual Growth Tracking",
          description: "Longitudinal tracking of congregational spiritual growth indicators linked to sermon content",
          businessValue: "Demonstrates tangible spiritual impact and guides future content strategy",
          technicalDetails: "Spiritual metrics tracking with correlation analysis between content and growth indicators",
          timesSaved: "4-5 hours monthly in growth assessment",
          roi: "50% improvement in targeted spiritual development programming",
          priority: "Medium",
          timeline: "6-8 weeks",
          icon: <Target className="w-4 h-4" />,
          capabilities: [
            "Individual spiritual journey mapping",
            "Congregation-wide growth metrics",
            "Content-to-outcome correlation analysis",
            "Ministry effectiveness measurement",
            "Discipleship pathway optimization",
            "Intervention opportunity identification"
          ]
        }
      ]
    },
    {
      name: "Resource Management & Library",
      description: "Comprehensive digital library and resource management system for pastoral content",
      icon: <Archive className="w-6 h-6" />,
      features: [
        {
          name: "Digital Sermon Archive",
          description: "Searchable, categorized archive of all sermon content with AI-powered tagging and retrieval",
          businessValue: "Transforms years of sermon content into accessible, reusable resource library",
          technicalDetails: "Intelligent content indexing with full-text search, theme extraction, and similarity matching",
          timesSaved: "2-3 hours weekly in content research and retrieval",
          roi: "Unlimited reuse potential for sermon series and content development",
          priority: "High",
          timeline: "3-4 weeks",
          icon: <Database className="w-4 h-4" />,
          capabilities: [
            "Full-text search across all content",
            "Automatic theme and topic tagging",
            "Scripture reference indexing",
            "Series and collection organization",
            "Content similarity recommendations",
            "Export and sharing capabilities"
          ]
        },
        {
          name: "Resource Collaboration Hub",
          description: "Platform for sharing resources with other pastors and accessing curated content from ministry networks",
          businessValue: "Expands resource access while building collaborative ministry relationships",
          technicalDetails: "Secure sharing platform with permission controls and content verification systems",
          timesSaved: "3-4 hours weekly in resource discovery and networking",
          roi: "500% expansion of available high-quality content resources",
          priority: "Medium",
          timeline: "5-6 weeks",
          icon: <Users className="w-4 h-4" />,
          capabilities: [
            "Peer pastor resource sharing",
            "Denominational content libraries",
            "Expert commentary access",
            "Conference and workshop materials",
            "Collaborative study group tools",
            "Content quality rating system"
          ]
        },
        {
          name: "Personal Study Assistant",
          description: "AI-powered personal study companion for ongoing theological education and sermon preparation",
          businessValue: "Enhances pastoral knowledge and keeps content fresh with continuous learning integration",
          technicalDetails: "Adaptive learning system tracking study progress and recommending relevant resources",
          timesSaved: "2-3 hours weekly in study planning and resource curation",
          roi: "40% improvement in study efficiency and knowledge retention",
          priority: "Medium",
          timeline: "4-5 weeks",
          icon: <Brain className="w-4 h-4" />,
          capabilities: [
            "Personalized study plan generation",
            "Progress tracking and goal setting",
            "Resource recommendation engine",
            "Note-taking and annotation tools",
            "Knowledge gap identification",
            "Continuing education integration"
          ]
        }
      ]
    },
    {
      name: "Collaborative Ministry Tools",
      description: "Team coordination and collaborative content development for ministry staff",
      icon: <Users className="w-6 h-6" />,
      features: [
        {
          name: "Ministry Team Workflow",
          description: "Collaborative platform for coordinating sermon preparation with worship, music, and technical teams",
          businessValue: "Ensures cohesive service planning with clear communication and aligned execution",
          technicalDetails: "Workflow management system with role-based permissions and automated notifications",
          timesSaved: "3-4 hours weekly in team coordination",
          roi: "50% improvement in service preparation efficiency and quality",
          priority: "High",
          timeline: "4-5 weeks",
          icon: <Workflow className="w-4 h-4" />,
          capabilities: [
            "Sermon theme communication to all teams",
            "Coordinated planning calendar",
            "Resource sharing and asset management",
            "Feedback and revision tracking",
            "Role-specific task assignments",
            "Real-time collaboration tools"
          ]
        },
        {
          name: "Guest Speaker Management",
          description: "Platform for coordinating with guest speakers, managing content approval, and ensuring message alignment",
          businessValue: "Maintains message consistency and church standards while supporting guest ministry",
          technicalDetails: "Guest speaker portal with content submission, review workflow, and resource sharing",
          timesSaved: "2-3 hours per guest speaker coordination",
          roi: "90% reduction in guest speaker coordination complexity",
          priority: "Medium",
          timeline: "3-4 weeks",
          icon: <Mic className="w-4 h-4" />,
          capabilities: [
            "Guest speaker onboarding and guidelines",
            "Content submission and approval workflow",
            "Church resource and guideline sharing",
            "Technical requirement coordination",
            "Follow-up and feedback collection",
            "Recurring speaker relationship management"
          ]
        },
        {
          name: "Multi-Campus Coordination",
          description: "Synchronized content distribution and local adaptation for multi-site church operations",
          businessValue: "Maintains unified messaging while allowing campus-specific customization",
          technicalDetails: "Content distribution network with local adaptation tools and synchronization features",
          timesSaved: "4-6 hours weekly in multi-campus coordination",
          roi: "75% improvement in multi-site message consistency and local relevance",
          priority: "Medium",
          timeline: "6-8 weeks",
          icon: <Globe className="w-4 h-4" />,
          capabilities: [
            "Centralized content creation and distribution",
            "Campus-specific adaptation tools",
            "Local illustration and application customization",
            "Synchronized timing and delivery",
            "Campus-specific analytics and feedback",
            "Resource sharing between locations"
          ]
        }
      ]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pastoral Content Creation & Distribution Suite
        </h1>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          Comprehensive AI-powered platform designed specifically for lead pastors and senior pastors to revolutionize 
          sermon preparation, content creation, and multi-channel distribution while maximizing spiritual impact.
        </p>
      </div>

      {/* Overview Statistics */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Time Saved Weekly</p>
                <p className="text-2xl font-bold text-blue-900">15-20 hrs</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Content Output Increase</p>
                <p className="text-2xl font-bold text-green-900">300%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Engagement Improvement</p>
                <p className="text-2xl font-bold text-purple-900">50%</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900">Platform Reach</p>
                <p className="text-2xl font-bold text-orange-900">8+ Channels</p>
              </div>
              <Share2 className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {contentCategories.map((category) => (
        <Card key={category.name} className="border-2">
          <Collapsible
            open={expandedCategories[category.name.toLowerCase().replace(/[^a-z0-9]/g, '_')]}
            onOpenChange={() => toggleCategory(category.name.toLowerCase().replace(/[^a-z0-9]/g, '_'))}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                      {category.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{category.features.length} features</Badge>
                    {expandedCategories[category.name.toLowerCase().replace(/[^a-z0-9]/g, '_')] ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0 space-y-6">
                {category.features.map((feature) => (
                  <Card key={feature.name} className="border border-gray-200 hover:border-indigo-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 text-indigo-600 flex items-center justify-center">
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
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-2">Business Value</h5>
                          <p className="text-sm text-blue-800">{feature.businessValue}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h5 className="font-medium text-green-900 mb-2">ROI & Time Savings</h5>
                          <p className="text-sm text-green-800">
                            <strong>Time Saved:</strong> {feature.timesSaved}<br/>
                            <strong>ROI:</strong> {feature.roi}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">Technical Implementation</h5>
                        <p className="text-sm text-gray-700">{feature.technicalDetails}</p>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Key Capabilities</h5>
                        <div className="grid md:grid-cols-2 gap-2">
                          {feature.capabilities.map((capability, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              {capability}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}

      {/* Implementation Roadmap */}
      <Card className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Implementation Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm mr-2">1</span>
                Phase 1: Core Creation Tools (4-5 weeks)
              </h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Biblical Research Assistant</li>
                <li>• Intelligent Sermon Outliner</li>
                <li>• Sermon Content Enhancer</li>
                <li>• Digital Sermon Archive</li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm mr-2">2</span>
                Phase 2: Distribution & Analytics (5-6 weeks)
              </h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Adaptive Content Generator</li>
                <li>• Sermon Impact Analytics</li>
                <li>• Congregation Feedback System</li>
                <li>• Ministry Team Workflow</li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm mr-2">3</span>
                Phase 3: Advanced Features (6-8 weeks)
              </h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Professional Video Production</li>
                <li>• Podcast & Audio Distribution</li>
                <li>• Multi-Campus Coordination</li>
                <li>• Spiritual Growth Tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <BarChart className="w-5 h-5 mr-2" />
            Expected Success Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-900 mb-3">Productivity Improvements</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                  75% reduction in sermon research time
                </li>
                <li className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                  60% faster sermon preparation overall
                </li>
                <li className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                  300% increase in content output across channels
                </li>
                <li className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                  80% reduction in video production time
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-900 mb-3">Ministry Impact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Target className="w-4 h-4 text-green-600 mr-2" />
                  50% improvement in sermon engagement
                </li>
                <li className="flex items-center">
                  <Target className="w-4 h-4 text-green-600 mr-2" />
                  40% increase in spiritual growth tracking
                </li>
                <li className="flex items-center">
                  <Target className="w-4 h-4 text-green-600 mr-2" />
                  200% expansion in digital reach
                </li>
                <li className="flex items-center">
                  <Target className="w-4 h-4 text-green-600 mr-2" />
                  60% improvement in congregation feedback quality
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}