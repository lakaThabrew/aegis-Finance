import { Shield, LayoutDashboard, ArrowLeftRight, Users, ShieldAlert, LogOut, Bell, ChevronRight, Wallet, Send } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Accounts', icon: Wallet, href: '/accounts' },
  { label: 'Transfer', icon: Send, href: '/transfer' },
  { label: 'Transactions', icon: ArrowLeftRight, href: '/transactions' },
  { label: 'Beneficiaries', icon: Users, href: '/beneficiaries' },
  { label: 'Security Center', icon: ShieldAlert, href: '/security' },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="glass sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-white/8 lg:flex">
      {/* Logo */}
      <div className="border-b border-white/8 p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-violet-600 shadow-lg shadow-indigo-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold leading-none text-white">Aegis</p>
            <p className="mt-1 text-[10px] font-semibold tracking-[.18em] text-blue-300">FINANCE</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 p-5">
        <p className="mb-3 px-3 text-[10px] font-bold tracking-[.18em] text-slate-500">BANKING SPACE</p>
        {nav.map(({ label, icon: Icon, href }) => {
          const active = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              id={`nav-${label.toLowerCase().replace(/\s/g, '-')}`}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${active
                  ? 'border border-blue-400/20 bg-gradient-to-r from-blue-500/20 to-violet-500/10 text-blue-200 shadow-[0_8px_20px_rgba(35,84,200,.12)]'
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

      {/* Notifications + Logout */}
      <div className="space-y-2 border-t border-white/8 p-5">
        <div className="mb-3 rounded-xl border border-emerald-400/10 bg-emerald-400/[.06] p-3"><p className="text-[10px] font-bold tracking-[.14em] text-emerald-300">SYSTEM STATUS</p><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />All services secure</p></div>
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
