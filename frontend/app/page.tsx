"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatSidebar } from "@/components/ChatSidebar";
import { Header } from "@/components/Header";
import { LoadingDots } from "@/components/LoadingDots";
import { sendChatMessage } from "@/lib/api";
import type { ChatMessage as ChatMessageType, LocalChat } from "@/lib/types";

const STORAGE_KEY = "uniben-compass-ai-chats";

function createChat(): LocalChat {
  return {
    id: crypto.randomUUID(),
    backendChatId: null,
    title: "New UNIBEN chat",
    messages: [],
  };
}

export default function Home() {
  const [chats, setChats] = useState<LocalChat[]>([createChat()]);
  const [activeChatId, setActiveChatId] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [audience, setAudience] = useState("general");

  useEffect(() => {
    const savedChats = localStorage.getItem(STORAGE_KEY);
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats) as LocalChat[];
      if (parsedChats.length > 0) {
        setChats(parsedChats);
        setActiveChatId(parsedChats[0].id);
        return;
      }
    }

    const firstChat = createChat();
    setChats([firstChat]);
    setActiveChatId(firstChat.id);
  }, []);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }
  }, [chats, activeChatId]);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) || chats[0],
    [chats, activeChatId],
  );

  function updateActiveChat(
    messages: ChatMessageType[],
    title?: string,
    backendChatId?: string | null,
  ) {
    setChats((currentChats) =>
      currentChats.map((chat) =>
        chat.id === activeChat.id
          ? {
              ...chat,
              title: title || chat.title,
              messages,
              backendChatId:
                backendChatId === undefined ? chat.backendChatId : backendChatId,
            }
          : chat,
      ),
    );
  }

  function handleNewChat() {
    const nextChat = createChat();
    setChats((currentChats) => [nextChat, ...currentChats]);
    setActiveChatId(nextChat.id);
    setError("");
    setIsSidebarOpen(false);
  }

  function handleSelectChat(chatId: string) {
    setActiveChatId(chatId);
    setError("");
    setIsSidebarOpen(false);
  }

  async function handleSend(message: string) {
    if (!activeChat) return;

    setError("");
    setIsLoading(true);

    const userMessage: ChatMessageType = { role: "user", content: message };
    const nextMessages = [...activeChat.messages, userMessage];
    const nextTitle =
      activeChat.messages.length === 0
        ? message.slice(0, 54) + (message.length > 54 ? "..." : "")
        : activeChat.title;

    updateActiveChat(nextMessages, nextTitle);

    try {
      const response = await sendChatMessage({
        message,
        chatId: activeChat.backendChatId ?? null,
        history: activeChat.messages,
        audience,
      });

      const sourceText =
        response.sources.length > 0
          ? `\n\nSources:\n${response.sources
              .map((source, index) => `${index + 1}. ${source.title}${source.url ? ` - ${source.url}` : ""}`)
              .join("\n")}`
          : "";

      const assistantMessage: ChatMessageType = {
        role: "assistant",
        content: `${response.answer}${sourceText}`,
      };

      updateActiveChat(
        [...nextMessages, assistantMessage],
        nextTitle,
        response.chat_id,
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong. Please try again.";
      setError(message);
      updateActiveChat(activeChat.messages, activeChat.title);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex h-screen overflow-hidden bg-slate-100">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChat?.id || ""}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      <section className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="border-b border-slate-200 bg-white px-4 py-3">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-slate-700" htmlFor="audience">
              Audience
            </label>
            <select
              id="audience"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-600"
            >
              <option value="general">General</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="postgraduate">Postgraduate</option>
              <option value="admitted">Admitted Student</option>
              <option value="student">Current Student</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            {activeChat?.messages.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-md bg-emerald-50 text-emerald-700">
                  <Sparkles size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-950">
                  Ask UNIBEN Compass AI
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Try questions about admissions, Post-UTME, postgraduate applications,
                  clearance, school fees, student portal issues, hostel guidance, or general
                  University of Benin inquiries.
                </p>
              </div>
            ) : (
              activeChat?.messages.map((message, index) => (
                <ChatMessage key={`${message.role}-${index}`} message={message} />
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <LoadingDots />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        <ChatInput disabled={isLoading} onSend={handleSend} />
      </section>
    </main>
  );
}
