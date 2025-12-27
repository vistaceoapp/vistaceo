import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface SetupStepChipsProps {
  options: string[];
  selected: string[];
  onSelect: (value: string) => void;
  multiple?: boolean;
}

export const SetupStepChips = ({ options, selected, onSelect, multiple = false }: SetupStepChipsProps) => {
  const handleClick = (option: string) => {
    if (multiple) {
      // Toggle in array
      onSelect(option);
    } else {
      onSelect(option);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            onClick={() => handleClick(option)}
            className={cn(
              "px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium",
              "hover:border-primary/50 hover:bg-primary/5",
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              {isSelected && <Check className="w-4 h-4" />}
              {option}
            </span>
          </button>
        );
      })}
    </div>
  );
};
