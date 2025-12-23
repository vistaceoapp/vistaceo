import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OwlLogo } from "@/components/ui/OwlLogo";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="transition-transform duration-300 group-hover:scale-110">
              <OwlLogo size={56} />
            </div>
          </Link>
        </div>

        {/* 404 Display */}
        <div className="relative mb-8">
          <h1 className="text-[120px] sm:text-[160px] font-bold text-foreground/10 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          Página no encontrada
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          Lo sentimos, la página que buscas no existe o fue movida a otra ubicación.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/">
              <Home className="w-5 h-5 mr-2" />
              Ir al inicio
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link to="/app">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al dashboard
            </Link>
          </Button>
        </div>

        {/* Path info */}
        <div className="mt-12 p-4 rounded-xl bg-card/50 border border-border/50">
          <p className="text-sm text-muted-foreground">
            Ruta solicitada: <code className="text-primary font-mono">{location.pathname}</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
