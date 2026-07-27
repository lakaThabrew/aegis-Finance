import { ShieldAlert, LayoutDashboard, AlertTriangle, ScrollText, LogOut, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const nav = [
  { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
  { label: 'Held Transfers', icon: AlertTriangle, href: '/admin/held-transfers' },
  { label: 'Audit Log', icon: ScrollText, href: '/admin/audit' },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 glass border-r border-slate-800 flex flex-col min-h-screen shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white leading-none">Aegis</p>
            <p className="text-xs text-slate-400">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-6 py-3 border-b border-slate-800">
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30">
          FRAUD_ANALYST
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ label, icon: Icon, href }) => {
          const active = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              id={`admin-nav-${label.toLowerCase().replace(/\s/g, '-')}`}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${active
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          id="admin-logout-btn"
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
