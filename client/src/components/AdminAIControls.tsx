import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, Settings, Zap, Clock, Shield } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AIStatusData {
  aiService: string;
  models: {
    primary: string;
    costEffective: string;
    fallback: string;
  };
  features: string[];
  routeTimeouts: {
    [key: string]: string;
  };
}

const AdminAIControls: React.FC = () => {
  const [aiStatus, setAIStatus] = useState<AIStatusData | null>(null);
  const [gpt5MiniEnabled, setGPT5MiniEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAIStatus();
  }, []);

  const fetchAIStatus = async () => {
    try {
      const data = await apiRequest('GET', '/api/admin/ai/status');
      setAIStatus(data);
      setLoading(false);
    } catch (error: any) {
      toast({
        title: 'Failed to load AI status',
        description: error.message || 'Unable to fetch AI system status',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const toggleGPT5Mini = async (enabled: boolean) => {
    setUpdating(true);
    try {
      const response = await apiRequest('POST', '/api/admin/ai/toggle-gpt5-mini', {
        enabled
      });
      
      setGPT5MiniEnabled(enabled);
      toast({
        title: 'AI Settings Updated',
        description: response.message || `GPT-5-mini mode ${enabled ? 'enabled' : 'disabled'}`,
        variant: 'default'
      });
    } catch (error: any) {
      toast({
        title: 'Failed to update AI settings',
        description: error.message || 'Unable to toggle GPT-5-mini mode',
        variant: 'destructive'
      });
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>AI System Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading AI system status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!aiStatus) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>AI System Unavailable</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Unable to load AI system status. Please check your permissions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>GPT-5 AI System</span>
            <Badge variant="secondary" className="ml-2">Advanced</Badge>
          </CardTitle>
          <CardDescription>
            {aiStatus.aiService} with intelligent model routing and cost optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Zap className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium">Primary Model</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{aiStatus.models.primary}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium">Cost-Effective</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{aiStatus.models.costEffective}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-medium">Fallback</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{aiStatus.models.fallback}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Optimization Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Optimization</CardTitle>
          <CardDescription>
            Toggle GPT-5-mini mode for cost-effective operations on simple tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">GPT-5-mini Priority Mode</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use GPT-5-mini for simple tasks to reduce costs while maintaining quality
              </p>
            </div>
            <Switch
              checked={gpt5MiniEnabled}
              onCheckedChange={toggleGPT5Mini}
              disabled={updating}
            />
          </div>
          {updating && (
            <p className="text-sm text-blue-600 mt-2">Updating AI configuration...</p>
          )}
        </CardContent>
      </Card>

      {/* Route Timeouts */}
      <Card>
        <CardHeader>
          <CardTitle>Route Timeout Configuration</CardTitle>
          <CardDescription>
            Automatic timeout settings for different types of AI requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(aiStatus.routeTimeouts).map(([route, timeout]) => (
              <div key={route} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium capitalize">{route}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{timeout}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Features */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Features</CardTitle>
          <CardDescription>
            Current capabilities of the GPT-5 AI system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {aiStatus.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <h4>Intelligent Routing</h4>
            <p>The system automatically selects the appropriate model based on:</p>
            <ul>
              <li><strong>Simple tasks:</strong> GPT-5-mini for basic completions, categorization</li>
              <li><strong>Complex reasoning:</strong> GPT-5 for sermon research, theological analysis</li>
              <li><strong>Creative tasks:</strong> GPT-5 with higher temperature for creative content</li>
            </ul>
            
            <h4>Fallback Strategy</h4>
            <p>If the primary model fails, the system automatically falls back to GPT-5-mini with reduced parameters for reliability.</p>
            
            <h4>Streaming Support</h4>
            <p>Long responses use streaming to provide real-time feedback and better user experience.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAIControls;