import { apiRequest } from "./queryClient";
import type { Chat } from "@shared/schema";

export async function sendChatMessage(
  message: string,
  documentId?: number
): Promise<Chat> {
  const response = await apiRequest("POST", "/api/chat", {
    message,
    documentId,
  });
  return response.json();
}
