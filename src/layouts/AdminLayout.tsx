import { Link, Outlet, useLocation } from 'react-router-dom';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { 
  LayoutDashboard, Newspaper, Users, BarChart3, Settings, 
  Home, LogOut, Calendar, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Blog Factory', href: '/admin/blog', icon: Newspaper },
  { label: 'Calendario', href: '/admin/calendario', icon: Calendar },
  { label: 'Usuarios', href: '/admin/usuarios', icon: Users, disabled: true },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, disabled: true },
  { label: 'Config', href: '/admin/config', icon: Settings, disabled: true },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card flex flex-col">
          <div className="p-6 border-b">
            <Link to="/admin" className="flex items-center gap-2">
              <Database className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">VistaCEO Admin</span>
            </Link>
          </div>

          <ScrollArea className="flex-1 px-4 py-6">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || 
                  (item.href !== '/admin' && location.pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    to={item.disabled ? '#' : item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      item.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={(e) => item.disabled && e.preventDefault()}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {item.disabled && (
                      <span className="text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded ml-auto">
                        Pronto
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          <Separator />
          
          <div className="p-4 space-y-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                <Home className="w-4 h-4" />
                Ir al sitio
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </AdminAuthGuard>
  );
}
