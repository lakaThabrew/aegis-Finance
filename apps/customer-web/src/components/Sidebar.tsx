import { Shield, LayoutDashboard, ArrowLeftRight, Users, ShieldAlert, LogOut, Bell, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Transactions', icon: ArrowLeftRight, href: '/transactions' },
  { label: 'Beneficiaries', icon: Users, href: '/beneficiaries' },
  { label: 'Security Center', icon: ShieldAlert, href: '/security' },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="w-64 glass border-r border-gray-800 flex flex-col min-h-screen shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white leading-none">Aegis</p>
            <p className="text-xs text-gray-400">Finance</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ label, icon: Icon, href }) => {
          const active = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              id={`nav-${label.toLowerCase().replace(/\s/g, '-')}`}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${active
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Notifications + Logout */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <button className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition">
          <Bell className="w-4 h-4" />
          Notifications
        </button>
        <button
          id="logout-btn"
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
