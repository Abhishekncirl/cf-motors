import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, Inbox, Settings, LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../../components/brand/Logo';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/vehicles', label: 'Vehicles', icon: Car, end: false },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox, end: false },
  { to: '/admin/settings', label: 'Settings', icon: Settings, end: false },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const onLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-brand-black lg:grid lg:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 transform border-r border-white/10 bg-brand-grey transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Logo />
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X aria-hidden />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold ${
                  isActive ? 'bg-brand-cyan text-brand-black' : 'text-brand-white/80 hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} aria-hidden /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 space-y-2 border-t border-white/10 p-3">
          <Link to="/" target="_blank" className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-brand-white/60 hover:text-brand-cyan">
            <ExternalLink size={14} aria-hidden /> View live site
          </Link>
          <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-brand-white/80 hover:bg-white/5">
            <LogOut size={16} aria-hidden /> Sign out
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}

      {/* Main */}
      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between border-b border-white/10 px-4 lg:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu aria-hidden />
          </button>
          <div className="ml-auto text-sm text-brand-white/60">{user?.email}</div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
