import { Check, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const PlansAndBillingSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Planes simples, sin sorpresas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empezá gratis, sin compromiso. Actualizá cuando lo necesites.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {/* Free Plan */}
          <div className="bg-card border border-border rounded-2xl p-8 relative">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Gratis</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Ideal para explorar y empezar
              </p>
            </div>

            <div className="mb-6">
              <p className="text-3xl font-bold text-foreground">$0</p>
              <p className="text-sm text-muted-foreground">Para siempre</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Acceso al CEO digital con IA</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Funcionalidades básicas de misiones y radar</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Sin tarjeta de crédito requerida</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Sin compromiso, cancelá cuando quieras</span>
              </li>
            </ul>

            <Button 
              variant="outline" 
              className="w-full"
              asChild
            >
              <Link to="/auth">Comenzar gratis</Link>
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-card border-2 border-primary rounded-2xl p-8 relative overflow-hidden">
            {/* Popular Badge */}
            <div className="absolute top-4 right-4">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Más popular
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Pro</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Para negocios que quieren crecer
              </p>
            </div>

            <div className="mb-6">
              <p className="text-3xl font-bold text-foreground">
                Precio variable
              </p>
              <p className="text-sm text-muted-foreground">
                Consultá el precio actual al momento de contratar
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Todo lo del plan Gratis</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Chat ilimitado con el CEO digital</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Analytics avanzados y predicciones</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Integraciones y funciones premium</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Soporte prioritario</span>
              </li>
            </ul>

            <Button className="w-full" asChild>
              <Link to="/auth">Activar Pro</Link>
            </Button>
          </div>
        </div>

        {/* Billing Disclosures */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-card/50 border border-border rounded-xl p-6">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span>💵</span>
              Información sobre facturación
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-2">
                <p>
                  <strong className="text-foreground">Moneda:</strong> Todos los 
                  importes se muestran en USD (dólares estadounidenses).
                </p>
                <p>
                  <strong className="text-foreground">Tipo de cambio:</strong> La 
                  conversión a moneda local se calcula según el tipo de cambio 
                  del sistema al momento y puede variar.
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <strong className="text-foreground">Cargos adicionales:</strong> VistaCEO 
                  no controla ni se responsabiliza por impuestos, retenciones, 
                  comisiones del procesador de pago, banco o emisor.
                </p>
                <p>
                  <strong className="text-foreground">Renovación:</strong> Los planes 
                  pagos se renuevan automáticamente. Podés cancelar en cualquier momento.
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
              Para más detalles, consultá nuestras{" "}
              <Link to="/condiciones#facturacion" className="text-primary hover:underline">
                Condiciones del Servicio
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
