import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, FolderOpen, Calendar, Upload, Users, LogOut, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  const navItems = [
    { path: '/dashboard', icon: LayoutGrid, label: 'Galeria', roles: ['admin', 'editor', 'viewer'] },
    { path: '/categories', icon: FolderOpen, label: 'Categorias', roles: ['admin', 'editor', 'viewer'] },
    { path: '/events', icon: Calendar, label: 'Eventos', roles: ['admin', 'editor', 'viewer'] },
    { path: '/upload', icon: Upload, label: 'Upload', roles: ['admin', 'editor'] },
    { path: '/users', icon: Users, label: 'Usuários', roles: ['admin'] },
  ];
  
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-surface/50 backdrop-blur-xl border-r border-border hidden md:flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground">Sublima</h1>
        <p className="text-sm text-muted-foreground mt-1">Galeria de Sublimação</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          if (!item.roles.includes(user?.role)) return null;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Button
                variant={isActive(item.path) ? "default" : "ghost"}
                className={`w-full justify-start gap-3 rounded-sm ${isActive(item.path) ? 'bg-primary text-primary-foreground' : 'hover:bg-slate-50'}`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium uppercase tracking-wider">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3 p-3 bg-surface-highlight rounded-sm">
          {user?.picture ? (
            <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{user?.role}</p>
          </div>
        </div>
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full justify-start gap-3 rounded-sm border-border"
          data-testid="logout-button"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium uppercase tracking-wider">Sair</span>
        </Button>
      </div>
    </div>
  );
}