import type { ChatMessage, ChatResponse } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";

export async function sendChatMessage(params: {
  message: string;
  chatId: string | null;
  history: ChatMessage[];
  audience: string;
}): Promise<ChatResponse> {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: params.message,
      chat_id: params.chatId,
      history: params.history,
      audience: params.audience,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "The backend could not answer right now.");
  }

  return response.json();
}

