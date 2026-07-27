import { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, X, Eye } from 'lucide-react';
import type { HeldTransfer } from '../types';

const MOCK_HELD: HeldTransfer[] = [
  {
    id: 'h1', reference: 'TXN-5A4F2E', senderAccountNumber: 'AGS-0001-2024', receiverAccountNumber: 'AGS-0077-2024',
    amount: 25000, currency: 'USD', riskScore: 85, fraudReasons: 'Large transaction amount',
    status: 'HELD', createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'h2', reference: 'TXN-7C2D9A', senderAccountNumber: 'AGS-0012-2024', receiverAccountNumber: 'AGS-0088-2024',
    amount: 15000, currency: 'USD', riskScore: 75, fraudReasons: 'Large transaction amount',
    status: 'HELD', createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'h3', reference: 'TXN-4E8B1C', senderAccountNumber: 'AGS-0005-2024', receiverAccountNumber: 'AGS-0033-2024',
    amount: 50000, currency: 'USD', riskScore: 95, fraudReasons: 'Large transaction amount, Exceptionally large transaction amount',
    status: 'HELD', createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function RiskBadge({ score }: { score: number }) {
  const cfg = score >= 90
    ? 'bg-red-500/20 text-red-400 border-red-500/40'
    : score >= 70
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  return <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg}`}>{score}</span>;
}

export default function HeldTransfersPage() {
  const [transfers, setTransfers] = useState<HeldTransfer[]>(MOCK_HELD);
  const [selected, setSelected] = useState<HeldTransfer | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    setActionLoading(id);
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: action } : t));
    setActionLoading(null);
    setSelected(null);
  };

  const pending = transfers.filter(t => t.status === 'HELD');
  const resolved = transfers.filter(t => t.status !== 'HELD');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Held Transfers</h1>
        <p className="text-slate-400 text-sm mt-0.5">Review flagged transactions and approve or reject them.</p>
      </div>

      {/* Pending count */}
      <div className="glass rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className="text-white font-semibold">{pending.length} transfer{pending.length !== 1 ? 's' : ''} awaiting review</p>
          <p className="text-slate-400 text-xs">Ledger balances are unchanged until you approve.</p>
        </div>
      </div>

      {/* Pending Table */}
      {pending.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-4 font-medium">Reference</th>
                <th className="text-left px-6 py-4 font-medium">From → To</th>
                <th className="text-right px-6 py-4 font-medium">Amount</th>
                <th className="text-center px-6 py-4 font-medium">Risk</th>
                <th className="text-left px-6 py-4 font-medium">Date</th>
                <th className="text-right px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((tx, i) => (
                <tr
                  key={tx.id}
                  id={`held-row-${tx.id}`}
                  className={`hover:bg-white/3 transition ${i < pending.length - 1 ? 'border-b border-slate-800/50' : ''}`}
                >
                  <td className="px-6 py-4 font-mono text-white">{tx.reference}</td>
                  <td className="px-6 py-4 text-slate-300 text-xs font-mono">
                    {tx.senderAccountNumber} → {tx.receiverAccountNumber}
                  </td>
                  <td className="px-6 py-4 text-right text-white font-semibold">{formatCurrency(tx.amount)}</td>
                  <td className="px-6 py-4 text-center"><RiskBadge score={tx.riskScore} /></td>
                  <td className="px-6 py-4 text-slate-400">{formatDate(tx.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        id={`view-${tx.id}`}
                        onClick={() => setSelected(tx)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        id={`approve-${tx.id}`}
                        onClick={() => handleAction(tx.id, 'APPROVED')}
                        disabled={actionLoading === tx.id}
                        className="px-3 py-1.5 rounded-lg btn-approve text-white text-xs font-medium disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        id={`reject-${tx.id}`}
                        onClick={() => handleAction(tx.id, 'REJECTED')}
                        disabled={actionLoading === tx.id}
                        className="px-3 py-1.5 rounded-lg btn-reject text-white text-xs font-medium disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resolved Table */}
      {resolved.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Resolved</h2>
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-4 font-medium">Reference</th>
                  <th className="text-right px-6 py-4 font-medium">Amount</th>
                  <th className="text-center px-6 py-4 font-medium">Risk</th>
                  <th className="text-center px-6 py-4 font-medium">Decision</th>
                </tr>
              </thead>
              <tbody>
                {resolved.map(tx => (
                  <tr key={tx.id} className="border-b border-slate-800/50 last:border-0">
                    <td className="px-6 py-4 font-mono text-white">{tx.reference}</td>
                    <td className="px-6 py-4 text-right text-white font-semibold">{formatCurrency(tx.amount)}</td>
                    <td className="px-6 py-4 text-center"><RiskBadge score={tx.riskScore} /></td>
                    <td className="px-6 py-4 text-center">
                      {tx.status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-strong rounded-2xl p-8 w-full max-w-lg relative shadow-2xl">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-6">Transfer Details</h3>
            <div className="space-y-4 text-sm mb-6">
              {[
                ['Reference', selected.reference],
                ['Amount', formatCurrency(selected.amount)],
                ['Risk Score', String(selected.riskScore)],
                ['Fraud Reasons', selected.fraudReasons],
                ['From', selected.senderAccountNumber],
                ['To', selected.receiverAccountNumber],
                ['Date', formatDate(selected.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-white font-medium text-right max-w-[60%]">{v}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
              <p className="text-amber-400 text-xs font-medium">⚠ Ledger balances remain unchanged until this transfer is approved.</p>
            </div>

            <div className="flex gap-3">
              <button
                id="modal-approve-btn"
                onClick={() => handleAction(selected.id, 'APPROVED')}
                disabled={actionLoading === selected.id}
                className="flex-1 py-3 rounded-xl btn-approve text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Transfer
              </button>
              <button
                id="modal-reject-btn"
                onClick={() => handleAction(selected.id, 'REJECTED')}
                disabled={actionLoading === selected.id}
                className="flex-1 py-3 rounded-xl btn-reject text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Reject Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
