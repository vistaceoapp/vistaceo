import { Link, Outlet, useLocation } from 'react-router-dom';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { 
  LayoutDashboard, Newspaper, Users, BarChart3, Settings, 
  Home, LogOut, Calendar, Database, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Blog Factory', href: '/admin/blog', icon: Newspaper },
  { label: 'Calendario', href: '/admin/calendario', icon: Calendar },
  { label: 'Usuarios', href: '/admin/usuarios', icon: Users },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Config', href: '/admin/config', icon: Settings, disabled: true },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  const sidebarContent = (
    <>
      <div className="p-4 md:p-6 border-b">
        <Link to="/admin" className="flex items-center gap-2" onClick={handleNavClick}>
          <Database className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">VistaCEO Admin</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 md:px-4 py-4 md:py-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
              (item.href !== '/admin' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                to={item.disabled ? '#' : item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={(e) => {
                  if (item.disabled) e.preventDefault();
                  else handleNavClick();
                }}
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
      
      <div className="p-3 md:p-4 space-y-1">
        <Link to="/" onClick={handleNavClick}>
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
    </>
  );

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-background flex">
        {/* Mobile header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b px-4 py-3 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <span className="font-bold">Admin</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - desktop always visible, mobile slide-in */}
        <aside className={cn(
          "bg-card flex flex-col border-r z-50",
          // Desktop
          "hidden md:flex md:w-64 md:relative",
          // Mobile
          sidebarOpen && "!flex fixed inset-y-0 left-0 w-72 pt-14"
        )}>
          {sidebarContent}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto pt-14 md:pt-0">
          <Outlet />
        </main>
      </div>
    </AdminAuthGuard>
  );
}