import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { ArrowLeft } from "lucide-react";

const categoryOptions = [
  "Bible Study",
  "Volunteering",
  "Member Questions",
  "Coordination",
  "Testimonies",
  "Other",
];

export default function NewTopicPage() {
  const [, navigate] = useLocation();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!title || !category || !body) {
      setError("All fields are required.");
      return;
    }

    setError("");

    // TODO: Replace with API call
    console.log("Submit:", { title, category, body });

    // Redirect to topics list
    navigate("/topics");
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Start a New Topic</h1>
        <button
          className="text-sm flex items-center gap-1 text-purple-600 hover:underline"
          onClick={() => navigate("/topics")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Enter a clear topic title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className="w-full border rounded p-2 mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select a category</option>
            {categoryOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="body">Post Content</Label>
          <Textarea
            id="body"
            placeholder="Write your discussion post here..."
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full">
          Post Topic
        </Button>
      </form>
    </div>
  );
}