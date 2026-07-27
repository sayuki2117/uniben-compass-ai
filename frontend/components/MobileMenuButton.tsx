"use client";

import { Menu } from "lucide-react";

type Props = {
  onClick: () => void;
};

export function MobileMenuButton({ onClick }: Props) {
  return (
    <button
      type="button"
      aria-label="Open chat menu"
      title="Open menu"
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 lg:hidden"
    >
      <Menu size={20} />
    </button>
  );
}

