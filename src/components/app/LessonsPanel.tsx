import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Brain, Lightbulb, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Lesson {
  id: string;
  content: string;
  category: string;
  source: string;
  importance: number;
  created_at: string;
}

const categoryIcons: Record<string, string> = {
  ventas: "💰",
  operaciones: "⚙️",
  marketing: "📱",
  equipo: "👥",
  finanzas: "📊",
  clientes: "⭐",
  general: "💡",
};

const categoryLabels: Record<string, string> = {
  ventas: "Ventas",
  operaciones: "Operaciones",
  marketing: "Marketing",
  equipo: "Equipo",
  finanzas: "Finanzas",
  clientes: "Clientes",
  general: "General",
};

export const LessonsPanel = () => {
  const { currentBusiness } = useBusiness();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialog, setAddDialog] = useState(false);
  const [newLesson, setNewLesson] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentBusiness) {
      fetchLessons();
    }
  }, [currentBusiness]);

  const fetchLessons = async () => {
    if (!currentBusiness) return;

    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .order("importance", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const addLesson = async () => {
    if (!currentBusiness || !newLesson.trim()) return;
    setSaving(true);

    try {
      const { error } = await supabase.from("lessons").insert({
        business_id: currentBusiness.id,
        content: newLesson.trim(),
        category: newCategory,
        source: "manual",
        importance: 5,
      });

      if (error) throw error;

      toast({ title: "Lección guardada" });
      setNewLesson("");
      setNewCategory("general");
      setAddDialog(false);
      fetchLessons();
    } catch (error) {
      console.error("Error adding lesson:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la lección",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (id: string) => {
    try {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
      setLessons(prev => prev.filter(l => l.id !== id));
      toast({ title: "Lección eliminada" });
    } catch (error) {
      console.error("Error deleting lesson:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-secondary/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Lecciones Aprendidas</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setAddDialog(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Agregar
        </Button>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-8 px-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            A medida que uses el chat, la IA irá guardando insights importantes sobre tu negocio.
          </p>
          <Button variant="outline" size="sm" onClick={() => setAddDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Agregar lección manual
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className={cn(
                "group p-3 rounded-lg border border-border bg-card/50",
                "hover:bg-secondary/30 transition-colors"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">
                  {categoryIcons[lesson.category] || "💡"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">
                    {lesson.content}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-muted-foreground">
                      {categoryLabels[lesson.category] || "General"}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(lesson.created_at).toLocaleDateString("es")}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => deleteLesson(lesson.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Lesson Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar lección aprendida</DialogTitle>
            <DialogDescription>
              Guarda insights importantes que la IA recordará para darte mejores consejos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Lección o insight</Label>
              <Textarea
                value={newLesson}
                onChange={(e) => setNewLesson(e.target.value)}
                placeholder="Ej: Los domingos tenemos más familias, funciona mejor el menú infantil"
                className="mt-1 min-h-[100px]"
              />
            </div>
            <div>
              <Label>Categoría</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {categoryIcons[key]} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => setAddDialog(false)}>
              Cancelar
            </Button>
            <Button 
              className="flex-1" 
              onClick={addLesson} 
              disabled={saving || !newLesson.trim()}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
