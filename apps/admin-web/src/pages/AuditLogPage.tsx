import { useState } from 'react';
import { Search, CheckCircle2, AlertTriangle, ShieldAlert, Clock } from 'lucide-react';
import type { AuditEntry } from '../types';

const MOCK_AUDIT: AuditEntry[] = [
  { id: 'a1', event: 'Transfer TXN-5A4F2E held — Risk Score 85', actor: 'SYSTEM', severity: 'critical', timestamp: '2026-07-27 10:55 AM' },
  { id: 'a2', event: 'Fraud evaluation performed on TXN-5A4F2E', actor: 'SYSTEM', severity: 'warning', timestamp: '2026-07-27 10:55 AM' },
  { id: 'a3', event: 'Transfer TXN-8F3A1B completed — $1,500', actor: 'SYSTEM', severity: 'info', timestamp: '2026-07-27 09:15 AM' },
  { id: 'a4', event: 'Login from admin@aegis.io via Keycloak', actor: 'admin@aegis.io', severity: 'info', timestamp: '2026-07-27 09:00 AM' },
  { id: 'a5', event: 'Transfer TXN-7C2D9A held — Risk Score 75', actor: 'SYSTEM', severity: 'critical', timestamp: '2026-07-27 08:50 AM' },
  { id: 'a6', event: 'Account AGS-0045-2024 frozen by customer request', actor: 'customer-045', severity: 'warning', timestamp: '2026-07-26 11:30 PM' },
  { id: 'a7', event: 'New beneficiary added: Charlie Lee', actor: 'customer-001', severity: 'info', timestamp: '2026-07-26 10:45 PM' },
  { id: 'a8', event: 'Unrecognized device login blocked for customer-003', actor: 'SYSTEM', severity: 'critical', timestamp: '2026-07-26 09:15 PM' },
];

const SEV_STYLE: Record<string, string> = {
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const SEV_ICON: Record<string, React.ReactNode> = {
  info: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />,
  warning: <AlertTriangle className="w-3.5 h-3.5 shrink-0" />,
  critical: <ShieldAlert className="w-3.5 h-3.5 shrink-0" />,
};

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('ALL');

  const filtered = MOCK_AUDIT.filter(entry => {
    const matchSearch = entry.event.toLowerCase().includes(search.toLowerCase()) ||
                        entry.actor.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || entry.severity === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <p className="text-slate-400 text-sm mt-0.5">Complete chronological record of all system events.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="audit-search"
            type="text"
            placeholder="Search events or actors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'INFO', 'WARNING', 'CRITICAL'].map(f => (
            <button
              key={f}
              id={`audit-filter-${f.toLowerCase()}`}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${filter === f ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'glass text-slate-400 border-slate-700 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Log entries */}
      <div className="glass rounded-2xl overflow-hidden">
        {filtered.map((entry, i) => (
          <div
            key={entry.id}
            id={`audit-entry-${entry.id}`}
            className={`flex items-center gap-4 p-4 hover:bg-white/3 transition ${i < filtered.length - 1 ? 'border-b border-slate-800/60' : ''}`}
          >
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border shrink-0 ${SEV_STYLE[entry.severity]}`}>
              {SEV_ICON[entry.severity]}
              {entry.severity.charAt(0).toUpperCase() + entry.severity.slice(1)}
            </span>
            <p className="flex-1 text-sm text-slate-300">{entry.event}</p>
            <span className="text-xs text-slate-500 font-mono shrink-0">{entry.actor}</span>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs shrink-0">
              <Clock className="w-3.5 h-3.5" />
              {entry.timestamp}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-500">No audit entries match your search.</div>
        )}
      </div>
    </div>
  );
}
