import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { BookOpen, Search, Lightbulb, Star } from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function SermonCreationStudio() {
  const [activeTab, setActiveTab] = useState("research");
  const [scriptureText, setScriptureText] = useState("");
  const [sermonTopic, setSermonTopic] = useState("");
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

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sermon Creation Studio</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create compelling sermons with AI-powered research and insights
          </p>
        </div>
      </div>

      {/* Input Section */}
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
          <TabsTrigger value="research" className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Research
          </TabsTrigger>
          <TabsTrigger value="outline" className="flex items-center">
            <Lightbulb className="w-4 h-4 mr-2" />
            Outline
          </TabsTrigger>
          <TabsTrigger value="enhance" className="flex items-center">
            <Star className="w-4 h-4 mr-2" />
            Enhance
          </TabsTrigger>
          <TabsTrigger value="complete" className="flex items-center">
            <Search className="w-4 h-4 mr-2" />
            Complete
          </TabsTrigger>
        </TabsList>

        <TabsContent value="research" className="space-y-4">
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

        <TabsContent value="outline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Sermon Outline Builder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Create a structured sermon outline with main points and flow.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enhance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Sermon Enhancer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Enhance your sermon with AI-powered suggestions and improvements.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complete" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Complete Sermon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Review and finalize your complete sermon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}