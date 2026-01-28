import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { forwardRef } from 'react';

interface BlogCTAProps {
  variant?: 'sidebar' | 'footer';
}

export const BlogCTA = forwardRef<HTMLDivElement, BlogCTAProps>(
  function BlogCTA({ variant = 'footer' }, ref) {
  if (variant === 'sidebar') {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">¿Querés ordenar tu negocio?</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Recibí un diagnóstico gratuito de tu empresa y descubrí oportunidades de mejora.
          </p>
          <Button asChild size="sm" className="w-full gap-2">
            <Link to="/auth">
              Empezar gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20 overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold">
                ¿Listo para ordenar tu negocio?
              </h3>
            </div>
            <p className="text-muted-foreground max-w-lg">
              VistaCEO te ayuda a detectar problemas, priorizar y ejecutar con un sistema inteligente. 
              Probalo gratis y empezá a ver resultados en minutos.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/auth">
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/">
                Conocer más
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
