import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Shirt, Sparkles, Heart, Palette, Settings, Leaf } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/overview', label: 'Today', icon: LayoutDashboard },
  { to: '/wardrobe', label: 'My wardrobe', icon: Shirt },
  { to: '/discover', label: 'Discover', icon: Sparkles },
  { to: '/saved', label: 'Saved looks', icon: Heart },
  { to: '/preferences', label: 'My style', icon: Palette },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps { className?: string; onNavClick?: () => void; }

export function Sidebar({ className = '', onNavClick }: SidebarProps) {
  const location = useLocation();
  return (
    <aside className={`sw-sidebar fixed top-0 left-0 h-screen w-[var(--sidebar-width)] flex flex-col z-40 ${className}`}>
      <div className="px-7 pt-8 pb-7">
        <NavLink to="/overview" className="sw-brand" aria-label="SmartWardrobe home">
          <span className="sw-brand-mark"><Leaf size={16} strokeWidth={1.7}/></span>
          <span>smartwardrobe<span className="sw-brand-period">.</span></span>
        </NavLink>
        <p className="sw-side-caption">Your clothes. New possibilities.</p>
      </div>
      <div className="sw-side-rule mx-6"/>
      <p className="sw-side-label px-7 pt-7 pb-3">YOUR SPACE</p>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || (to === '/overview' && location.pathname === '/');
          return <NavLink key={to} to={to} onClick={onNavClick} aria-current={active ? 'page' : undefined}
            className={`sw-nav-link ${active ? 'is-active' : ''}`}>
            <Icon size={17} strokeWidth={1.65}/><span>{label}</span>{active && <span className="sw-nav-dot"/>}
          </NavLink>;
        })}
      </nav>
      <div className="px-6 pb-6">
        <div className="sw-side-note">
          <span className="sw-note-spark">✳</span>
          <p>More ways to wear<br/><em>what you already own.</em></p>
        </div>
        <div className="sw-profile-row mt-5">
          <div className="sw-profile-avatar">S</div>
          <div className="min-w-0"><p className="text-sm font-medium truncate">Your wardrobe</p><p className="text-xs sw-muted">Personal space</p></div>
        </div>
      </div>
    </aside>
  );
}
