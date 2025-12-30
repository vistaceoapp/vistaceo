import { useState, useRef } from "react";
import { 
  Settings2, 
  X, 
  GripVertical, 
  Eye, 
  EyeOff, 
  RotateCcw,
  Check,
  Heart,
  Target,
  Brain,
  Zap,
  BarChart3,
  Crosshair,
  Star,
  Radar,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { WidgetConfig } from "@/hooks/use-widget-config";

interface DashboardEditorProps {
  widgets: WidgetConfig[];
  onSave: (widgets: WidgetConfig[]) => Promise<void>;
  onToggle: (widgetId: string) => WidgetConfig[];
  onReorder: (section: "main" | "sidebar", fromIndex: number, toIndex: number) => WidgetConfig[];
  onReset: () => WidgetConfig[];
}

const ICON_MAP: Record<string, typeof Heart> = {
  Heart,
  Target,
  Brain,
  Zap,
  BarChart: BarChart3,
  Crosshair,
  Star,
  Radar,
};

export const DashboardEditor = ({ 
  widgets, 
  onSave, 
  onToggle, 
  onReorder, 
  onReset 
}: DashboardEditorProps) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragSection = useRef<"main" | "sidebar">("main");

  const mainWidgets = widgets
    .filter(w => w.section === "main")
    .sort((a, b) => a.order - b.order);
  
  const sidebarWidgets = widgets
    .filter(w => w.section === "sidebar")
    .sort((a, b) => a.order - b.order);

  const handleDragStart = (e: React.DragEvent, widgetId: string, section: "main" | "sidebar") => {
    setDraggedItem(widgetId);
    dragSection.current = section;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number, section: "main" | "sidebar") => {
    e.preventDefault();
    if (dragSection.current === section) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedItem !== null && dragOverIndex !== null) {
      const section = dragSection.current;
      const sectionWidgets = section === "main" ? mainWidgets : sidebarWidgets;
      const fromIndex = sectionWidgets.findIndex(w => w.id === draggedItem);
      
      if (fromIndex !== -1 && fromIndex !== dragOverIndex) {
        onReorder(section, fromIndex, dragOverIndex);
      }
    }
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(widgets);
      toast({
        title: "Configuración guardada",
        description: "Tu dashboard se ha actualizado correctamente.",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    onReset();
    toast({
      title: "Configuración restablecida",
      description: "Se han restaurado los valores predeterminados.",
    });
  };

  const renderWidgetItem = (widget: WidgetConfig, index: number, section: "main" | "sidebar") => {
    const Icon = ICON_MAP[widget.icon] || Heart;
    const isDragging = draggedItem === widget.id;
    const isDragOver = dragOverIndex === index && dragSection.current === section;

    return (
      <div
        key={widget.id}
        draggable={!widget.locked}
        onDragStart={(e) => handleDragStart(e, widget.id, section)}
        onDragOver={(e) => handleDragOver(e, index, section)}
        onDragEnd={handleDragEnd}
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl border transition-all",
          isDragging && "opacity-50 scale-95",
          isDragOver && "border-primary bg-primary/5",
          widget.visible ? "bg-secondary/30 border-border" : "bg-muted/30 border-border/50",
          !widget.locked && "cursor-grab active:cursor-grabbing"
        )}
      >
        {!widget.locked ? (
          <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
        
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          widget.visible ? "bg-primary/10" : "bg-muted"
        )}>
          <Icon className={cn(
            "w-4 h-4",
            widget.visible ? "text-primary" : "text-muted-foreground"
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium text-sm truncate",
            widget.visible ? "text-foreground" : "text-muted-foreground"
          )}>
            {widget.name}
          </p>
          {widget.locked && (
            <p className="text-[10px] text-muted-foreground">No removible</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {widget.locked ? (
            <Badge variant="outline" className="text-[10px]">
              Fijo
            </Badge>
          ) : (
            <Switch
              checked={widget.visible}
              onCheckedChange={() => onToggle(widget.id)}
              className="data-[state=checked]:bg-primary"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="w-4 h-4" />
          <span className="hidden sm:inline">Personalizar</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Personalizar Dashboard
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Arrastra los widgets para reordenarlos y usa los switches para mostrar u ocultar.
          </p>

          <Tabs defaultValue="main" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="main" className="flex-1">Contenido principal</TabsTrigger>
              <TabsTrigger value="sidebar" className="flex-1">Barra lateral</TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="mt-4 space-y-2">
              {mainWidgets.map((widget, index) => renderWidgetItem(widget, index, "main"))}
            </TabsContent>

            <TabsContent value="sidebar" className="mt-4 space-y-2">
              {sidebarWidgets.map((widget, index) => renderWidgetItem(widget, index, "sidebar"))}
            </TabsContent>
          </Tabs>

          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full gradient-primary"
            >
              {saving ? (
                <>Guardando...</>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restablecer predeterminados
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DashboardEditor;
