import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Loader2, AlertTriangle, Crosshair, StopCircle, X } from 'lucide-react';
import api from '../api/client';

interface FraudResult {
  id: string;
  transactionReference: string;
  senderAccountNumber: string;
  receiverAccountNumber: string;
  amount: number;
  riskScore: number;
  reasons: string;
  createdAt: string;
}

export default function SOCDashboardPage() {
  const [alerts, setAlerts] = useState<FraudResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<FraudResult | null>(null);
  const [blockingId, setBlockingId] = useState<string | null>(null);
  const [blockedAlertIds, setBlockedAlertIds] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await api.get('/api/v1/fraud/alerts');
        setAlerts(res.data);
      } catch (e) {
        console.error('Failed to load SOC alerts', e);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const highRisk = alerts.filter(a => a.riskScore >= 70);
  const medRisk = alerts.filter(a => a.riskScore >= 30 && a.riskScore < 70);

  const blockTransaction = async (alert: FraudResult) => {
    if (!window.confirm(`Reject flagged transaction ${alert.transactionReference}?`)) return;
    setBlockingId(alert.id);
    setActionError(null);
    try {
      await api.post(`/api/v1/core/admin/transactions/reference/${encodeURIComponent(alert.transactionReference)}/reject`);
      setBlockedAlertIds((current) => [...current, alert.id]);
    } catch (error) {
      console.error('Failed to reject flagged transaction', error);
      setActionError(`Unable to reject ${alert.transactionReference}. It may already have been decided.`);
    } finally {
      setBlockingId(null);
    }
  };

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Operations Center</h1>
          <p className="text-gray-400 text-sm mt-0.5">Live Threat Monitoring and Fraud Analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-6 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3 mb-2 text-red-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-semibold">High Risk Alerts</h3>
          </div>
          <p className="text-3xl font-bold text-white">{highRisk.length}</p>
        </div>
        <div className="glass rounded-2xl p-6 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3 mb-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-semibold">Medium Risk</h3>
          </div>
          <p className="text-3xl font-bold text-white">{medRisk.length}</p>
        </div>
        <div className="glass rounded-2xl p-6 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3 mb-2 text-emerald-400">
            <Activity className="w-5 h-5" />
            <h3 className="font-semibold">Total Scanned</h3>
          </div>
          <p className="text-3xl font-bold text-white">{alerts.length}</p>
        </div>
      </div>
      {actionError && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{actionError}</div>}

      <div className="glass rounded-2xl overflow-hidden mt-6">
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/20">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-blue-400" /> Detected Incidents
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 bg-black/10">
              <tr>
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium">Txn Ref</th>
                <th className="px-6 py-4 font-medium">Sender</th>
                <th className="px-6 py-4 font-medium">Risk</th>
                <th className="px-6 py-4 font-medium">Signals</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(alert => (
                <tr key={alert.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-white font-mono">{alert.transactionReference}</td>
                  <td className="px-6 py-4 text-gray-300 font-mono">{alert.senderAccountNumber}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      alert.riskScore >= 70 ? 'bg-red-500/20 text-red-400' : 
                      alert.riskScore >= 30 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {alert.riskScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs max-w-[200px] truncate" title={alert.reasons}>
                    {alert.reasons || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedAlert(alert)} className="text-blue-400 hover:text-blue-300 transition text-xs font-medium mr-3">Investigate</button>
                    {alert.riskScore >= 70 && (blockedAlertIds.includes(alert.id) ? <span className="ml-auto text-xs font-medium text-emerald-400">Rejected</span> : <button onClick={() => void blockTransaction(alert)} disabled={blockingId === alert.id} className="ml-auto flex items-center gap-1 text-xs font-medium text-red-400 transition hover:text-red-300 disabled:opacity-50"><StopCircle className="w-3.5 h-3.5"/>{blockingId === alert.id ? 'Rejecting...' : 'Block'}</button>)}
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No fraud alerts detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass-strong w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-[.16em] text-blue-300">FRAUD INVESTIGATION</p><h2 className="mt-1 text-xl font-bold text-white">{selectedAlert.transactionReference}</h2></div><button onClick={() => setSelectedAlert(null)} className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button></div>
            <dl className="space-y-3 text-sm"><InvestigationDetail label="Sender" value={selectedAlert.senderAccountNumber} /><InvestigationDetail label="Receiver" value={selectedAlert.receiverAccountNumber} /><InvestigationDetail label="Amount" value={`$${selectedAlert.amount.toLocaleString()}`} /><InvestigationDetail label="Risk score" value={`${selectedAlert.riskScore} / 100`} /><InvestigationDetail label="Signals" value={selectedAlert.reasons || 'No signals supplied'} /></dl>
            <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">Use Held Transfers to approve or reject a pending transaction. Blocking an account requires a dedicated account-control decision.</div>
          </div>
        </div>
      )}
    </div>
  );
}

function InvestigationDetail({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-6 border-b border-white/5 pb-3 last:border-0"><dt className="shrink-0 text-slate-400">{label}</dt><dd className="text-right font-medium text-white">{value}</dd></div>;
}
