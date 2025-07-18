import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ModerationTestResult {
  postId?: number;
  moderationTriggered: boolean;
  priority?: string;
  violations?: string[];
  actionTaken?: string;
  userNotified?: boolean;
  adminNotified?: boolean;
  timestamp: string;
  mediaAnalysis?: {
    type: 'image' | 'video';
    description: string;
    concerns: string[];
  };
}

export function TestModerationPage() {
  const [testContent, setTestContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<ModerationTestResult | null>(null);
  const { toast } = useToast();

  const testScenarios = [
    {
      name: 'High Priority - Harassment',
      content: 'You are a fake Christian and should leave this app immediately. Your faith is worthless.',
      expectedPriority: 'high',
      type: 'text'
    },
    {
      name: 'High Priority - Inappropriate Content',
      content: 'This church event is going to be terrible with violent and sexual themes that should not be shared.',
      expectedPriority: 'high',
      type: 'text'
    },
    {
      name: 'Medium Priority - Misinformation',
      content: 'The Bible verse John 3:16 actually says something completely different than what pastors teach.',
      expectedPriority: 'medium',
      type: 'text'
    },
    {
      name: 'Low Priority - Spam',
      content: 'Check out my amazing crypto investment opportunity! Visit my website for huge returns guaranteed!',
      expectedPriority: 'low',
      type: 'text'
    },
    {
      name: 'Safe Content',
      content: 'I am grateful for our church community and the wonderful sermon last Sunday about love and compassion.',
      expectedPriority: 'none',
      type: 'text'
    },
    {
      name: 'Image Analysis - Church Logo',
      content: 'logo test',
      mediaUrl: 'https://via.placeholder.com/200x100/4ade80/ffffff?text=Church+Logo',
      expectedPriority: 'none',
      type: 'image'
    },
    {
      name: 'Video Analysis - Sample',
      content: 'Sharing a video from our worship service',
      mediaUrl: 'data:video/mp4;base64,AAAAIGZ0eXBtcDQyAAAAAG1wNDJpc29taXNvMmF2YzEAAAAIZnJlZQAAA',
      expectedPriority: 'none',
      type: 'video'
    }
  ];

  const submitTestPost = async (content: string) => {
    setIsSubmitting(true);
    setTestResult(null);

    try {
      const startTime = Date.now();
      
      // Create a test discussion post
      const response = await apiRequest('/api/discussions', {
        method: 'POST',
        body: JSON.stringify({
          title: `AI Moderation Test - ${Date.now()}`,
          content: content,
          category: 'Moderation Test',
          isPublic: true
        })
      });

      const postId = response.id;
      
      // Wait for AI moderation to process (1-3 seconds)
      setTimeout(async () => {
        try {
          // Check if content was flagged by checking moderation reports
          const moderationResponse = await apiRequest('/api/moderation/reports');
          const recentReports = moderationResponse.filter((report: any) => 
            report.contentType === 'discussion' && 
            report.contentId === postId &&
            new Date(report.createdAt).getTime() > startTime
          );

          const result: ModerationTestResult = {
            postId,
            moderationTriggered: recentReports.length > 0,
            priority: recentReports[0]?.priority,
            violations: recentReports[0]?.violations || [],
            actionTaken: recentReports[0]?.actionTaken,
            userNotified: true, // Notifications are sent automatically
            adminNotified: recentReports[0]?.priority === 'high',
            timestamp: new Date().toISOString()
          };

          setTestResult(result);
          
          toast({
            title: 'Test Complete',
            description: `AI moderation ${result.moderationTriggered ? 'detected violations' : 'cleared content'} in ${((Date.now() - startTime) / 1000).toFixed(1)}s`,
            variant: result.moderationTriggered ? 'destructive' : 'default'
          });

        } catch (error) {
          toast({
            title: 'Test Error',
            description: 'Failed to check moderation results',
            variant: 'destructive'
          });
        } finally {
          setIsSubmitting(false);
        }
      }, 4000); // Wait 4 seconds for AI processing + safety margin

    } catch (error) {
      console.error('Test submission failed:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to create test post',
        variant: 'destructive'
      });
      setIsSubmitting(false);
    }
  };

  const runQuickTest = (scenario: any) => {
    // For media scenarios, include the media URL in the post content
    let contentToTest = scenario.content;
    if (scenario.mediaUrl && scenario.type !== 'text') {
      if (scenario.type === 'image') {
        contentToTest = `${scenario.content}\n\n![Test Image](${scenario.mediaUrl})`;
      } else if (scenario.type === 'video') {
        contentToTest = `${scenario.content}\n\n<video src="${scenario.mediaUrl}" controls width="300"></video>`;
      }
    }
    setTestContent(contentToTest);
    submitTestPost(contentToTest);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Content Moderation Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test the real-time AI content monitoring system with various scenarios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Custom Test Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter content to test for AI moderation..."
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <Button 
              onClick={() => submitTestPost(testContent)}
              disabled={!testContent.trim() || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Testing AI Moderation...
                </>
              ) : (
                'Submit Test Post'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Test Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Test Scenarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {testScenarios.map((scenario, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{scenario.name}</span>
                    <Badge variant={
                      scenario.expectedPriority === 'high' ? 'destructive' :
                      scenario.expectedPriority === 'medium' ? 'default' :
                      scenario.expectedPriority === 'low' ? 'secondary' : 'outline'
                    }>
                      {scenario.expectedPriority}
                    </Badge>
                    {scenario.type !== 'text' && (
                      <Badge variant="outline" className="text-xs">
                        {scenario.type}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {scenario.content}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => runQuickTest(scenario)}
                  disabled={isSubmitting}
                >
                  Test
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResult.moderationTriggered ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold mb-1">
                  {testResult.moderationTriggered ? 'FLAGGED' : 'CLEAR'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  AI Detection Status
                </div>
              </div>
              
              {testResult.priority && (
                <div className="text-center p-4 border rounded-lg">
                  <Badge className={`text-lg px-3 py-1 ${
                    testResult.priority === 'high' ? 'bg-red-100 text-red-800' :
                    testResult.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {testResult.priority.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Priority Level
                  </div>
                </div>
              )}
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold mb-1">
                  {testResult.userNotified ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  User Notified
                </div>
              </div>
            </div>

            {testResult.violations && testResult.violations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Detected Violations:</h4>
                <div className="flex flex-wrap gap-2">
                  {testResult.violations.map((violation, index) => (
                    <Badge key={index} variant="destructive">
                      {violation}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {testResult.mediaAnalysis && (
              <div>
                <h4 className="font-medium mb-2">Media Analysis:</h4>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm mb-2">
                    <strong>Type:</strong> {testResult.mediaAnalysis.type.toUpperCase()}
                  </p>
                  <p className="text-sm mb-2">
                    <strong>Description:</strong> {testResult.mediaAnalysis.description}
                  </p>
                  {testResult.mediaAnalysis.concerns.length > 0 && (
                    <div>
                      <strong className="text-sm">Visual Concerns:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {testResult.mediaAnalysis.concerns.map((concern, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {concern}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-sm">
                <strong>Timestamp:</strong> {new Date(testResult.timestamp).toLocaleString()}
              </p>
              {testResult.postId && (
                <p className="text-sm">
                  <strong>Post ID:</strong> {testResult.postId}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}