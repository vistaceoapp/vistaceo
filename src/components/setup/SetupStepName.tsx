// Step 3: Business Name
import { motion } from 'framer-motion';
import { Store, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SetupStepNameProps {
  value: string;
  onChange: (name: string) => void;
  googleName?: string;
}

export const SetupStepName = ({ value, onChange, googleName }: SetupStepNameProps) => {
  const handleUseGoogleName = () => {
    if (googleName) {
      onChange(googleName);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Store className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">¿Cómo se llama tu negocio?</h2>
        <p className="text-muted-foreground">El nombre que ven tus clientes</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Input
          type="text"
          placeholder="Ej: Café del Centro, La Pizzería de Juan..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 text-lg bg-secondary/50 text-center"
          autoFocus
        />

        {googleName && googleName !== value && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleUseGoogleName}
            className="w-full p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Usar nombre de Google: <span className="text-primary">{googleName}</span>
            </span>
          </motion.button>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Podés cambiarlo después en la configuración
        </p>
      </motion.div>
    </div>
  );
};
