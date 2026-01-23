import { useState } from "react";
import { 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Facebook, 
  Instagram, 
  ArrowRight,
  HelpCircle,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface MetaRequirementsGuideProps {
  onReady: () => void;
  variant?: "instagram" | "facebook" | "both";
}

interface RequirementStep {
  id: string;
  title: string;
  description: string;
  helpLink?: string;
  helpText?: string;
}

const REQUIREMENTS: RequirementStep[] = [
  {
    id: "fb_page",
    title: "Tener una Página de Facebook",
    description: "Necesitás una Página de Facebook para tu negocio (no perfil personal)",
    helpLink: "https://www.facebook.com/pages/create",
    helpText: "Crear Página de Facebook",
  },
  {
    id: "ig_business",
    title: "Cuenta de Instagram Profesional",
    description: "Tu Instagram debe ser 'Cuenta profesional' (Business o Creator)",
    helpLink: "https://help.instagram.com/502981923235522",
    helpText: "Cómo cambiar a cuenta profesional",
  },
  {
    id: "ig_linked",
    title: "Instagram vinculado a tu Página de Facebook",
    description: "La cuenta de Instagram debe estar conectada a la Página de Facebook",
    helpLink: "https://help.instagram.com/570895513091465",
    helpText: "Cómo vincular Instagram a Facebook",
  },
  {
    id: "admin",
    title: "Ser administrador de la Página",
    description: "Debés tener permisos de administrador en la Página de Facebook",
    helpLink: "https://www.facebook.com/help/289207354498410",
    helpText: "Ver permisos de página",
  },
];

export const MetaRequirementsGuide = ({ 
  onReady, 
  variant = "both" 
}: MetaRequirementsGuideProps) => {
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    setCheckedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  // Filter requirements based on variant
  const filteredRequirements = variant === "facebook" 
    ? REQUIREMENTS.filter(r => r.id === "fb_page" || r.id === "admin")
    : REQUIREMENTS;

  const allChecked = filteredRequirements.every(r => checkedSteps.has(r.id));
  const progress = (checkedSteps.size / filteredRequirements.length) * 100;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          {variant === "facebook" ? (
            <Facebook className="w-5 h-5 text-primary" />
          ) : variant === "instagram" ? (
            <Instagram className="w-5 h-5 text-pink-500" />
          ) : (
            <Sparkles className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">
            {variant === "facebook" 
              ? "Requisitos para conectar Facebook"
              : variant === "instagram"
              ? "Requisitos para conectar Instagram"
              : "Requisitos para conectar Meta"
            }
          </p>
          <p className="text-xs text-muted-foreground">
            Verificá estos puntos antes de continuar
          </p>
        </div>
        <Badge variant="outline" className={cn(
          "text-xs",
          allChecked 
            ? "bg-success/10 text-success border-success/30" 
            : "bg-warning/10 text-warning border-warning/30"
        )}>
          {checkedSteps.size}/{filteredRequirements.length}
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Requirements checklist */}
      <div className="space-y-2">
        {filteredRequirements.map((req, index) => (
          <div
            key={req.id}
            className={cn(
              "p-3 rounded-lg border transition-all cursor-pointer",
              checkedSteps.has(req.id)
                ? "bg-success/5 border-success/30"
                : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
            )}
            onClick={() => toggleStep(req.id)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {checkedSteps.has(req.id) ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium text-sm",
                  checkedSteps.has(req.id) && "text-success"
                )}>
                  {index + 1}. {req.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {req.description}
                </p>
                {req.helpLink && !checkedSteps.has(req.id) && (
                  <a
                    href={req.helpLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                    {req.helpText}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="faq" className="border-none">
          <AccordionTrigger className="text-xs text-muted-foreground hover:no-underline py-2">
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              ¿Por qué se requiere esto?
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-xs text-muted-foreground space-y-2 pl-4">
              <p>
                <strong>Meta (Facebook/Instagram)</strong> solo permite acceder a datos de negocios 
                a través de su API oficial, que requiere:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Una Página de Facebook representa a tu negocio</li>
                <li>Instagram Business está diseñado para métricas</li>
                <li>La vinculación permite acceso unificado a ambas plataformas</li>
              </ul>
              <p className="text-primary/80">
                Una vez configurado, sincronizaremos automáticamente tus métricas de 
                seguidores, engagement, menciones y más.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Warning if not ready */}
      {!allChecked && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
          <p className="text-xs text-warning">
            Marcá todos los pasos completados antes de continuar
          </p>
        </div>
      )}

      {/* Action button */}
      <Button 
        className="w-full" 
        onClick={onReady}
        disabled={!allChecked}
      >
        {allChecked ? (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Estoy listo, conectar ahora
          </>
        ) : (
          <>
            Completá los requisitos
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};

export default MetaRequirementsGuide;
