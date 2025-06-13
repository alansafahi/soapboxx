import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SermonIllustration } from "@shared/schema";
import { 
  Search, Lightbulb, BookOpen, MessageSquare, Star, 
  Clock, Target, RefreshCw, Save, Download, Share2,
  ChevronRight, CheckCircle, AlertCircle, Loader2
} from "lucide-react";

interface SermonOutline {
  title: string;
  theme: string;
  mainPoints: string[];
  introduction: string;
  conclusion: string;
  callToAction: string;
  scriptureReferences: string[];
}

interface BiblicalResearch {
  commentary: string;
  crossReferences: string[];
  historicalContext: string;
  keyThemes: string[];
  practicalApplications: string[];
}



export default function SermonCreationStudio() {
  const [activeTab, setActiveTab] = useState("research");
  const [scriptureText, setScriptureText] = useState("");
  const [sermonTopic, setSermonTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("general");
  const [sermonLength, setSermonLength] = useState("medium");
  const [currentOutline, setCurrentOutline] = useState<SermonOutline | null>(null);
  const [currentResearch, setCurrentResearch] = useState<BiblicalResearch | null>(null);
  const [illustrations, setIllustrations] = useState<SermonIllustration[]>([]);
  const { toast } = useToast();

  // Biblical Research Mutation
  const researchMutation = useMutation({
    mutationFn: async (data: { scripture: string; topic: string }) => {
      const query = data.scripture || data.topic;
      return apiRequest('/api/biblical-research', {
        method: 'POST',
        body: { query }
      });
    },
    onSuccess: (data) => {
      // Extract the research data from the API response
      const researchData = data.research || data;
      setCurrentResearch(researchData);
      toast({
        title: "Research Complete",
        description: "Biblical commentary and insights have been generated."
      });
    },
    onError: (error) => {
      toast({
        title: "Research Needs a Moment",
        description: "Let's try that research request again - sometimes the best insights take a second attempt.",
        variant: "default"
      });
    }
  });

  // Sermon Outline Mutation
  const outlineMutation = useMutation({
    mutationFn: async (data: { scripture: string; topic: string; audience: string; length: string }) => {
      return apiRequest('/api/sermon/outline', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: (data) => {
      setCurrentOutline(data);
      toast({
        title: "Outline Generated",
        description: "Your sermon structure has been created."
      });
    },
    onError: (error) => {
      toast({
        title: "Let's Refine That Outline",
        description: "Your sermon structure is almost ready - let's give it another try with your input.",
        variant: "default"
      });
    }
  });

  // Illustrations Mutation for generating stories and presentation content
  const illustrationsMutation = useMutation({
    mutationFn: async (data: { topic: string; mainPoints: string[]; audience: string }) => {
      return apiRequest('/api/sermon/illustrations', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: (data) => {
      setIllustrations(data);
      toast({
        title: "Stories Ready",
        description: `${data.length} compelling stories and visual aids generated for ${targetAudience} audience.`
      });
    },
    onError: (error) => {
      toast({
        title: "Finding Better Stories",
        description: "We're gathering compelling illustrations for your message - let's try once more.",
        variant: "default"
      });
    }
  });

  // Enhancement Mutation
  const enhanceMutation = useMutation({
    mutationFn: async (data: { outline: SermonOutline; research: BiblicalResearch }) => {
      return apiRequest('/api/sermon/enhance', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: (data) => {
      setCurrentOutline(data.enhancedOutline);
      toast({
        title: "Sermon Enhanced",
        description: "Your sermon has been improved for clarity and engagement."
      });
    }
  });

  const handleResearch = () => {
    if (!scriptureText && !sermonTopic) {
      toast({
        title: "Input Required",
        description: "Please provide either a scripture reference or sermon topic.",
        variant: "destructive"
      });
      return;
    }
    researchMutation.mutate({ scripture: scriptureText, topic: sermonTopic });
  };

  const handleGenerateOutline = () => {
    if (!scriptureText && !sermonTopic) {
      toast({
        title: "Input Required",
        description: "Please provide either a scripture reference or sermon topic.",
        variant: "destructive"
      });
      return;
    }
    outlineMutation.mutate({ 
      scripture: scriptureText, 
      topic: sermonTopic, 
      audience: targetAudience, 
      length: sermonLength 
    });
  };

  const handleFindIllustrations = () => {
    if (!currentOutline) {
      toast({
        title: "Outline Required",
        description: "Please generate a sermon outline first.",
        variant: "destructive"
      });
      return;
    }
    illustrationsMutation.mutate({
      topic: sermonTopic,
      mainPoints: currentOutline.mainPoints,
      audience: targetAudience
    });
  };

  const handleEnhanceSermon = () => {
    if (!currentOutline || !currentResearch) {
      toast({
        title: "Content Required",
        description: "Please generate both research and outline first.",
        variant: "destructive"
      });
      return;
    }
    enhanceMutation.mutate({ outline: currentOutline, research: currentResearch });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          AI-Powered Sermon Creation Studio
        </h1>
        <p className="text-lg text-gray-600">
          Transform your sermon preparation with intelligent research, outline generation, and content enhancement
        </p>
      </div>

      {/* Input Section */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Target className="w-5 h-5 mr-2" />
            Sermon Foundation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scripture Reference (Optional)
              </label>
              <Input
                placeholder="e.g., John 3:16-21, Romans 8, Psalm 23"
                value={scriptureText}
                onChange={(e) => setScriptureText(e.target.value)}
                className="bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sermon Topic/Theme
              </label>
              <Input
                placeholder="e.g., Grace, Faith in Action, God's Love"
                value={sermonTopic}
                onChange={(e) => setSermonTopic(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <select 
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="general">General Congregation</option>
                <option value="youth">Youth/Young Adults</option>
                <option value="families">Families with Children</option>
                <option value="seniors">Senior Adults</option>
                <option value="seekers">Seekers/New Believers</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sermon Length
              </label>
              <select 
                value={sermonLength}
                onChange={(e) => setSermonLength(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="short">Short (15-20 minutes)</option>
                <option value="medium">Medium (25-30 minutes)</option>
                <option value="long">Long (35-45 minutes)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="research" className="flex items-center">
            <Search className="w-4 h-4 mr-2" />
            Research
          </TabsTrigger>
          <TabsTrigger value="outline" className="flex items-center">
            <Lightbulb className="w-4 h-4 mr-2" />
            Outline
          </TabsTrigger>
          <TabsTrigger value="illustrations" className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Stories
          </TabsTrigger>
          <TabsTrigger value="enhance" className="flex items-center">
            <Star className="w-4 h-4 mr-2" />
            Enhance
          </TabsTrigger>
        </TabsList>

        {/* Research Tab */}
        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Biblical Research Assistant
              </CardTitle>
              <Button 
                onClick={handleResearch}
                disabled={researchMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {researchMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Generate Research
              </Button>
            </CardHeader>
            <CardContent>
              {currentResearch ? (
                <div className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Biblical Commentary</h4>
                    <p className="text-green-800 text-sm leading-relaxed">{currentResearch.commentary}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Historical Context</h4>
                    <p className="text-blue-800 text-sm leading-relaxed">{currentResearch.historicalContext}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Key Themes</h4>
                      <div className="space-y-1">
                        {currentResearch.keyThemes.map((theme, idx) => (
                          <Badge key={idx} variant="outline" className="mr-1">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Cross References</h4>
                      <div className="space-y-1">
                        {currentResearch.crossReferences.map((ref, idx) => (
                          <div key={idx} className="text-sm text-orange-800">{ref}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Practical Applications</h4>
                    <ul className="space-y-1">
                      {currentResearch.practicalApplications.map((app, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <ChevronRight className="w-4 h-4 mr-1 mt-0.5 text-gray-500" />
                          {typeof app === 'string' ? app : app.title || app.details || JSON.stringify(app)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Enter scripture reference or topic above and click "Generate Research" to begin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outline Tab */}
        <TabsContent value="outline" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Intelligent Sermon Outliner
              </CardTitle>
              <Button 
                onClick={handleGenerateOutline}
                disabled={outlineMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {outlineMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lightbulb className="w-4 h-4 mr-2" />
                )}
                Generate Outline
              </Button>
            </CardHeader>
            <CardContent>
              {currentOutline ? (
                <div className="space-y-6">
                  <div className="text-center bg-indigo-50 p-4 rounded-lg">
                    <h3 className="text-xl font-bold text-indigo-900">{currentOutline.title}</h3>
                    <p className="text-indigo-700 mt-1">{currentOutline.theme}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Introduction</h4>
                    <p className="text-blue-800 text-sm leading-relaxed">{currentOutline.introduction}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-3">Main Points</h4>
                    <div className="space-y-3">
                      {currentOutline.mainPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start">
                          <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-green-800 text-sm leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Conclusion</h4>
                    <p className="text-purple-800 text-sm leading-relaxed">{currentOutline.conclusion}</p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">Call to Action</h4>
                    <p className="text-orange-800 text-sm leading-relaxed">{currentOutline.callToAction}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Scripture References</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentOutline.scriptureReferences.map((ref, idx) => (
                        <Badge key={idx} variant="outline">{ref}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Set your foundation details and click "Generate Outline" to create your sermon structure</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Illustrations Tab */}
        <TabsContent value="illustrations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Story & Content Library
              </CardTitle>
              <Button 
                onClick={handleFindIllustrations}
                disabled={illustrationsMutation.isPending || !currentOutline}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {illustrationsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4 mr-2" />
                )}
                {illustrationsMutation.isPending ? 'Generating Stories...' : 'Generate Stories'}
              </Button>
            </CardHeader>
            <CardContent>
              {illustrations.length > 0 ? (
                <div className="space-y-4">
                  {illustrations.map((illustration, idx) => (
                    <Card key={idx} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{illustration.title}</h4>
                          <Badge 
                            variant={illustration.relevanceScore > 0.8 ? "default" : "outline"}
                            className="ml-2"
                          >
                            {Math.round(illustration.relevanceScore * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{illustration.story}</p>
                        <div className="bg-blue-50 p-3 rounded-md mb-3">
                          <p className="text-sm text-blue-800"><strong>Application:</strong> {illustration.application}</p>
                        </div>
                        
                        {/* Visual Elements Section */}
                        {illustration.visualElements && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-3">
                            <h5 className="font-semibold text-purple-900 mb-2 flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                              Presentation Elements
                            </h5>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-purple-800">Slide Title:</span>
                                <span className="ml-2 text-gray-700">{illustration.visualElements.slideTitle}</span>
                              </div>
                              
                              {/* Presentation Style Information */}
                              {(illustration.visualElements.audienceStyle || illustration.visualElements.themeStyle) && (
                                <div className="space-y-3">
                                  <span className="font-medium text-purple-800">Presentation Style Guide:</span>
                                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                    <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                                      {illustration.visualElements.audienceStyle && (
                                        <div>
                                          <span className="font-medium text-purple-600">Audience Style:</span>
                                          <span className="ml-1 capitalize">{illustration.visualElements.audienceStyle}</span>
                                        </div>
                                      )}
                                      {illustration.visualElements.themeStyle && (
                                        <div>
                                          <span className="font-medium text-purple-600">Theme Elements:</span>
                                          <span className="ml-1">{illustration.visualElements.themeStyle}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <span className="font-medium text-purple-800">Visual Description:</span>
                                <span className="ml-2 text-gray-700">{illustration.visualElements.keyImage}</span>
                              </div>
                              {illustration.visualElements.bulletPoints && (
                                <div>
                                  <span className="font-medium text-purple-800">Key Points:</span>
                                  <ul className="ml-4 mt-1 text-gray-700">
                                    {illustration.visualElements.bulletPoints.map((point, idx) => (
                                      <li key={idx} className="list-disc">{point}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {illustration.visualElements.scriptureConnection && (
                                <div>
                                  <span className="font-medium text-purple-800">Scripture:</span>
                                  <span className="ml-2 text-gray-700 italic">{illustration.visualElements.scriptureConnection}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Presentation Tips */}
                        {illustration.presentationTips && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                            <h5 className="font-semibold text-green-900 mb-2 flex items-center text-sm">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              Delivery Tips
                            </h5>
                            <div className="text-xs text-green-800 space-y-1">
                              {illustration.presentationTips.timing && (
                                <div><strong>Timing:</strong> {illustration.presentationTips.timing}</div>
                              )}
                              {illustration.presentationTips.delivery && (
                                <div><strong>Delivery:</strong> {illustration.presentationTips.delivery}</div>
                              )}
                              {illustration.presentationTips.interaction && (
                                <div><strong>Engagement:</strong> {illustration.presentationTips.interaction}</div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500">Source: {illustration.source}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Generate a sermon outline first, then find relevant illustrations to enhance your message</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhancement Tab */}
        <TabsContent value="enhance" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Sermon Content Enhancer
              </CardTitle>
              <Button 
                onClick={handleEnhanceSermon}
                disabled={enhanceMutation.isPending || !currentOutline || !currentResearch}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {enhanceMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Star className="w-4 h-4 mr-2" />
                )}
                Enhance Sermon
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-semibold text-green-900">Clarity Analysis</h4>
                    <p className="text-sm text-green-700">Reviews readability and flow</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Engagement Optimization</h4>
                    <p className="text-sm text-blue-700">Suggests interaction points</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-semibold text-purple-900">Theological Review</h4>
                    <p className="text-sm text-purple-700">Ensures biblical accuracy</p>
                  </div>
                </div>
                
                {!currentOutline || !currentResearch ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Complete both research and outline generation to enhance your sermon</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      Ready to enhance your sermon! The AI will analyze your content for clarity, engagement, 
                      and theological accuracy, then provide specific recommendations for improvement.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      {(currentOutline || currentResearch) && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Badge variant="outline" className="bg-white">
                  <Clock className="w-3 h-3 mr-1" />
                  Time Saved: ~6 hours
                </Badge>
                <Badge variant="outline" className="bg-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  AI-Powered Research
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}