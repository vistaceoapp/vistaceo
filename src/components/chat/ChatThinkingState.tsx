import { CEOAvatar } from "./CEOAvatar";

export const ChatThinkingState = () => {
  return (
    <div className="flex gap-3 items-start animate-fade-in">
      <CEOAvatar size="sm" isThinking showStatus={false} />

      <div className="bg-card/80 backdrop-blur-sm border border-border/60 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Premium thinking indicator */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ 
                  background: "linear-gradient(135deg, #2692DC, #746CE6)",
                  animation: `bounce 1s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`
                }}
              />
            ))}
          </div>
          <span className="text-sm font-medium bg-gradient-to-r from-[#2692DC] to-[#746CE6] bg-clip-text text-transparent">
            Analizando tu consulta...
          </span>
        </div>
      </div>
    </div>
  );
};
