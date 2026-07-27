"use client";

import { SendHorizonal } from "lucide-react";
import { FormEvent, KeyboardEvent, useState } from "react";

type Props = {
  disabled: boolean;
  onSend: (message: string) => Promise<void>;
};

export function ChatInput({ disabled, onSend }: Props) {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanMessage = message.trim();
    if (!cleanMessage || disabled) return;

    setMessage("");
    await onSend(cleanMessage);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-4">
      <div className="mx-auto flex max-w-4xl items-end gap-3">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={2}
          placeholder="Ask about admissions, clearance, postgraduate studies, fees, portals..."
          className="min-h-12 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          aria-label="Send message"
          title="Send message"
          className="grid h-12 w-12 place-items-center rounded-md bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <SendHorizonal size={20} />
        </button>
      </div>
    </form>
  );
}

