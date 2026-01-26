import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Link2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  Lock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SocialProfileInputProps {
  platform: "instagram" | "facebook";
  businessId: string;
  onSuccess?: (data: any) => void;
  existingData?: {
    profile_url?: string;
    followers?: number;
    posts?: number;
    username?: string;
  };
}

const platformConfig = {
  instagram: {
    name: "Instagram",
    placeholder: "instagram.com/tu_negocio",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <defs>
          <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFDC80"/>
            <stop offset="50%" stopColor="#E1306C"/>
            <stop offset="100%" stopColor="#833AB4"/>
          </linearGradient>
        </defs>
        <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    color: "from-pink-500/20 to-purple-500/20",
  },
  facebook: {
    name: "Facebook",
    placeholder: "facebook.com/tu_pagina",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    color: "from-blue-500/20 to-blue-600/20",
  },
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const SocialProfileInput = ({
  platform,
  businessId,
  onSuccess,
  existingData,
}: SocialProfileInputProps) => {
  const [url, setUrl] = useState(existingData?.profile_url || "");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(existingData || null);
  const [error, setError] = useState<string | null>(null);

  const config = platformConfig[platform];

  const handleScrape = async () => {
    if (!url.trim()) {
      toast.error("Ingresá el link de tu perfil");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("scrape-social-profile", {
        body: { profileUrl: url, businessId, platform },
      });

      if (fnError) throw fnError;

      if (data.success && data.data) {
        setResult(data.data);
        toast.success(`${config.name} conectado correctamente`);
        onSuccess?.(data);
      } else {
        setError(data.error || "No pudimos extraer los datos");
        toast.error("Error al extraer datos del perfil");
      }
    } catch (err) {
      console.error("Scrape error:", err);
      setError("Error de conexión. Intentá de nuevo.");
      toast.error("Error al conectar");
    } finally {
      setIsLoading(false);
    }
  };

  // Show connected state with data
  if (result && result.followers) {
    return (
      <Card className={cn(
        "relative overflow-hidden",
        `bg-gradient-to-br ${config.color}`,
        "border-primary/20"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-background/80 flex items-center justify-center">
                {config.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{config.name}</p>
                <p className="text-xs text-muted-foreground">@{result.username || "perfil"}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] bg-background/50">
              <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-success" />
              Conectado
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center p-2 rounded-lg bg-background/50">
              <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold text-foreground">{formatNumber(result.followers)}</p>
              <p className="text-[10px] text-muted-foreground">Seguidores</p>
            </div>
            {result.posts && (
              <div className="text-center p-2 rounded-lg bg-background/50">
                <ImageIcon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold text-foreground">{formatNumber(result.posts)}</p>
                <p className="text-[10px] text-muted-foreground">Posts</p>
              </div>
            )}
            {result.following && (
              <div className="text-center p-2 rounded-lg bg-background/50">
                <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold text-foreground">{formatNumber(result.following)}</p>
                <p className="text-[10px] text-muted-foreground">Siguiendo</p>
              </div>
            )}
          </div>

          {/* PRO upgrade hint */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Lock className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">Conectá OAuth para más datos</p>
              <p className="text-[10px] text-muted-foreground">Engagement, alcance, insights PRO</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              <Sparkles className="w-2.5 h-2.5 mr-1" />
              PRO
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-xs"
            onClick={() => setResult(null)}
          >
            Cambiar perfil
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-2 hover:border-primary/50 transition-all">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            {config.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{config.name}</p>
            <p className="text-xs text-muted-foreground">Pegá el link de tu perfil</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={config.placeholder}
              className="pl-9 h-10"
              onKeyDown={(e) => e.key === "Enter" && handleScrape()}
            />
          </div>
          <Button 
            onClick={handleScrape} 
            disabled={isLoading}
            className="h-10"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Conectar"
            )}
          </Button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 flex items-center gap-2 text-xs text-destructive"
            >
              <AlertCircle className="w-3 h-3" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          Extraemos datos públicos: seguidores, posts, bio
        </p>
      </CardContent>
    </Card>
  );
};

export default SocialProfileInput;
