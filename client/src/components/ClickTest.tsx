import { useState } from "react";
import { Button } from "./ui/button";

export default function ClickTest() {
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Click Test Component</h2>
      <p>Click count: {clickCount}</p>
      <Button 
        onClick={() => setClickCount(prev => prev + 1)}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Test Click ({clickCount})
      </Button>
      <div 
        className="w-32 h-32 bg-red-500 cursor-pointer flex items-center justify-center text-white font-bold"
        onClick={() => setClickCount(prev => prev + 10)}
      >
        Click +10
      </div>
    </div>
  );
}