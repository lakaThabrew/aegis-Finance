import { ShieldAlert } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="admin-surface flex min-h-screen bg-[#090b16]">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-auto px-5 pb-24 pt-6 sm:px-8 lg:px-10 lg:py-9">
        <div className="mb-7 flex items-center gap-2 lg:hidden"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-400"><ShieldAlert className="h-5 w-5 text-white" /></span><span><b className="block text-sm leading-none text-white">Aegis Review Desk</b><small className="text-[10px] font-medium tracking-[.16em] text-rose-300">FRAUD ANALYST</small></span></div>
        <Outlet />
      </main>
      <nav className="glass fixed inset-x-4 bottom-4 z-40 flex items-center justify-around rounded-2xl p-2 shadow-2xl lg:hidden">
        <MobileNav to="/admin" label="Overview" icon="⌂" end />
        <MobileNav to="/admin/held-transfers" label="Review" icon="!" />
        <MobileNav to="/admin/audit" label="Audit" icon="≡" />
      </nav>
    </div>
  );
}

function MobileNav({ to, label, icon, end = false }: { to: string; label: string; icon: string; end?: boolean }) {
  return <NavLink to={to} end={end} className={({ isActive }) => `flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition ${isActive ? 'bg-rose-500/15 text-rose-200' : 'text-slate-500'}`}><span className="text-base leading-4">{icon}</span>{label}</NavLink>;
}
