import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, DollarSign, ShieldAlert, TrendingUp, ArrowUpRight, Loader2 } from 'lucide-react';
import fraudRadarHero from '../assets/fraud-radar-hero.png';
import api from '../api/client';
import type { DashboardStats, AuditEntry } from '../types';

const SEV_STYLE: Record<string, string> = {
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function timeAgo(isoDate: string) {
  if (!isoDate) return '';
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, auditRes] = await Promise.all([
          api.get('/api/v1/core/admin/stats'),
          api.get('/api/v1/core/admin/audit')
        ]);
        setStats(statsRes.data);
        
        const mappedAlerts: AuditEntry[] = auditRes.data.map((a: any) => ({
          id: a.id,
          event: a.eventType,
          actor: 'System',
          severity: a.eventType.includes('Held') || a.eventType.includes('Rejected') ? 'warning' : 'info',
          timestamp: a.createdAt || new Date().toISOString()
        })).slice(0, 5); // Just show top 5 recent alerts
        
        setAlerts(mappedAlerts);
      } catch (e) {
        console.error('Failed to load overview data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const dynamicStats = [
    { label: 'Total Transactions', value: stats?.totalTransactions?.toString() || '0', change: '+0%', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
    { label: 'Held Transfers', value: stats?.heldTransfers?.toString() || '0', change: 'Live', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
    { label: 'Total Volume', value: formatCurrency(stats?.totalVolume || 0), change: 'Live', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
    { label: 'Flagged Rate', value: `${(stats?.flaggedPercentage || 0).toFixed(1)}%`, change: 'Live', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' },
  ];

  return (
    <div className="page-enter space-y-8">
      {/* Header */}
      <section className="relative min-h-56 overflow-hidden rounded-3xl border border-rose-400/20 bg-[#151124] p-7 sm:p-9">
        <img src={fraudRadarHero} alt="Fraud monitoring radar network" className="visual-float absolute inset-0 h-full w-full object-cover opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#151124] via-[#151124]/90 to-[#151124]/15" />
        <div className="relative max-w-md"><p className="mb-2 text-xs font-bold tracking-[.18em] text-rose-200">FRAUD OPERATIONS CENTER</p><h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Stay ahead of every signal.</h1><p className="mt-3 text-sm leading-6 text-rose-100/70">Review high-risk activity, protect customers, and preserve ledger integrity in real time.</p><span className="soft-pulse mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Live monitoring active</span></div>
      </section>

      {/* Stats Grid */}
      <div className="stagger-in grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dynamicStats.map(({ label, value, change, icon: Icon, color, bg }) => (
          <div key={label} className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs">
                <TrendingUp className="w-3 h-3" />
                {change}
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-slate-400 text-sm mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Risk Distribution + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Score Distribution */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Risk Score Distribution</h2>
          <div className="space-y-4">
            {[
              { range: '0–30 (Low)', pct: 78, color: 'bg-emerald-500' },
              { range: '31–69 (Medium)', pct: 16, color: 'bg-amber-500' },
              { range: '70–100 (High / Held)', pct: 6, color: 'bg-red-500' },
            ].map(({ range, pct, color }) => (
              <div key={range}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-300">{range}</span>
                  <span className="text-white font-medium">{pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800">
                  <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Alerts</h2>
            <a href="/admin/audit" className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition">
              View all <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-3">
            {alerts.length === 0 ? <p className="text-slate-500 text-sm">No recent alerts</p> : alerts.map(alert => (
              <div key={alert.id} id={`alert-${alert.id}`} className="flex items-start gap-3 p-3 rounded-xl bg-white/2 hover:bg-white/5 transition">
                <span className={`mt-0.5 px-2 py-0.5 rounded-md text-xs font-medium border shrink-0 ${SEV_STYLE[alert.severity]}`}>
                  {alert.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 leading-snug">{alert.event}</p>
                  <p className="text-xs text-slate-500 mt-1">{timeAgo(alert.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
