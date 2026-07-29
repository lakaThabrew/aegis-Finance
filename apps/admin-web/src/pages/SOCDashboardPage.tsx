import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle2, Loader2, AlertTriangle, Crosshair, StopCircle } from 'lucide-react';
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
                    <button className="text-blue-400 hover:text-blue-300 transition text-xs font-medium mr-3">Investigate</button>
                    {alert.riskScore >= 70 && <button className="text-red-400 hover:text-red-300 transition text-xs font-medium flex items-center gap-1 ml-auto"><StopCircle className="w-3.5 h-3.5"/> Block</button>}
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
    </div>
  );
}
