import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Emails autorizados para acceder al admin
const AUTHORIZED_EMAILS = [
  'info@vistaceo.com',
  'lickevinmerdinian@gmail.com',
];

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setIsAuthorized(false);
      } else {
        const userEmail = user.email?.toLowerCase();
        const authorized = AUTHORIZED_EMAILS.some(
          email => email.toLowerCase() === userEmail
        );
        setIsAuthorized(authorized);
      }
    }
  }, [user, loading]);

  if (loading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Acceso restringido</CardTitle>
            <CardDescription>
              Necesitás iniciar sesión con una cuenta autorizada para acceder al panel de administración.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/auth')} className="w-full">
              Iniciar sesión
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle>Sin autorización</CardTitle>
            <CardDescription>
              Tu cuenta ({user.email}) no tiene permisos para acceder al panel de administración.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Si creés que esto es un error, contactá al equipo de VistaCEO.
            </p>
            <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  if (!user?.email) return false;
  return AUTHORIZED_EMAILS.some(
    email => email.toLowerCase() === user.email?.toLowerCase()
  );
}
