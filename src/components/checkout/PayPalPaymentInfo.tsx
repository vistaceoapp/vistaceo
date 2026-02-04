import { motion } from "framer-motion";
import { 
  CreditCard, Shield, Globe, Clock, CheckCircle2, 
  Wallet, ArrowRight, ShieldCheck, Lock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PayPalPaymentInfoProps {
  usdAmount: number;
  planId: "pro_monthly" | "pro_yearly";
}

export const PayPalPaymentInfo = ({ usdAmount, planId }: PayPalPaymentInfoProps) => {
  return (
    <div className="space-y-4">
      {/* How payment works */}
      <Card className="border-border/50 bg-secondary/20">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-success" />
            ¿Cómo funciona el pago?
          </h4>
          <div className="space-y-3">
            <PaymentStep 
              number={1}
              icon={<ArrowRight className="w-4 h-4" />}
              title="Click en pagar"
              description="Te llevamos a PayPal para procesar el pago de forma segura"
            />
            <PaymentStep 
              number={2}
              icon={<Wallet className="w-4 h-4" />}
              title="Elegí cómo pagar"
              description="Podés usar tu cuenta PayPal o pagar con tarjeta sin registrarte"
            />
            <PaymentStep 
              number={3}
              icon={<CheckCircle2 className="w-4 h-4" />}
              title="¡Listo!"
              description="Tu suscripción Pro se activa automáticamente"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment options */}
      <div className="grid grid-cols-2 gap-3">
        <PaymentOption 
          icon={<CreditCard className="w-5 h-5 text-primary" />}
          title="Tarjeta"
          description="Débito o crédito"
          badges={["Visa", "Mastercard", "Amex"]}
        />
        <PaymentOption 
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.048l-1.12 7.59c-.047.32-.326.416-.546.416h-.306z" fill="#253B80"/>
              <path d="M19.093 6.534c-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H8.096c-.524 0-.972.382-1.054.901L5.676 23.08c-.04.264.164.502.43.502h3.294c.458 0 .85-.334.922-.788l.038-.198.732-4.64.047-.256a.926.926 0 0 1 .913-.788h.576c3.735 0 6.658-1.518 7.513-5.91.357-1.833.173-3.362-.717-4.437-.27-.328-.6-.61-.981-.845l-.35-.186z" fill="#179BD7"/>
            </svg>
          }
          title="PayPal"
          description="Con tu cuenta"
          badges={["Rápido", "Seguro"]}
        />
      </div>

      {/* Trust indicators */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-success" />
          <span>Encriptación SSL</span>
        </div>
        <div className="flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span>+400M usuarios confían en PayPal</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-accent" />
          <span>Protección al comprador</span>
        </div>
      </div>

      {/* Amount summary */}
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              VistaCEO Pro {planId === "pro_yearly" ? "Anual" : "Mensual"}
            </p>
            <p className="font-semibold text-foreground">Total a pagar</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">USD ${usdAmount}</p>
            {planId === "pro_yearly" && (
              <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                2 meses gratis
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentStep = ({ 
  number, 
  icon, 
  title, 
  description 
}: { 
  number: number; 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: number * 0.1 }}
    className="flex items-start gap-3"
  >
    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-primary">
      {number}
    </div>
    <div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </motion.div>
);

const PaymentOption = ({ 
  icon, 
  title, 
  description, 
  badges 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  badges: string[];
}) => (
  <div className="p-3 rounded-xl border border-border/50 bg-card/50">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="flex flex-wrap gap-1">
      {badges.map((badge, idx) => (
        <Badge key={idx} variant="secondary" className="text-[10px] py-0 px-1.5 bg-secondary/50">
          {badge}
        </Badge>
      ))}
    </div>
  </div>
);
