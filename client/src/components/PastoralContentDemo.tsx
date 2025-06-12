import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Lightbulb, Users, MessageSquare, 
  Facebook, Twitter, Instagram, Mail, FileText,
  CheckCircle, Clock, Sparkles, Share2, Edit3
} from "lucide-react";

export default function PastoralContentDemo() {
  const [activeFeature, setActiveFeature] = useState("sermon-studio");

  const sermonStudioDemo = {
    research: {
      scripture: "John 3:16",
      commentary: "This beloved verse represents the heart of the Christian message. The Greek word 'agape' used here describes God's unconditional, sacrificial love that seeks the highest good of the beloved...",
      themes: ["Divine Love", "Eternal Life", "Universal Salvation", "Sacrifice"],
      crossReferences: ["Romans 5:8", "1 John 4:9-10", "Ephesians 2:8-9"],
      applications: [
        "Understanding our identity as beloved children of God",
        "Extending grace to others as we have received it",
        "Living with eternal perspective in daily decisions"
      ]
    },
    outline: {
      title: "The Greatest Love Story Ever Told",
      introduction: "Hook the audience with a relatable story about love, then transition to God's ultimate love story.",
      points: [
        {
          title: "God's Love is Personal",
          content: "For God so loved... each individual person",
          scripture: "John 3:16a",
          illustration: "Parent's love for their child analogy"
        },
        {
          title: "God's Love is Sacrificial", 
          content: "He gave his one and only Son",
          scripture: "John 3:16b",
          illustration: "Stories of heroic sacrifice"
        },
        {
          title: "God's Love is Transformational",
          content: "Whoever believes shall not perish but have eternal life",
          scripture: "John 3:16c",
          illustration: "Before and after testimonies"
        }
      ],
      conclusion: "Challenge to respond to God's love story",
      callToAction: "Accept God's love and share it with others"
    }
  };

  const distributionDemo = {
    socialMedia: [
      {
        platform: "Facebook",
        content: "🙏 This Sunday: 'The Greatest Love Story Ever Told' \n\nDive deep into John 3:16 and discover how God's personal, sacrificial love transforms everything. Whether you're seeking hope, healing, or purpose, this message will remind you that you are deeply loved.\n\nWhat's your favorite verse about God's love? Share below! 👇\n\n#GodsLove #John316 #SundayService #Hope",
        hashtags: ["#GodsLove", "#John316", "#SundayService", "#Hope"],
        estimatedReach: 850
      },
      {
        platform: "Twitter",
        content: "For God so loved the world... 🌍\n\nJoin us this Sunday as we explore the greatest love story ever told. You are loved beyond measure.\n\n#John316 #GodsLove #SundayService",
        hashtags: ["#John316", "#GodsLove", "#SundayService"],
        estimatedReach: 420
      },
      {
        platform: "Instagram",
        content: "✨ The Greatest Love Story Ever Told ✨\n\nThis Sunday we're diving into John 3:16 - a verse that has changed millions of lives. God's love isn't just a concept; it's personal, sacrificial, and transformational.\n\nTag someone who needs to hear about God's amazing love today! 💕\n\n#GodsLove #John316 #SundayService #Faith #Love #Hope #Transformation",
        hashtags: ["#GodsLove", "#John316", "#SundayService", "#Faith", "#Love"],
        estimatedReach: 650
      }
    ],
    emailContent: [
      {
        subject: "You Are Loved Beyond Measure - This Sunday's Message",
        preview: "Discover the depth of God's personal love for you in John 3:16",
        content: `Dear Church Family,

This Sunday, we're exploring one of the most beloved verses in Scripture: John 3:16. But we're not just reading it - we're diving deep into what it means that God's love is personal, sacrificial, and transformational.

In a world that often leaves us feeling unloved or unworthy, this message will remind you of an incredible truth: you are loved beyond measure by the Creator of the universe.

Join us this Sunday at 10:30 AM as we unpack "The Greatest Love Story Ever Told."

Blessings,
Pastor [Name]

P.S. Bring a friend! This is a perfect message for anyone questioning God's love for them.`
      }
    ],
    studyMaterials: [
      {
        title: "Small Group Discussion Guide",
        content: `**Opening Prayer**
Father, open our hearts to understand the depth of your love...

**Scripture Reading: John 3:16**

**Discussion Questions:**
1. What's the difference between knowing about God's love and experiencing it personally?
2. How does understanding God's sacrificial love change how we treat others?
3. Share a time when you felt God's love in a tangible way.

**Application Activity:**
Write a letter to someone, expressing God's love through your words.

**Closing Prayer**
Thank you, God, for your incredible love...`
      }
    ],
    bulletinContent: [
      {
        title: "This Sunday's Message",
        content: `"The Greatest Love Story Ever Told"
Join us as we explore John 3:16 and discover how God's personal, sacrificial love transforms everything. Perfect message for newcomers and longtime believers alike.`
      }
    ]
  };

  const metrics = {
    timesSaved: "6-8 hours",
    contentPieces: "12+",
    platformsReached: "5",
    estimatedReach: "1,920 people"
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          AI-Powered Pastoral Content Suite
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Transform sermon preparation and content distribution with intelligent automation
        </p>
        
        <div className="grid md:grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{metrics.timesSaved}</div>
            <div className="text-sm text-gray-600">Weekly Time Saved</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{metrics.contentPieces}</div>
            <div className="text-sm text-gray-600">Content Pieces Generated</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{metrics.platformsReached}</div>
            <div className="text-sm text-gray-600">Platforms Reached</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{metrics.estimatedReach}</div>
            <div className="text-sm text-gray-600">Estimated Weekly Reach</div>
          </div>
        </div>
      </div>

      <Tabs value={activeFeature} onValueChange={setActiveFeature}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sermon-studio" className="flex items-center">
            <Edit3 className="w-4 h-4 mr-2" />
            Sermon Creation Studio
          </TabsTrigger>
          <TabsTrigger value="content-distribution" className="flex items-center">
            <Share2 className="w-4 h-4 mr-2" />
            Content Distribution Hub
          </TabsTrigger>
        </TabsList>

        {/* Sermon Studio Demo */}
        <TabsContent value="sermon-studio" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Biblical Research */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Biblical Research Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">Scripture Focus</h4>
                  <p className="text-sm bg-blue-50 p-2 rounded">{sermonStudioDemo.research.scripture}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">Commentary</h4>
                  <p className="text-sm text-gray-600">{sermonStudioDemo.research.commentary}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">Key Themes</h4>
                  <div className="flex flex-wrap gap-1">
                    {sermonStudioDemo.research.themes.map((theme, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">{theme}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">Cross-References</h4>
                  <div className="flex flex-wrap gap-1">
                    {sermonStudioDemo.research.crossReferences.map((ref, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{ref}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sermon Outline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Intelligent Sermon Outliner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">Sermon Title</h4>
                  <p className="text-sm bg-green-50 p-2 rounded font-medium">{sermonStudioDemo.outline.title}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">Main Points</h4>
                  <div className="space-y-2">
                    {sermonStudioDemo.outline.points.map((point, index) => (
                      <div key={index} className="border-l-2 border-blue-500 pl-3 py-1">
                        <p className="font-medium text-sm">{point.title}</p>
                        <p className="text-xs text-gray-600">{point.content}</p>
                        <Badge variant="outline" className="text-xs mt-1">{point.scripture}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">Call to Action</h4>
                  <p className="text-sm text-gray-600 italic">{sermonStudioDemo.outline.callToAction}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-blue-50 to-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Sermon Preparation Complete</h3>
                    <p className="text-sm text-gray-600">Ready for content distribution across multiple platforms</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setActiveFeature("content-distribution")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Distribute Content
                  <Share2 className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Distribution Demo */}
        <TabsContent value="content-distribution" className="space-y-6">
          {/* Social Media Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="w-5 h-5 mr-2" />
                Social Media Content Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {distributionDemo.socialMedia.map((content, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {content.platform === "Facebook" && <Facebook className="w-4 h-4 text-blue-600" />}
                        {content.platform === "Twitter" && <Twitter className="w-4 h-4 text-blue-400" />}
                        {content.platform === "Instagram" && <Instagram className="w-4 h-4 text-pink-600" />}
                        <span className="font-semibold">{content.platform}</span>
                        <Badge variant="outline" className="text-xs">Ready to Post</Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        Est. reach: {content.estimatedReach} people
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md mb-3">
                      <p className="text-sm whitespace-pre-wrap">{content.content}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {content.hashtags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Content */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Newsletter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700">Subject Line</h4>
                    <p className="text-sm bg-blue-50 p-2 rounded">{distributionDemo.emailContent[0].subject}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700">Preview Text</h4>
                    <p className="text-sm text-gray-600 italic">{distributionDemo.emailContent[0].preview}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700">Email Content (Preview)</h4>
                    <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">{distributionDemo.emailContent[0].content.substring(0, 300)}...</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Small Group Study Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700">Study Material</h4>
                    <p className="text-sm bg-green-50 p-2 rounded">{distributionDemo.studyMaterials[0].title}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md max-h-48 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{distributionDemo.studyMaterials[0].content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bulletin Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Church Bulletin Insert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <h4 className="font-semibold text-sm mb-2">{distributionDemo.bulletinContent[0].title}</h4>
                <p className="text-sm text-gray-700">{distributionDemo.bulletinContent[0].content}</p>
              </div>
            </CardContent>
          </Card>

          {/* Success Summary */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Content Distribution Complete!</h3>
                <p className="text-gray-600 mb-4">
                  Generated 12+ content pieces across 5 platforms from a single sermon input
                </p>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg">
                    <div className="font-semibold text-blue-600">3</div>
                    <div className="text-gray-600">Social Posts</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="font-semibold text-green-600">2</div>
                    <div className="text-gray-600">Email Campaigns</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="font-semibold text-purple-600">4</div>
                    <div className="text-gray-600">Study Materials</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="font-semibold text-orange-600">3</div>
                    <div className="text-gray-600">Bulletin Inserts</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            Key Benefits for Pastors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Time Efficiency</h4>
              <p className="text-sm text-gray-600">
                Reduce content creation time from hours to minutes with AI-powered automation
              </p>
            </div>
            <div className="text-center">
              <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Multi-Platform Reach</h4>
              <p className="text-sm text-gray-600">
                Automatically optimize content for each platform's audience and format requirements
              </p>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Engagement Growth</h4>
              <p className="text-sm text-gray-600">
                Increase congregation engagement with consistent, high-quality content across all channels
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}