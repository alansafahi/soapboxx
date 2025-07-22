import React from 'react';
import ImageGallery from '@/components/ImageGallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Database, Images } from 'lucide-react';

const ImageGalleryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 dark:bg-red-900 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Database Image Gallery
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                SoapBox Owner Admin View - All Images Stored in Database
              </p>
            </div>
          </div>

          {/* Admin Warning */}
          <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <Database className="w-5 h-5" />
                Admin Access Only
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-700 dark:text-red-300">
                This page displays all images stored in the SoapBox database across discussions, 
                prayer requests, and S.O.A.P. entries. Access is restricted to SoapBox owners only. 
                This functionality may be added to the separate SoapBox Portal in the future.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gallery Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                  <Images className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Images</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">Loading...</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                  <span className="text-purple-600 dark:text-purple-400">🙏</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Prayer Images</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">Loading...</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                  <span className="text-green-600 dark:text-green-400">📖</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">S.O.A.P. Images</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">Loading...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image Gallery Component */}
        <ImageGallery />
      </div>
    </div>
  );
};

export default ImageGalleryPage;