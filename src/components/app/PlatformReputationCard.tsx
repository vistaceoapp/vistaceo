import { useState } from "react";
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ExternalLink,
  MessageSquare,
  Users,
  Eye,
  ThumbsUp,
  Play,
  Check,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface PlatformData {
  platform: "google" | "youtube" | "instagram" | "facebook" | "tiktok";
  connected: boolean;
  metrics: {
    mainScore?: number;
    mainLabel?: string;
    secondary?: Array<{ label: string; value: string | number; icon?: React.ReactNode }>;
    trend?: "up" | "down" | "stable";
    lastSync?: string;
  };
}

interface PlatformReputationCardProps {
  data: PlatformData;
  onConnect?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

const platformConfig = {
  google: {
    name: "Google Reviews",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    color: "from-blue-500/20 to-green-500/20",
    borderColor: "border-blue-500/30",
    scoreLabel: "Rating",
    scoreMax: 5,
  },
  youtube: {
    name: "YouTube",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    color: "from-red-500/20 to-red-600/20",
    borderColor: "border-red-500/30",
    scoreLabel: "Suscriptores",
    scoreMax: null,
  },
  instagram: {
    name: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <defs>
          <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFDC80"/>
            <stop offset="25%" stopColor="#F77737"/>
            <stop offset="50%" stopColor="#E1306C"/>
            <stop offset="75%" stopColor="#C13584"/>
            <stop offset="100%" stopColor="#833AB4"/>
          </linearGradient>
        </defs>
        <path fill="url(#instagram-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    color: "from-pink-500/20 to-purple-500/20",
    borderColor: "border-pink-500/30",
    scoreLabel: "Seguidores",
    scoreMax: null,
  },
  facebook: {
    name: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    color: "from-blue-600/20 to-blue-700/20",
    borderColor: "border-blue-600/30",
    scoreLabel: "Rating",
    scoreMax: 5,
  },
  tiktok: {
    name: "TikTok",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="currentColor" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    ),
    color: "from-gray-900/20 to-gray-800/20",
    borderColor: "border-gray-500/30",
    scoreLabel: "Seguidores",
    scoreMax: null,
  },
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const PlatformReputationCard = ({ 
  data, 
  onConnect, 
  onViewDetails,
  className 
}: PlatformReputationCardProps) => {
  const config = platformConfig[data.platform];
  
  const getTrendIcon = () => {
    switch (data.metrics.trend) {
      case "up": return <TrendingUp className="w-3 h-3 text-success" />;
      case "down": return <TrendingDown className="w-3 h-3 text-destructive" />;
      default: return <Minus className="w-3 h-3 text-muted-foreground" />;
    }
  };

  if (!data.connected) {
    return (
      <Card className={cn(
        "relative overflow-hidden border-dashed border-2 hover:border-primary/50 transition-all cursor-pointer group",
        className
      )} onClick={onConnect}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
              {config.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{config.name}</p>
              <p className="text-xs text-muted-foreground/70">No conectado</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              Conectar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "relative overflow-hidden",
      `bg-gradient-to-br ${config.color}`,
      config.borderColor,
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center">
              {config.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{config.name}</p>
              {data.metrics.lastSync && (
                <p className="text-[10px] text-muted-foreground">
                  Sync: {data.metrics.lastSync}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <Badge variant="outline" className="text-[10px] bg-background/50">
              <Check className="w-2.5 h-2.5 mr-0.5" />
              Activo
            </Badge>
          </div>
        </div>

        {/* Main Score */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {config.scoreMax 
                ? data.metrics.mainScore?.toFixed(1) 
                : formatNumber(data.metrics.mainScore || 0)
              }
            </span>
            {config.scoreMax && (
              <span className="text-sm text-muted-foreground">/ {config.scoreMax}</span>
            )}
            <span className="text-xs text-muted-foreground ml-1">{config.scoreLabel}</span>
          </div>
          {config.scoreMax && data.metrics.mainScore && (
            <Progress 
              value={(data.metrics.mainScore / config.scoreMax) * 100} 
              className="h-1.5 mt-2" 
            />
          )}
        </div>

        {/* Secondary Metrics */}
        {data.metrics.secondary && data.metrics.secondary.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {data.metrics.secondary.slice(0, 4).map((metric, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs">
                {metric.icon}
                <span className="text-muted-foreground">{metric.label}:</span>
                <span className="font-medium text-foreground">{metric.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* View Details */}
        {onViewDetails && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-3 text-xs h-7"
            onClick={onViewDetails}
          >
            Ver detalles
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PlatformReputationCard;