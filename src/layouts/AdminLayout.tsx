import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { 
  LayoutDashboard, Users, BarChart3, Shield, Home, LogOut, 
  Menu, X, Zap, Activity, ChevronRight, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: 'Command Center', href: '/admin', icon: LayoutDashboard, desc: 'Vista general del sistema' },
  { label: 'Centro de Control', href: '/admin/centro-control', icon: Shield, desc: 'Blog OS & Automatización' },
  { label: 'Usuarios', href: '/admin/usuarios', icon: Users, desc: 'Gestión de cuentas' },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, desc: 'Métricas y rendimiento' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleNavClick = () => setSidebarOpen(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "border-b border-[#1a1a2e] px-4 h-[64px] flex items-center gap-3 flex-shrink-0",
        collapsed && "justify-center px-2"
      )}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2692DC] to-[#746CE6] flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-[13px] font-bold text-white tracking-wide">VISTACEO</p>
            <p className="text-[10px] text-[#666] uppercase tracking-widest">God Mode</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-4">
        <nav className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
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
                    ? "bg-gradient-to-r from-[#2692DC]/20 to-[#746CE6]/10 text-white" 
                    : "text-[#888] hover:text-white hover:bg-white/5"
                )}
                onClick={handleNavClick}
                title={collapsed ? item.label : undefined}
              >
                <div className={cn(
                  "flex items-center justify-center flex-shrink-0",
                  isActive && "text-[#2692DC]"
                )}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[13px]">{item.label}</p>
                      <p className="text-[10px] text-[#555] truncate">{item.desc}</p>
                    </div>
                    {isActive && (
                      <div className="w-1 h-6 rounded-full bg-[#2692DC] absolute right-0" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Status bar */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-[#1a1a2e]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#28c840] animate-pulse" />
            <span className="text-[11px] text-[#666]">Sistema activo</span>
            <span className="text-[10px] text-[#444] ml-auto font-mono">
              {time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-[10px] text-[#555] truncate">{user?.email}</p>
        </div>
      )}

      {/* Bottom actions */}
      <div className={cn(
        "border-t border-[#1a1a2e] flex-shrink-0",
        collapsed ? "p-2 space-y-1" : "p-3 space-y-1"
      )}>
        <Link to="/" onClick={handleNavClick}>
          <Button variant="ghost" size="sm" className={cn(
            "w-full gap-2 text-[#666] hover:text-white hover:bg-white/5 justify-start",
            collapsed && "justify-center px-2"
          )}>
            <Home className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-[13px]">Ir al sitio</span>}
          </Button>
        </Link>
        <Button 
          variant="ghost" size="sm"
          className={cn(
            "w-full gap-2 text-[#555] hover:text-red-400 hover:bg-red-500/10 justify-start",
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
      <div className="min-h-screen bg-[#0a0a0f] flex">
        {/* Mobile header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0d0d14] border-b border-[#1a1a2e] px-4 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2692DC] to-[#746CE6] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-[14px]">Admin</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[#888] hover:text-white">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "bg-[#0d0d14] flex flex-col border-r border-[#1a1a2e] z-50 transition-all duration-300",
          "hidden md:flex md:relative",
          collapsed ? "md:w-[60px]" : "md:w-[240px]",
          sidebarOpen && "!flex fixed inset-y-0 left-0 w-[260px] pt-14"
        )}>
          {sidebarContent}
          {/* Collapse toggle (desktop only) */}
          <button 
            className="hidden md:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] items-center justify-center text-[#666] hover:text-white hover:bg-[#2a2a3e] transition-colors z-10"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight className={cn("w-3 h-3 transition-transform", collapsed ? "" : "rotate-180")} />
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto pt-14 md:pt-0 min-h-screen">
          <Outlet />
        </main>
      </div>
    </AdminAuthGuard>
  );
}
