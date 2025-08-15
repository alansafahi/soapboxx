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
  const [sermonAudience, setSermonAudience] = useState("");
  const [sermonLength, setSermonLength] = useState("");
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
        title: "✨ Research Complete",
        description: "Biblical commentary and insights have been generated with AI assistance.",
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
        title: "🎉 Lesson Plan Generated",
        description: "Your Sunday School lesson plan has been created successfully with age-appropriate activities!",
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Content Creation Studio
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Create compelling sermons and Sunday School lessons with AI-powered research and insights
          </p>
        </div>
      </div>

      {/* Main Tab Selection */}
      <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <TabsTrigger value="sermon" className="flex items-center data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
            <BookOpen className="w-4 h-4 mr-2" />
            Sermon Creation
          </TabsTrigger>
          <TabsTrigger value="sunday-school" className="flex items-center data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400">
            <GraduationCap className="w-4 h-4 mr-2" />
            Sunday School Lessons
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sermon" className="space-y-6">

          {/* Sermon Input Section */}
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-white dark:from-blue-900/10 dark:to-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
                <BookOpen className="w-5 h-5 mr-2" />
                Sermon Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Scripture Reference</label>
                  <Input
                    placeholder="e.g., John 3:16, Romans 8:28"
                    value={scriptureText}
                    onChange={(e) => setScriptureText(e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sermon Topic</label>
                  <Input
                    placeholder="e.g., Love, Faith, Hope"
                    value={sermonTopic}
                    onChange={(e) => setSermonTopic(e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Target Audience</label>
                  <Select value={sermonAudience} onValueChange={setSermonAudience}>
                    <SelectTrigger className="border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Congregation</SelectItem>
                      <SelectItem value="youth">Youth Service</SelectItem>
                      <SelectItem value="children">Children's Church</SelectItem>
                      <SelectItem value="seniors">Senior Adults</SelectItem>
                      <SelectItem value="families">Family Service</SelectItem>
                      <SelectItem value="newcomers">Newcomers/Seekers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sermon Length</label>
                  <Select value={sermonLength} onValueChange={setSermonLength}>
                    <SelectTrigger className="border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="25">25 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="35">35 minutes</SelectItem>
                      <SelectItem value="40">40 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-blue-50 dark:bg-blue-900/20">
              <TabsTrigger value="sermon-research" className="flex items-center data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <BookOpen className="w-4 h-4 mr-2" />
                Research
              </TabsTrigger>
              <TabsTrigger value="sermon-outline" className="flex items-center data-[state=active]:bg-green-500 data-[state=active]:text-white">
                <Lightbulb className="w-4 h-4 mr-2" />
                Outline
              </TabsTrigger>
              <TabsTrigger value="sermon-enhance" className="flex items-center data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <Star className="w-4 h-4 mr-2" />
                Enhance
              </TabsTrigger>
              <TabsTrigger value="sermon-complete" className="flex items-center data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                <Search className="w-4 h-4 mr-2" />
                Complete
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sermon-research" className="space-y-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800">
                  <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Biblical Research Assistant
                  </CardTitle>
                  <Button 
                    onClick={handleGenerateResearch}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Generate Research
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Biblical Research</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      Generate comprehensive biblical research, commentary, and contextual insights to strengthen your sermon foundation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sermon-outline" className="space-y-4">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="bg-gradient-to-r from-green-50 to-white dark:from-green-900/20 dark:to-gray-800">
                  <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Sermon Outline Builder
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Lightbulb className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Structured Sermon Framework</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      Build a compelling sermon structure with clear introduction, main points, illustrations, and powerful conclusion.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sermon-enhance" className="space-y-4">
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800">
                  <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
                    <Star className="w-5 h-5 mr-2" />
                    Content Enhancement Suite
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="bg-orange-100 dark:bg-orange-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Star className="w-10 h-10 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Enhancement</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      Enrich your sermon with compelling illustrations, real-world examples, and practical life applications.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sermon-complete" className="space-y-4">
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800">
                  <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
                    <Search className="w-5 h-5 mr-2" />
                    Finalize & Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Complete Sermon Package</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      Review, polish, and export your finished sermon with speaker notes, slides, and handouts.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="sunday-school" className="space-y-6">
          {/* Sunday School Input Section */}
          <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-white dark:from-purple-900/10 dark:to-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
                <GraduationCap className="w-5 h-5 mr-2" />
                Sunday School Lesson Setup
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
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Scripture Reference</label>
                  <Input
                    placeholder="e.g., Luke 10:25-37"
                    value={scriptureText}
                    onChange={(e) => setScriptureText(e.target.value)}
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Age Group</label>
                  <Select value={ageGroup} onValueChange={setAgeGroup}>
                    <SelectTrigger className="border-purple-200 focus:border-purple-400">
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
                    <SelectTrigger className="border-purple-200 focus:border-purple-400">
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
            <TabsList className="grid w-full grid-cols-4 bg-purple-50 dark:bg-purple-900/20">
              <TabsTrigger value="lesson-plan" className="flex items-center data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                <GraduationCap className="w-4 h-4 mr-2" />
                Lesson Plan
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                <Play className="w-4 h-4 mr-2" />
                Activities
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex items-center data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                <BookOpen className="w-4 h-4 mr-2" />
                Materials
              </TabsTrigger>
              <TabsTrigger value="assessment" className="flex items-center data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                <Star className="w-4 h-4 mr-2" />
                Assessment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lesson-plan" className="space-y-4">
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800">
                  <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    AI Lesson Plan Generator
                  </CardTitle>
                  <Button 
                    onClick={handleGenerateLesson}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Generate Lesson Plan
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-10 h-10 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Professional Lesson Planning</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Generate a comprehensive Sunday School lesson plan including:</p>
                    <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 max-w-md mx-auto">
                      <ul className="text-sm text-left space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-center"><div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>Age-appropriate teaching objectives</li>
                        <li className="flex items-center"><div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>Bible story summary and key verses</li>
                        <li className="flex items-center"><div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>Interactive discussion questions</li>
                        <li className="flex items-center"><div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>Memory verse suggestions</li>
                        <li className="flex items-center"><div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>Practical life applications</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <Card className="border-l-4 border-l-pink-500">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-white dark:from-pink-900/20 dark:to-gray-800">
                  <CardTitle className="flex items-center text-pink-700 dark:text-pink-300">
                    <Play className="w-5 h-5 mr-2" />
                    Interactive Activities Hub
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card className="p-6 border-l-4 border-l-blue-400 hover:shadow-lg transition-shadow">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full flex items-center justify-center">
                            <Play className="w-6 h-6 text-blue-600" />
                          </div>
                          <h3 className="font-bold text-blue-700 dark:text-blue-300">Games & Songs</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Interactive games, worship songs, and movement activities that bring Bible stories to life</p>
                      </Card>
                      
                      <Card className="p-6 border-l-4 border-l-green-400 hover:shadow-lg transition-shadow">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-600" />
                          </div>
                          <h3 className="font-bold text-green-700 dark:text-green-300">Group Activities</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Team building exercises and collaborative projects that strengthen community bonds</p>
                      </Card>
                      
                      <Card className="p-6 border-l-4 border-l-purple-400 hover:shadow-lg transition-shadow">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 rounded-full flex items-center justify-center">
                            <Star className="w-6 h-6 text-purple-600" />
                          </div>
                          <h3 className="font-bold text-purple-700 dark:text-purple-300">Crafts & Art</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Creative projects and hands-on learning activities that reinforce biblical lessons</p>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <Card className="border-l-4 border-l-indigo-500">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800">
                  <CardTitle className="flex items-center text-indigo-700 dark:text-indigo-300">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Materials & Resources Hub
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="bg-indigo-100 dark:bg-indigo-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Complete Materials List</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
                      Automatically generated materials list including supplies, handouts, and resources needed for your lesson
                    </p>
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-4 max-w-sm mx-auto">
                      <div className="flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Generated after lesson plan creation</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-4">
              <Card className="border-l-4 border-l-teal-500">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-white dark:from-teal-900/20 dark:to-gray-800">
                  <CardTitle className="flex items-center text-teal-700 dark:text-teal-300">
                    <Star className="w-5 h-5 mr-2" />
                    Learning Assessment Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="bg-teal-100 dark:bg-teal-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Star className="w-10 h-10 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Comprehensive Assessment</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
                      Evaluate learning outcomes with age-appropriate assessment tools and discussion questions
                    </p>
                    <div className="bg-teal-50 dark:bg-teal-900/10 rounded-lg p-4 max-w-md mx-auto">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-teal-600 dark:text-teal-400">
                          <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                          Discussion Questions
                        </div>
                        <div className="flex items-center text-teal-600 dark:text-teal-400">
                          <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                          Memory Verse Quiz
                        </div>
                        <div className="flex items-center text-teal-600 dark:text-teal-400">
                          <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                          Activity Reviews
                        </div>
                        <div className="flex items-center text-teal-600 dark:text-teal-400">
                          <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                          Take-Home Activities
                        </div>
                      </div>
                    </div>
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