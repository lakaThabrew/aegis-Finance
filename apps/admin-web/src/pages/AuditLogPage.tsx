import { useState, useEffect } from 'react';
import { Search, CheckCircle2, AlertTriangle, ShieldAlert, Clock, Loader2 } from 'lucide-react';
import type { AuditEntry } from '../types';
import api from '../api/client';

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

function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('ALL');
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await api.get('/api/v1/core/admin/audit');
        const mapped = res.data.map((a: any) => ({
          id: a.id,
          event: a.message || a.eventType,
          actor: a.actor || 'System',
          severity: a.severity || 'info',
          timestamp: formatDate(a.createdAt)
        }));
        setLogs(mapped);
      } catch (e) {
        console.error('Failed to load audit logs', e);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filtered = logs.filter(entry => {
    const matchSearch = entry.event.toLowerCase().includes(search.toLowerCase()) ||
                        entry.actor.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || entry.severity === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="page-enter space-y-6">
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
