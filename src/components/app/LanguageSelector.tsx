import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
];

interface LanguageSelectorProps {
  currentLanguage: string;
  userId: string;
  onLanguageChange?: (language: string) => void;
}

export const LanguageSelector = ({
  currentLanguage,
  userId,
  onLanguageChange
}: LanguageSelectorProps) => {
  const [selected, setSelected] = useState(currentLanguage);
  const [saving, setSaving] = useState(false);

  const handleSelect = async (code: string) => {
    if (code === selected) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ preferred_language: code })
        .eq("id", userId);

      if (error) throw error;

      setSelected(code);
      onLanguageChange?.(code);
      toast({
        title: "Idioma actualizado",
        description: `Ahora el sistema está en ${languages.find(l => l.code === code)?.name}`
      });
    } catch (error) {
      console.error("Error updating language:", error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el idioma",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleSelect(lang.code)}
          disabled={saving}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all",
            selected === lang.code
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/50"
          )}
        >
          <span className="text-lg">{lang.flag}</span>
          <span className="font-medium text-sm">{lang.name}</span>
          {selected === lang.code && (
            <Check className="w-4 h-4 text-primary" />
          )}
        </button>
      ))}
    </div>
  );
};
