import { CEOAvatar } from "./CEOAvatar";

export const ChatThinkingState = () => {
  return (
    <div className="flex gap-3 animate-fade-in">
      <CEOAvatar size="sm" isThinking />

      <div className="bg-card border border-border rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Thinking dots */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">Analizando...</span>
        </div>
      </div>
    </div>
  );
};
