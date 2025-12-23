import { Globe } from "lucide-react";
import { OwlLogo } from "@/components/ui/OwlLogo";

const footerLinks = {
  producto: [
    { label: "Características", href: "#features" },
    { label: "Precios", href: "#pricing" },
    { label: "Integraciones", href: "#" },
    { label: "API", href: "#" },
  ],
  empresa: [
    { label: "Sobre nosotros", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Carreras", href: "#" },
    { label: "Contacto", href: "#" },
  ],
  legal: [
    { label: "Privacidad", href: "#" },
    { label: "Términos", href: "#" },
    { label: "Cookies", href: "#" },
  ],
  soporte: [
    { label: "Centro de ayuda", href: "#" },
    { label: "Estado del sistema", href: "#" },
    { label: "Comunidad", href: "#" },
  ],
};

const countries = [
  { code: "AR", name: "Argentina" },
  { code: "MX", name: "México" },
  { code: "CL", name: "Chile" },
  { code: "BR", name: "Brasil" },
  { code: "CO", name: "Colombia" },
  { code: "US", name: "Estados Unidos" },
];

export const Footer = () => {
  return (
    <footer className="bg-card/50 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 py-16">
        {/* Main footer */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-3 mb-4">
              <OwlLogo size={36} />
              <span className="text-xl font-bold text-foreground tracking-tight">UCEO</span>
            </a>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Tu CEO digital con IA. Una acción por día, 
              resultados que importan.
            </p>
            
            {/* Countries */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="w-4 h-4" />
              <span>Disponible en:</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {countries.map((country) => (
                <span
                  key={country.code}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {country.code}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Producto</h4>
            <ul className="space-y-3">
              {footerLinks.producto.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Soporte</h4>
            <ul className="space-y-3">
              {footerLinks.soporte.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} UCEO. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Twitter
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              LinkedIn
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
