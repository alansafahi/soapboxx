import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { PlusCircle, MessageSquare, Users, Heart, MessageCircle, Plus } from "lucide-react";

interface TopicThread {
  id: string;
  title: string;
  repliesCount: number;
  category: string;
  lastReplyAt: string;
  lastReplier?: string;
  isNew?: boolean;
}

interface Post {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
}

const mockTopics: TopicThread[] = [
  {
    id: "1",
    title: "What did you think of Sunday's message?",
    repliesCount: 14,
    category: "Bible Study",
    lastReplyAt: "2h ago",
    lastReplier: "Sarah J",
  },
  {
    id: "2",
    title: "How do you keep your faith in college?",
    repliesCount: 22,
    category: "Member Topics",
    lastReplyAt: "1d ago",
    lastReplier: "Mike C",
  },
  {
    id: "3",
    title: "Let's meet for prayer at 6pm Wednesday.",
    repliesCount: 4,
    category: "Prayer Requests",
    lastReplyAt: "5h ago",
    lastReplier: "Lisa D",
    isNew: true,
  },
  {
    id: "4",
    title: "Youth ministry volunteer opportunities",
    repliesCount: 8,
    category: "Youth",
    lastReplyAt: "3h ago",
    lastReplier: "Pastor Tom",
  },
  {
    id: "5",
    title: "Bible study group forming - Thursday evenings",
    repliesCount: 12,
    category: "Bible Study",
    lastReplyAt: "6h ago",
    lastReplier: "Jennifer M",
  },
];

const samplePosts: Post[] = [
  {
    id: 1,
    author: "Sarah Johnson",
    content: "Grateful for our pastor's message today about finding peace in difficult times. Really needed to hear that! 🙏",
    timestamp: "2h ago",
    likes: 12,
    comments: 3,
  },
  {
    id: 2,
    author: "Mike Chen", 
    content: "Looking forward to the youth retreat next weekend! Who else is going?",
    timestamp: "4h ago",
    likes: 8,
    comments: 5,
  },
  {
    id: 3,
    author: "Lisa Davis",
    content: "Beautiful sunrise this morning. Reminded me of God's faithfulness every day.",
    timestamp: "6h ago", 
    likes: 15,
    comments: 2,
  },
  {
    id: 4,
    author: "Pastor Tom",
    content: "Reminder: Community service day this Saturday at 9 AM. We'll be helping at the local food bank. All are welcome!",
    timestamp: "8h ago",
    likes: 20,
    comments: 7,
  },
];

const categories = ["All", "Bible Study", "Youth", "Member Topics", "Prayer Requests", "Events", "Testimonies"];

export default function TopicsPage() {
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filter topics by selected category
  const filteredTopics = selectedCategory === "All" 
    ? mockTopics 
    : mockTopics.filter(topic => topic.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Community Discussions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Connect through posts and topics with your community.</p>
        </div>
      </div>

      {/* Posts/Topics Tabs */}
      <Tabs defaultValue="topics" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Topics
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab Content */}
        <TabsContent value="posts">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-gray-600 dark:text-gray-400">Recent community posts and updates</p>
            <Button 
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
          
          <div className="space-y-4">
            {samplePosts.map((post) => (
              <Card key={post.id} className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{post.author}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">{post.timestamp}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <button className="flex items-center gap-1 hover:text-purple-600">
                          <Heart className="w-4 h-4" />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-purple-600">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments}
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Topics Tab Content */}
        <TabsContent value="topics">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <p className="text-gray-600 dark:text-gray-400">Browse threaded discussions by category</p>
            <Button 
              onClick={() => navigate("/topics/new")}
              className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Start New Topic
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  selectedCategory === category 
                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                    : "hover:bg-purple-50 dark:hover:bg-purple-900 hover:text-purple-600"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Topics List */}
          <div className="space-y-4">
            {filteredTopics.map((topic) => (
              <Card
                key={topic.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
                onClick={() => navigate(`/topics/${topic.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-600 bg-purple-50 dark:bg-purple-900 px-2 py-1 rounded-full">
                          {topic.category}
                        </span>
                        {topic.isNew && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            New
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {topic.title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {topic.repliesCount} replies
                        </span>
                        {topic.lastReplier && (
                          <span>
                            Last reply by {topic.lastReplier} • {topic.lastReplyAt}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTopics.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No topics found in this category.</p>
              <Button 
                onClick={() => setSelectedCategory("All")}
                variant="outline"
                className="mt-4"
              >
                Show All Topics
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-20 right-4 sm:hidden z-40">
        <Button
          onClick={() => navigate("/topics/new")}
          size="icon"
          className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}