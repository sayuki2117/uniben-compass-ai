export function LoadingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-2" aria-label="AI is thinking">
      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-700 [animation-delay:-0.2s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-700 [animation-delay:-0.1s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-700" />
    </div>
  );
}

