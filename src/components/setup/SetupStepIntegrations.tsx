// Step: Integrations (Profiled in Free, Connected in Pro)
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Lock, Check, ExternalLink, Sparkles, CreditCard, Star, Instagram, Facebook, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CountryCode, COUNTRY_PACKS } from '@/lib/countryPacks';

interface IntegrationItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: 'payments' | 'reviews' | 'social' | 'other';
}

const getIntegrations = (countryCode: CountryCode): IntegrationItem[] => {
  const pack = COUNTRY_PACKS[countryCode];
  const integrations: IntegrationItem[] = [];

  // Payment platforms by country
  const paymentIcons: Record<string, React.ReactNode> = {
    'Mercado Pago': <CreditCard className="w-5 h-5" />,
    'PayPal': <CreditCard className="w-5 h-5" />,
    'PedidosYa': <CreditCard className="w-5 h-5" />,
    'Rappi': <CreditCard className="w-5 h-5" />,
    'iFood': <CreditCard className="w-5 h-5" />,
    'Uber Eats': <CreditCard className="w-5 h-5" />,
    'DoorDash': <CreditCard className="w-5 h-5" />,
    'DiDi Food': <CreditCard className="w-5 h-5" />,
    'Grubhub': <CreditCard className="w-5 h-5" />,
  };

  pack?.platforms?.delivery?.forEach(name => {
    integrations.push({
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      icon: paymentIcons[name] || <CreditCard className="w-5 h-5" />,
      category: 'payments',
    });
  });

  // Reviews
  integrations.push(
    { id: 'google_reviews', name: 'Google Reviews', icon: <Star className="w-5 h-5" />, category: 'reviews' },
    { id: 'tripadvisor', name: 'TripAdvisor', icon: <Star className="w-5 h-5" />, category: 'reviews' },
  );

  // Social
  integrations.push(
    { id: 'instagram', name: 'Instagram', icon: <Instagram className="w-5 h-5" />, category: 'social' },
    { id: 'facebook', name: 'Facebook', icon: <Facebook className="w-5 h-5" />, category: 'social' },
    { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, category: 'social' },
  );

  return integrations;
};

interface SetupStepIntegrationsProps {
  countryCode: CountryCode;
  profiled: {
    payments: string[];
    reviews: string[];
    social: string[];
    other: string[];
  };
  onUpdate: (profiled: {
    payments: string[];
    reviews: string[];
    social: string[];
    other: string[];
  }) => void;
}

export const SetupStepIntegrations = ({
  countryCode,
  profiled,
  onUpdate,
}: SetupStepIntegrationsProps) => {
  const lang = COUNTRY_PACKS[countryCode]?.locale?.startsWith('pt') ? 'pt' : 'es';
  const integrations = getIntegrations(countryCode);
  const [socialHandles, setSocialHandles] = useState<Record<string, string>>({});

  const toggleIntegration = (integration: IntegrationItem) => {
    const category = integration.category;
    const current = profiled[category] || [];
    const updated = current.includes(integration.id)
      ? current.filter(id => id !== integration.id)
      : [...current, integration.id];
    
    onUpdate({
      ...profiled,
      [category]: updated,
    });
  };

  const isSelected = (integration: IntegrationItem) => {
    return (profiled[integration.category] || []).includes(integration.id);
  };

  const categories = [
    { id: 'payments', label: { es: 'Apps de Delivery/Pagos', pt: 'Apps de Delivery/Pagamentos' } },
    { id: 'reviews', label: { es: 'Reseñas', pt: 'Avaliações' } },
    { id: 'social', label: { es: 'Redes Sociales', pt: 'Redes Sociais' } },
  ] as const;

  const totalSelected = Object.values(profiled).flat().length;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {lang === 'pt' ? 'Suas Ferramentas' : 'Tus Herramientas'}
        </h2>
        <p className="text-muted-foreground">
          {lang === 'pt' 
            ? 'Marque o que você usa. A conexão automática está em PRO.'
            : 'Marcá lo que usás. La conexión automática está en PRO.'
          }
        </p>
      </div>

      {/* PRO Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {lang === 'pt' 
                ? 'Conexão automática disponível em PRO'
                : 'Conexión automática disponible en PRO'
              }
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === 'pt' 
                ? 'Com integrações: +10-25% de precisão e atualização automática'
                : 'Con integraciones: +10-25% precisión y actualización automática'
              }
            </p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Lock className="w-3 h-3" />
            PRO
          </Badge>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryIntegrations = integrations.filter(i => i.category === category.id);
          if (categoryIntegrations.length === 0) return null;

          return (
            <div key={category.id} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {category.label[lang]}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {categoryIntegrations.map((integration) => {
                  const selected = isSelected(integration);
                  return (
                    <motion.button
                      key={integration.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleIntegration(integration)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all relative",
                        selected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 bg-card"
                      )}
                    >
                      {selected && (
                        <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />
                      )}
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          selected ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                        )}>
                          {integration.icon}
                        </div>
                        <span className={cn("font-medium text-sm", selected && "text-primary")}>
                          {integration.name}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Social Handles Input (optional) */}
      {(profiled.social?.includes('instagram') || profiled.social?.includes('facebook')) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3 p-4 rounded-xl bg-secondary/50"
        >
          <p className="text-sm font-medium text-foreground">
            {lang === 'pt' ? 'Opcional: seus @usuarios' : 'Opcional: tus @usuarios'}
          </p>
          {profiled.social?.includes('instagram') && (
            <Input
              placeholder="@instagram"
              value={socialHandles.instagram || ''}
              onChange={(e) => setSocialHandles(prev => ({ ...prev, instagram: e.target.value }))}
              className="h-11"
            />
          )}
          {profiled.social?.includes('facebook') && (
            <Input
              placeholder="facebook.com/..."
              value={socialHandles.facebook || ''}
              onChange={(e) => setSocialHandles(prev => ({ ...prev, facebook: e.target.value }))}
              className="h-11"
            />
          )}
        </motion.div>
      )}

      {/* Summary */}
      {totalSelected > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {totalSelected} {lang === 'pt' ? 'ferramentas selecionadas' : 'herramientas seleccionadas'}
        </div>
      )}
    </div>
  );
};
