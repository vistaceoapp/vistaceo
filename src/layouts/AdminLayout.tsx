import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { 
  LayoutDashboard, Users, BarChart3, Brain, Home, LogOut, 
  Menu, X, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, desc: 'KPIs y resumen' },
  { label: 'Usuarios', href: '/admin/usuarios', icon: Users, desc: 'Gestión completa' },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, desc: 'Métricas web y app' },
  { label: 'Blog Engine', href: '/admin/centro-control', icon: Brain, desc: 'Control autónomo' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth?mode=login', { replace: true });
  };

  const handleNavClick = () => setSidebarOpen(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className={cn(
        "border-b border-border/50 px-4 h-[64px] flex items-center gap-3 flex-shrink-0",
        collapsed && "justify-center px-2"
      )}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground text-xs font-black">V</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-[13px] font-bold text-foreground tracking-wide">VISTACEO</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Admin Panel</p>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className={cn("space-y-0.5", collapsed ? "px-2" : "px-3")}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
              (item.href !== '/admin' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg text-sm transition-all duration-200 group relative",
                  collapsed ? "p-2.5 justify-center" : "px-3 py-2.5",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                onClick={handleNavClick}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px]">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground/60">{item.desc}</p>
                    </div>
                    {isActive && <div className="w-1 h-5 rounded-full bg-primary absolute right-1" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {!collapsed && (
        <div className="px-4 py-3 border-t border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-muted-foreground">Sistema activo</span>
            <span className="text-[10px] text-muted-foreground/60 ml-auto font-mono">
              {time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground/60 truncate">{user?.email}</p>
        </div>
      )}

      <div className={cn(
        "border-t border-border/50 flex-shrink-0",
        collapsed ? "p-2 space-y-1" : "p-3 space-y-1"
      )}>
        <Link to="/" onClick={handleNavClick}>
          <Button variant="ghost" size="sm" className={cn(
            "w-full gap-2 text-muted-foreground hover:text-foreground justify-start",
            collapsed && "justify-center px-2"
          )}>
            <Home className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-[13px]">Ir al sitio</span>}
          </Button>
        </Link>
        <Button 
          variant="ghost" size="sm"
          className={cn(
            "w-full gap-2 text-muted-foreground hover:text-destructive justify-start",
            collapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-[13px]">Cerrar sesión</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-background flex">
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border px-4 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-primary-foreground text-[10px] font-black">V</span>
            </div>
            <span className="font-bold text-foreground text-[14px]">Admin</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={cn(
          "bg-card flex flex-col border-r border-border z-50 transition-all duration-300",
          "hidden md:flex md:relative",
          collapsed ? "md:w-[60px]" : "md:w-[220px]",
          sidebarOpen && "!flex fixed inset-y-0 left-0 w-[240px] pt-14"
        )}>
          {sidebarContent}
          <button 
            className="hidden md:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight className={cn("w-3 h-3 transition-transform", collapsed ? "" : "rotate-180")} />
          </button>
        </aside>

        <main className="flex-1 overflow-auto pt-14 md:pt-0 min-h-screen">
          <Outlet />
        </main>
      </div>
    </AdminAuthGuard>
  );
}
