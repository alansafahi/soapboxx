import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { BookOpen, Search, Lightbulb, Star, Users, GraduationCap, Clock, Play } from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function SermonCreationStudio() {
  const [activeTab, setActiveTab] = useState("sermon-research");
  const [mainTab, setMainTab] = useState("sermon");
  const [scriptureText, setScriptureText] = useState("");
  const [sermonTopic, setSermonTopic] = useState("");
  const [lessonTopic, setLessonTopic] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateResearch = async () => {
    if (!scriptureText && !sermonTopic) {
      toast({
        title: "Input Required",
        description: "Please provide either a scripture reference or sermon topic.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Research Complete",
        description: "Biblical commentary and insights have been generated."
      });
    } catch (error) {
      toast({
        title: "Research Failed",
        description: "Failed to generate research. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateLesson = async () => {
    if (!lessonTopic || !ageGroup) {
      toast({
        title: "Input Required",
        description: "Please provide a lesson topic and age group.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Lesson Plan Generated",
        description: "Your Sunday School lesson plan has been created successfully."
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate lesson plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Content Creation Studio</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create compelling sermons and Sunday School lessons with AI-powered research and insights
          </p>
        </div>
      </div>

      {/* Main Tab Selection */}
      <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sermon" className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Sermon Creation
          </TabsTrigger>
          <TabsTrigger value="sunday-school" className="flex items-center">
            <GraduationCap className="w-4 h-4 mr-2" />
            Sunday School Lessons
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sermon" className="space-y-6">

          {/* Sermon Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Scripture Reference</label>
                <Input
                  placeholder="e.g., John 3:16, Romans 8:28"
                  value={scriptureText}
                  onChange={(e) => setScriptureText(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sermon Topic</label>
                <Input
                  placeholder="e.g., Love, Faith, Hope"
                  value={sermonTopic}
                  onChange={(e) => setSermonTopic(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sermon-research" className="flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Research
              </TabsTrigger>
              <TabsTrigger value="sermon-outline" className="flex items-center">
                <Lightbulb className="w-4 h-4 mr-2" />
                Outline
              </TabsTrigger>
              <TabsTrigger value="sermon-enhance" className="flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Enhance
              </TabsTrigger>
              <TabsTrigger value="sermon-complete" className="flex items-center">
                <Search className="w-4 h-4 mr-2" />
                Complete
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sermon-research" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Biblical Research Assistant
                  </CardTitle>
                  <Button 
                    onClick={handleGenerateResearch}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGenerating ? "Generating..." : "Generate Research"}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <p>Generate biblical research and commentary to begin your sermon preparation.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sermon-outline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Sermon Outline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <p>Create a structured outline for your sermon.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sermon-enhance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Enhance Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <p>Enhance your sermon with illustrations, examples, and applications.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sermon-complete" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="w-4 h-4 mr-2" />
                    Complete Sermon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <p>Finalize and export your completed sermon.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="sunday-school" className="space-y-6">
          {/* Sunday School Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Lesson Plan Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Lesson Topic</label>
                  <Input
                    placeholder="e.g., The Good Samaritan, David and Goliath"
                    value={lessonTopic}
                    onChange={(e) => setLessonTopic(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Scripture Reference</label>
                  <Input
                    placeholder="e.g., Luke 10:25-37"
                    value={scriptureText}
                    onChange={(e) => setScriptureText(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Age Group</label>
                  <Select value={ageGroup} onValueChange={setAgeGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preschool">Preschool (3-5 years)</SelectItem>
                      <SelectItem value="elementary">Elementary (6-8 years)</SelectItem>
                      <SelectItem value="middle">Middle Elementary (9-12 years)</SelectItem>
                      <SelectItem value="teen">Teen (13-17 years)</SelectItem>
                      <SelectItem value="adult">Adult (18+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lesson Duration</label>
                  <Select value={lessonDuration} onValueChange={setLessonDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="lesson-plan" className="flex items-center">
                <GraduationCap className="w-4 h-4 mr-2" />
                Lesson Plan
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center">
                <Play className="w-4 h-4 mr-2" />
                Activities
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Materials
              </TabsTrigger>
              <TabsTrigger value="assessment" className="flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Assessment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lesson-plan" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    AI Lesson Plan Generator
                  </CardTitle>
                  <Button 
                    onClick={handleGenerateLesson}
                    disabled={isGenerating}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isGenerating ? "Generating..." : "Generate Lesson Plan"}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <GraduationCap className="w-16 h-16 mx-auto mb-4 text-purple-300" />
                    <p className="mb-2">Generate a complete Sunday School lesson plan with:</p>
                    <ul className="text-sm text-left max-w-md mx-auto space-y-1">
                      <li>• Age-appropriate teaching objectives</li>
                      <li>• Bible story summary and key verses</li>
                      <li>• Interactive discussion questions</li>
                      <li>• Memory verse suggestions</li>
                      <li>• Practical life applications</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Play className="w-5 h-5 mr-2" />
                    Engaging Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card className="p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <Play className="w-4 h-4 text-blue-600" />
                          </div>
                          <h3 className="font-semibold">Games & Songs</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Interactive games, worship songs, and movement activities</p>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-green-600" />
                          </div>
                          <h3 className="font-semibold">Group Activities</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Team building exercises and collaborative projects</p>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                            <Star className="w-4 h-4 text-purple-600" />
                          </div>
                          <h3 className="font-semibold">Crafts & Art</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Creative projects and hands-on learning activities</p>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Required Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-blue-300" />
                    <p>Complete materials list will be generated with your lesson plan</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Learning Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                    <p>Assessment tools and discussion questions to evaluate learning outcomes</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}