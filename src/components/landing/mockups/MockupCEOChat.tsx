import { motion } from "framer-motion";
import { 
  Home, MessageSquare, Target, Sparkles, BarChart3, 
  Settings, HelpCircle, Moon, ChevronRight, Bell, 
  Mic, Paperclip, Send, Clock, Star, Zap, Heart, Building, 
  Brain, Briefcase, ChevronDown
} from "lucide-react";

export const MockupCEOChat = () => {
  const personalityOptions = [
    { name: "Balanceada", desc: "Respuestas equilibradas", default: true },
    { name: "Directo", desc: "Sin vueltas, al grano" },
    { name: "Técnico", desc: "Datos, métricas, análisis" },
    { name: "Formal", desc: "Ejecutivo y estructurado" },
    { name: "Cercano", desc: "Amigable y motivador" },
    { name: "Estratega", desc: "Visión macro y largo plazo" },
  ];

  return (
    <div className="bg-background rounded-2xl border border-border shadow-2xl overflow-hidden w-full">
      {/* Browser header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-warning/60" />
          <div className="w-3 h-3 rounded-full bg-success/60" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-4 py-1 rounded-full bg-muted text-[10px] text-muted-foreground">
            app.vistaceo.com/chat
          </div>
        </div>
      </div>

      <div className="flex min-h-[400px]">
        {/* Sidebar */}
        <div className="w-56 bg-card border-r border-border p-4 hidden lg:flex flex-col">
          {/* Business header */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
            <div className="text-lg font-bold text-primary">vistaceo</div>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Building className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Café la tratoria</div>
              <div className="text-[10px] text-muted-foreground">Cafeteria</div>
            </div>
          </div>
          
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Principal</div>
          
          {/* Navigation items */}
          <div className="space-y-1 flex-1">
            {[
              { icon: Home, label: "Inicio", sub: "Dashboard principal" },
              { icon: MessageSquare, label: "Chat", sub: "Asistente IA", badge: "IA", active: true },
              { icon: Target, label: "Misiones", sub: "Proyectos activos" },
              { icon: Sparkles, label: "Radar", sub: "Oportunidades", badge: "3" },
              { icon: BarChart3, label: "Analytics", sub: "Métricas y tendenci...", badgeText: "Nuevo" },
            ].map((item, i) => (
              <div 
                key={i}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  item.active 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.label}</div>
                  <div className={`text-[10px] truncate ${item.active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {item.sub}
                  </div>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                    item.active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.badgeText && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-success/10 text-success">
                    {item.badgeText}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Bottom nav */}
          <div className="pt-4 border-t border-border space-y-1 mt-4">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-primary/10">
              <Zap className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm font-medium text-foreground">Plan Free</div>
                <div className="text-[10px] text-muted-foreground">Actualiza a Pro</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted rounded-xl">
              <Settings className="w-4 h-4" />
              <span className="text-sm">Configuración</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted rounded-xl">
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm">Ayuda</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted rounded-xl">
              <Moon className="w-4 h-4" />
              <span className="text-sm">Cambiar tema</span>
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Buenas tardes,</div>
              <div className="text-lg font-bold text-foreground">Admin</div>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                A
              </div>
            </div>
          </div>

          {/* Chat header */}
          <div className="px-4 py-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground">CEO Chat</div>
                <div className="text-xs text-muted-foreground">Café la tratoria</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">Balanceada</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Historial</span>
              </button>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">Aprendido</span>
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">5</span>
              </button>
              <button className="text-muted-foreground hover:text-foreground">+ Nueva</button>
            </div>
          </div>

          {/* Chat content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* User message */}
            <div className="flex justify-end mb-4">
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-md max-w-xs">
                <p className="text-sm">decime como vender mas rapido</p>
                <span className="text-[10px] opacity-70 block text-right mt-1">22:40 ✓</span>
              </div>
            </div>

            {/* AI response */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-md p-4 max-w-lg">
                <p className="text-sm text-foreground mb-3">
                  Para vender más rápido, enfocate en tu punto fuerte: la <strong>ubicación céntrica y los estudiantes</strong>. 
                  Hay un cuello de botella en la coordinación cocina-salón, que afecta la velocidad de servicio.
                </p>
                <p className="text-sm text-foreground mb-3">
                  <strong>Decisión principal:</strong> Mejorá la velocidad de despacho para el "Combo Estudiantil" 
                  en horario pico (12-14h). Esto ataca directamente tu necesidad de ventas y satisface a tu público clave.
                </p>
                <p className="text-sm text-foreground font-semibold mb-2">Prioridades (48-72h):</p>
                <ul className="text-sm text-foreground space-y-1 mb-3">
                  <li>• <strong>Cronometrá el Combo Estudiantil:</strong> Registrá el tiempo exacto desde que se pide...</li>
                  <li>• <strong>Identificá cuellos de botella:</strong> Observá qué etapa de la preparación o despacho...</li>
                  <li>• <strong>Creá un checklist rápido:</strong> Diseñá una secuencia de pasos optimizada para el...</li>
                </ul>
                <p className="text-sm text-foreground">
                  <strong>Siguiente paso (hoy):</strong> Cronometrá 5 pedidos del "Combo Estudiantil" en diferentes...
                </p>
              </div>
            </motion.div>

            {/* Suggested questions */}
            <div className="flex justify-center mt-4">
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <Sparkles className="w-4 h-4" />
                Preguntas sugeridas
              </button>
            </div>
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-card">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Mic className="w-4 h-4 text-primary" />
              </div>
              <input 
                type="text" 
                placeholder="Preguntame lo que necesites..." 
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                readOnly
              />
              <Mic className="w-5 h-5 text-muted-foreground" />
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Send className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              🎙 Voz activada • Adjunta fotos o documentos • Enter para enviar
            </p>
          </div>

          {/* Personality selector overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute right-4 top-32 w-56 bg-card border border-border rounded-xl shadow-xl p-3 hidden xl:block"
          >
            <div className="text-xs text-muted-foreground mb-2">Estilo de comunicación</div>
            <div className="space-y-1">
              {personalityOptions.map((opt, i) => (
                <div 
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    opt.default ? 'bg-muted' : 'hover:bg-muted'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                    {i === 0 && <Brain className="w-3 h-3" />}
                    {i === 1 && <Zap className="w-3 h-3" />}
                    {i === 2 && <BarChart3 className="w-3 h-3" />}
                    {i === 3 && <Building className="w-3 h-3" />}
                    {i === 4 && <Heart className="w-3 h-3" />}
                    {i === 5 && <Target className="w-3 h-3" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground flex items-center gap-2">
                      {opt.name}
                      {opt.default && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted-foreground/20 text-muted-foreground">
                          Predeterminada
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
