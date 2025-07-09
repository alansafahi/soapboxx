import { Plus } from "lucide-react";
import { Button } from "./ui/button";

interface FloatingPostButtonProps {
  onClick: () => void;
}

export default function FloatingPostButton({ onClick }: FloatingPostButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg md:hidden"
      size="icon"
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
}