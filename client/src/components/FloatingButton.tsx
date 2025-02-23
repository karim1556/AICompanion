import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import ChatInterface from "./ChatInterface";

export default function FloatingButton() {
  const [isLongPress, setIsLongPress] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      setIsLongPress(true);
      setIsOpen(true);
    }, 3000);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }
    setIsLongPress(false);
  };

  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="rounded-full w-16 h-16 shadow-lg"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
          >
            <MessageCircle className="h-8 w-8" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <ChatInterface onClose={() => setIsOpen(false)} context={null} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
