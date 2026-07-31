import { Bell, ShieldCheck } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AiAssistantWidget from './AiAssistantWidget';

export default function AppLayout() {
  return (
    <div className="app-surface flex min-h-screen bg-[#070b18]">
      <Sidebar />
      <main className="relative min-w-0 flex-1 overflow-auto px-5 pb-24 pt-5 sm:px-8 sm:pt-8 lg:px-10 lg:pb-10">
        <div className="mb-7 flex items-center justify-between lg:hidden">
          <NavLink to="/dashboard" className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-violet-600"><ShieldCheck className="h-5 w-5 text-white" /></span><span><b className="block text-sm leading-none text-white">Aegis</b><small className="text-[10px] font-medium tracking-[.16em] text-blue-300">FINANCE</small></span></NavLink>
          <NavLink to="/notifications" className="glass rounded-xl p-2.5 text-slate-300" aria-label="Open notifications"><Bell className="h-4 w-4" /></NavLink>
        </div>
        <Outlet />
      </main>
      <nav className="glass fixed inset-x-4 bottom-4 z-40 flex items-center justify-around rounded-2xl p-2 shadow-2xl lg:hidden">
        <MobileNav to="/dashboard" label="Home" icon="⌂" />
        <MobileNav to="/transactions" label="Ledger" icon="↔" />
        <MobileNav to="/beneficiaries" label="Send" icon="↑" />
        <MobileNav to="/security" label="Security" icon="◈" />
      </nav>
      <AiAssistantWidget />
    </div>
  );
}

function MobileNav({ to, label, icon }: { to: string; label: string; icon: string }) {
  return <NavLink to={to} className={({ isActive }) => `flex min-w-14 flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition ${isActive ? 'bg-blue-500/15 text-blue-300' : 'text-slate-500'}`}><span className="text-base leading-4">{icon}</span>{label}</NavLink>;
}
