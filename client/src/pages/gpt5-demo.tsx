import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Zap, 
  Clock, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Settings,
  Timer,
  TrendingUp
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const GPT5DemoPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const { toast } = useToast();

  const testCases = [
    {
      id: 'simple-mood',
      name: 'Simple Mood Verse (GPT-5-mini)',
      description: 'Request verses for anxious mood - uses GPT-5-mini for cost efficiency',
      endpoint: '/api/bible/verse-for-mood',
      method: 'POST',
      data: { moodId: 'anxious' },
      expectedModel: 'GPT-5-mini',
      complexity: 'Simple'
    },
    {
      id: 'sermon-research',
      name: 'Sermon Research (GPT-5)',
      description: 'Complex theological analysis - uses GPT-5 for deep reasoning',
      endpoint: '/api/sermon-studio/research',
      method: 'POST', 
      data: { scripture: 'John 3:16', topic: 'God\'s Love' },
      expectedModel: 'GPT-5',
      complexity: 'Complex'
    },
    {
      id: 'soap-suggestions',
      name: 'SOAP Suggestions (GPT-5)',
      description: 'Contextual spiritual guidance - uses GPT-5 for complex reasoning',
      endpoint: '/api/soap/ai/suggestions',
      method: 'POST',
      data: { scripture: 'Psalm 23:1', scriptureReference: 'Psalm 23:1' },
      expectedModel: 'GPT-5',
      complexity: 'Complex'
    },
    {
      id: 'post-categorization',
      name: 'Post Categorization (GPT-5-mini)',
      description: 'Simple content categorization - uses GPT-5-mini for efficiency',
      endpoint: '/api/discussions',
      method: 'POST',
      data: { content: 'Please pray for my family during this difficult time', communityId: 1 },
      expectedModel: 'GPT-5-mini',
      complexity: 'Simple'
    }
  ];

  const runSingleTest = async (testCase: any) => {
    setCurrentTest(testCase.id);
    setLoading(true);
    
    const startTime = Date.now();
    
    try {
      const response = await apiRequest(testCase.method, testCase.endpoint, testCase.data);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const result = {
        id: testCase.id,
        name: testCase.name,
        status: 'success',
        duration: `${duration}ms`,
        expectedModel: testCase.expectedModel,
        complexity: testCase.complexity,
        response: response,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTestResults(prev => [...prev, result]);
      
      toast({
        title: 'Test Completed',
        description: `${testCase.name} completed in ${duration}ms`,
        variant: 'default'
      });
      
    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const result = {
        id: testCase.id,
        name: testCase.name,
        status: 'error',
        duration: `${duration}ms`,
        expectedModel: testCase.expectedModel,
        complexity: testCase.complexity,
        error: error.message || 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTestResults(prev => [...prev, result]);
      
      toast({
        title: 'Test Failed',
        description: `${testCase.name}: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setCurrentTest('');
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    
    for (const testCase of testCases) {
      await runSingleTest(testCase);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              GPT-5 AI System Demo
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Test the intelligent routing system between GPT-5 and GPT-5-mini models
          </p>
          <Badge variant="secondary" className="mt-2">
            Advanced AI Integration
          </Badge>
        </div>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>System Architecture</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Zap className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-medium">Intelligent Routing</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Automatic selection between GPT-5 and GPT-5-mini based on task complexity
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Timer className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-medium">Smart Timeouts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Per-route timeout configuration: 15s-60s based on task type
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Shield className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-medium">Automatic Fallbacks</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Falls back to GPT-5-mini if primary model fails or times out
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>AI System Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-6">
              <Button 
                onClick={runAllTests} 
                disabled={loading}
                className="flex items-center space-x-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Run All Tests</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={clearResults}
                disabled={loading}
              >
                Clear Results
              </Button>
              {testResults.length > 0 && (
                <Badge variant="secondary">
                  {testResults.length} tests completed
                </Badge>
              )}
            </div>
            
            {/* Individual Test Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testCases.map((testCase) => (
                <Card key={testCase.id} className="border border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{testCase.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {testCase.description}
                        </p>
                      </div>
                      <Badge 
                        variant={testCase.complexity === 'Complex' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {testCase.expectedModel}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => runSingleTest(testCase)}
                      disabled={loading}
                      className="w-full mt-3"
                    >
                      {currentTest === testCase.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        'Run Test'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div 
                    key={result.id}
                    className={`p-4 rounded-lg border ${
                      result.status === 'success' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {result.status === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                          <h4 className="font-medium">{result.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {result.expectedModel}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                            <span className={`ml-2 font-medium ${
                              result.status === 'success' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {result.status === 'success' ? 'Success' : 'Failed'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                            <span className="ml-2 font-medium">{result.duration}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Complexity:</span>
                            <span className="ml-2 font-medium">{result.complexity}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Time:</span>
                            <span className="ml-2 font-medium">{result.timestamp}</span>
                          </div>
                        </div>
                        {result.error && (
                          <div className="mt-2 text-sm text-red-600">
                            <strong>Error:</strong> {result.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary Statistics */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Test Summary
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total Tests:</span>
                    <span className="ml-2 font-bold">{testResults.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Successful:</span>
                    <span className="ml-2 font-bold text-green-600">
                      {testResults.filter(r => r.status === 'success').length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Failed:</span>
                    <span className="ml-2 font-bold text-red-600">
                      {testResults.filter(r => r.status === 'error').length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Features */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Model Selection Criteria</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span><strong>GPT-5-mini:</strong> Simple categorization, basic completions</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span><strong>GPT-5:</strong> Complex reasoning, theological analysis</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span><strong>Creative:</strong> Sermon creation, spiritual guidance</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Timeout Configuration</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Simple tasks:</span>
                    <span className="font-medium">15 seconds</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Complex reasoning:</span>
                    <span className="font-medium">45 seconds</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Creative tasks:</span>
                    <span className="font-medium">60 seconds</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Default timeout:</span>
                    <span className="font-medium">30 seconds</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GPT5DemoPage;