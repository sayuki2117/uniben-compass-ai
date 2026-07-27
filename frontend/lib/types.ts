export type Role = "user" | "assistant";

export type ChatMessage = {
  role: Role;
  content: string;
};

export type ChatSource = {
  title: string;
  url?: string | null;
  content: string;
};

export type ChatResponse = {
  chat_id: string | null;
  answer: string;
  sources: ChatSource[];
};

export type LocalChat = {
  id: string;
  backendChatId?: string | null;
  title: string;
  messages: ChatMessage[];
};
