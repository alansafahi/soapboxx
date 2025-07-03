import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Play, Video, Upload } from "lucide-react";

export default function VideoLibrary() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Video Library
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Spiritual content and devotionals for your faith journey
            </p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Upload className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
        </div>

        {/* Coming Soon Section */}
        <div className="text-center py-16">
          <div className="mb-8">
            <Video className="h-24 w-24 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Video Library Coming Soon
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We're building a comprehensive video library with sermons, devotionals, 
              Bible studies, and spiritual content. This feature will be available soon.
            </p>
          </div>

          {/* Sample Video Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              { title: "Daily Devotional", category: "Devotional" },
              { title: "Sunday Sermon", category: "Sermon" },
              { title: "Bible Study", category: "Study" },
              { title: "Prayer Guide", category: "Prayer" },
              { title: "Worship Session", category: "Worship" },
              { title: "Testimony", category: "Testimony" }
            ].map((video, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow duration-200">
                <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-t-lg overflow-hidden">
                  <div className="flex items-center justify-center h-full">
                    <Play className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
                    <Button
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 text-gray-900 hover:bg-opacity-100"
                      size="sm"
                      disabled
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Coming Soon
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {video.title}
                  </h3>
                  <div className="text-sm text-purple-600 dark:text-purple-400">
                    {video.category}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}