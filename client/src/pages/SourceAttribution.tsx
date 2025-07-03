import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Book, Shield, ExternalLink, Calendar } from 'lucide-react';

interface BibleVersion {
  code: string;
  name: string;
  attribution?: string;
  license?: string;
  source: 'public_domain' | 'free_open' | 'licensed';
  phase: 1 | 2 | 3;
}

interface AttributionData {
  publicDomain: BibleVersion[];
  freeOpen: BibleVersion[];
  licensed: BibleVersion[];
  lastUpdated: string;
  disclaimer: string;
}

export default function SourceAttribution() {
  const { data: attribution, isLoading } = useQuery<AttributionData>({
    queryKey: ['/api/bible/attribution'],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'public_domain': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'free_open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'licensed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'public_domain': return 'Public Domain';
      case 'free_open': return 'Free & Open';
      case 'licensed': return 'Licensed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full">
            <Book className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Bible Source Attribution
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          SoapBox Super App respects copyright and licensing requirements for all Bible translations. 
          This page provides transparency about our scripture sources and usage rights.
        </p>
      </div>

      {/* Legal Disclaimer */}
      <Card className="mb-8 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Shield className="h-5 w-5" />
            Legal Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
            {attribution?.disclaimer || 'Bible text content is used in accordance with publisher licensing terms and fair use provisions.'}
          </p>
        </CardContent>
      </Card>

      {/* Public Domain Versions */}
      {attribution?.publicDomain && attribution.publicDomain.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className={getSourceBadgeColor('public_domain')}>
                {getSourceLabel('public_domain')}
              </Badge>
              Public Domain Bible Versions
            </CardTitle>
            <CardDescription>
              These translations are in the public domain and freely available for all uses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {attribution.publicDomain.map((version) => (
                <div key={version.code} className="border rounded-lg p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-800 dark:text-green-200">{version.name}</h3>
                    <Badge variant="outline" className="text-xs">{version.code}</Badge>
                  </div>
                  {version.attribution && (
                    <p className="text-sm text-green-700 dark:text-green-300 mb-2">{version.attribution}</p>
                  )}
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Phase {version.phase} • Local Database Storage
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Free & Open Versions */}
      {attribution?.freeOpen && attribution.freeOpen.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className={getSourceBadgeColor('free_open')}>
                {getSourceLabel('free_open')}
              </Badge>
              Free & Open Bible Versions
            </CardTitle>
            <CardDescription>
              These translations are freely available with attribution requirements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {attribution.freeOpen.map((version) => (
                <div key={version.code} className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200">{version.name}</h3>
                    <Badge variant="outline" className="text-xs">{version.code}</Badge>
                  </div>
                  {version.attribution && (
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">{version.attribution}</p>
                  )}
                  {version.license && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">License: {version.license}</p>
                  )}
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Phase {version.phase} • Local Database Storage
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Licensed Versions */}
      {attribution?.licensed && attribution.licensed.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className={getSourceBadgeColor('licensed')}>
                {getSourceLabel('licensed')}
              </Badge>
              Licensed Bible Versions
            </CardTitle>
            <CardDescription>
              These translations require proper licensing and are accessed through authorized APIs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {attribution.licensed.map((version) => (
                <div key={version.code} className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-purple-800 dark:text-purple-200">{version.name}</h3>
                    <Badge variant="outline" className="text-xs">{version.code}</Badge>
                  </div>
                  {version.attribution && (
                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">{version.attribution}</p>
                  )}
                  {version.license && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">License: {version.license}</p>
                  )}
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    Phase {version.phase} • OpenAI API Access
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="my-8" />

      {/* Footer Information */}
      <div className="text-center space-y-4">
        {attribution?.lastUpdated && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            Last Updated: {new Date(attribution.lastUpdated).toLocaleDateString()}
          </div>
        )}
        
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>
            SoapBox Super App implements a phased approach to Bible content licensing:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="font-semibold text-green-800 dark:text-green-200">Phase 1</div>
              <div className="text-xs text-green-600 dark:text-green-400">Public Domain Versions</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="font-semibold text-blue-800 dark:text-blue-200">Phase 2</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Free & Open Versions</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="font-semibold text-purple-800 dark:text-purple-200">Phase 3</div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Licensed Versions via API</div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500 max-w-2xl mx-auto">
          For questions about Bible translation usage, licensing, or attribution, 
          please contact our support team. We are committed to respecting all copyright 
          and licensing requirements while providing accurate scripture access to our users.
        </p>
      </div>
    </div>
  );
}