"use client";

import { MessageSquarePlus, X } from "lucide-react";
import type { LocalChat } from "@/lib/types";

type Props = {
  chats: LocalChat[];
  activeChatId: string;
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
};

export function ChatSidebar({
  chats,
  activeChatId,
  isOpen,
  onClose,
  onNewChat,
  onSelectChat,
}: Props) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/30 transition lg:hidden ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-80 max-w-[86vw] flex-col border-r border-[#D4AF37]/35 bg-[#3A083E] text-white transition-transform lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div>
            <p className="text-sm font-bold">Chat History</p>
            <p className="text-xs text-slate-400">Saved in this browser</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            title="Close menu"
            className="grid h-9 w-9 place-items-center rounded-md text-slate-300 hover:bg-white/10 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <button
            type="button"
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-[#3A083E] transition hover:bg-[#E5C451]"
          >
            <MessageSquarePlus size={18} />
            New Chat
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
          {chats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              onClick={() => onSelectChat(chat.id)}
              className={`w-full rounded-md px-3 py-3 text-left text-sm transition ${
                activeChatId === chat.id
                  ? "bg-[#D4AF37] text-[#3A083E]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="block truncate font-medium">{chat.title}</span>
              <span className="block text-xs opacity-70">
                {chat.messages.length} message{chat.messages.length === 1 ? "" : "s"}
              </span>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
