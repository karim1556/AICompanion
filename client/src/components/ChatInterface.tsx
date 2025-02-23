import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Send } from "lucide-react";
import { sendChatMessage } from "@/lib/openai";
import { queryClient } from "@/lib/queryClient";
import type { Chat, Document } from "@shared/schema";

interface ChatInterfaceProps {
  onClose: () => void;
}

export default function ChatInterface({ onClose }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string>("all");

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const { data: chatHistory = [] } = useQuery<Chat[]>({
    queryKey: ["/api/chat/history"],
  });

  const mutation = useMutation({
    mutationFn: (message: string) => sendChatMessage(message, selectedDocId !== "all" ? Number(selectedDocId) : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      mutation.mutate(message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Chat</h2>
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>

      <div className="mb-4">
        <Select value={selectedDocId} onValueChange={setSelectedDocId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a document to chat about" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All documents</SelectItem>
            {documents.map((doc) => (
              <SelectItem key={doc.id} value={doc.id.toString()}>
                {doc.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1 mb-4">
        {chatHistory.map((chat) => (
          <Card key={chat.id} className="mb-4">
            <CardContent className="p-4">
              <p className="font-medium text-primary">{chat.message}</p>
              <p className="mt-2 text-muted-foreground">{chat.response}</p>
              {chat.context && (
                <p className="mt-2 text-xs text-muted-foreground">
                  From document: {(chat.context as { title: string }).title}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Type your message${selectedDocId !== "all" ? ' about this document' : ''}...`}
          className="flex-1"
        />
        <Button type="submit" disabled={mutation.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}