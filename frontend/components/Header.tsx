"use client";

import { GraduationCap, ShieldCheck } from "lucide-react";
import { MobileMenuButton } from "@/components/MobileMenuButton";

type Props = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: Props) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <MobileMenuButton onClick={onMenuClick} />
        <div className="grid h-10 w-10 place-items-center rounded-md bg-emerald-700 text-white">
          <GraduationCap size={22} />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-950">UNIBEN Compass AI</h1>
          <p className="text-xs text-slate-500">University inquiry assistant</p>
        </div>
      </div>

      <div className="hidden items-center gap-2 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 sm:flex">
        <ShieldCheck size={15} />
        Secure backend API
      </div>
    </header>
  );
}

