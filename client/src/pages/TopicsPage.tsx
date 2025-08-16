import React from "react";
import { useNavigate } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { PlusCircle, MessageSquare } from "lucide-react";

interface TopicThread {
  id: string;
  title: string;
  repliesCount: number;
  category: string;
  lastReplyAt: string;
}

const dummyThreads: TopicThread[] = [
  {
    id: "1",
    title: "What did you think of Sunday's message?",
    repliesCount: 14,
    category: "Bible Study",
    lastReplyAt: "2h ago",
  },
  {
    id: "2",
    title: "How do you keep your faith in college?",
    repliesCount: 22,
    category: "Member Topics",
    lastReplyAt: "1d ago",
  },
  {
    id: "3",
    title: "Let's meet for prayer at 6pm Wednesday.",
    repliesCount: 4,
    category: "Coordination",
    lastReplyAt: "5h ago",
  },
];

export default function TopicsPage() {
  const [, navigate] = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Topics
        </h1>
        <Button
          onClick={() => navigate("/topics/new")}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Start New Topic
        </Button>
      </div>

      {/* Filter Options */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Browse recent community discussions below.</p>
      </div>

      {/* List of Topics */}
      <div className="space-y-4">
        {dummyThreads.map((thread) => (
          <Card
            key={thread.id}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => navigate(`/topics/${thread.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{thread.title}</h2>
                <span className="text-sm text-gray-500">{thread.repliesCount} replies</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {thread.category} • Last reply {thread.lastReplyAt}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}