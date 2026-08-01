import { ShieldAlert, LayoutDashboard, AlertTriangle, ScrollText, LogOut, ChevronRight, Activity, Users, CreditCard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { keycloak } from '../auth/keycloak';

const nav = [
  { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
  { label: 'Customers', icon: Users, href: '/admin/customers' },
  { label: 'Accounts & Cards', icon: CreditCard, href: '/admin/accounts-cards' },
  { label: 'Held Transfers', icon: AlertTriangle, href: '/admin/held-transfers' },
  { label: 'SOC Dashboard', icon: Activity, href: '/admin/soc-dashboard' },
  { label: 'Audit Log', icon: ScrollText, href: '/admin/audit' },
];

export default function AdminSidebar() {
  const location = useLocation();

  const logout = async () => {
    localStorage.removeItem('aegis_token');
    await keycloak.logout({ redirectUri: 'http://localhost:5174/' });
  };

  return (
    <aside className="glass sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-white/8 lg:flex">
      {/* Logo */}
      <div className="border-b border-white/8 p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 shadow-lg shadow-rose-500/30">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white leading-none">Aegis</p>
            <p className="mt-1 text-[10px] font-semibold tracking-[.15em] text-rose-300">ADMIN PORTAL</p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="border-b border-white/8 px-7 py-4">
        <span className="rounded-full border border-rose-400/30 bg-rose-500/15 px-2.5 py-1 text-xs font-medium text-rose-300">
          FRAUD_ANALYST
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 p-5">
        <p className="mb-3 px-3 text-[10px] font-bold tracking-[.18em] text-slate-500">OPERATIONS</p>
        {nav.map(({ label, icon: Icon, href }) => {
          const active = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              id={`admin-nav-${label.toLowerCase().replace(/\s/g, '-')}`}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${active
                  ? 'border border-rose-400/20 bg-gradient-to-r from-rose-500/20 to-orange-500/10 text-rose-200 shadow-[0_8px_20px_rgba(190,47,77,.12)]'
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
      <div className="border-t border-white/8 p-5">
        <div className="mb-3 rounded-xl border border-emerald-400/10 bg-emerald-400/[.06] p-3"><p className="text-[10px] font-bold tracking-[.14em] text-emerald-300">REVIEW DESK</p><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Secure channel active</p></div>
        <button
          id="admin-logout-btn"
          onClick={() => void logout()}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
