import Image from "next/image";
import type { ChatMessage as ChatMessageType } from "@/lib/types";

type Props = {
  message: ChatMessageType;
};

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <Image
          src="/uniben-compass-bot.png"
          alt="UNIBEN Compass AI mascot"
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 rounded-xl border border-[#D4AF37]/50 object-cover shadow-sm"
        />
      )}
      <div
        className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm ${
          isUser
            ? "border border-[#D4AF37]/60 bg-[#92049A] text-white"
            : "border border-[#D4AF37]/35 bg-white text-slate-800"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
