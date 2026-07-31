import { useState, useEffect } from 'react';
import { Search, Download, ArrowUpRight, ArrowDownLeft, X, Loader2 } from 'lucide-react';
import type { Transaction, Account } from '../types';
import api from '../api/client';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  HELD: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  REJECTED: 'bg-red-500/15 text-red-400 border-red-500/30',
  APPROVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('ALL');
  const [selected, setSelected] = useState<Transaction | null>(null);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [myAccounts, setMyAccounts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [accRes, txRes] = await Promise.all([
          api.get('/api/v1/core/accounts'),
          api.get('/api/v1/core/transactions')
        ]);
        const accs = new Set<string>(accRes.data.map((a: Account) => a.accountNumber));
        setMyAccounts(accs);
        
        const mapped = txRes.data.map((tx: any) => ({
          ...tx,
          senderAccountNumber: tx.senderAccount?.accountNumber || tx.senderAccountNumber,
          receiverAccountNumber: tx.receiverAccount?.accountNumber || tx.receiverAccountNumber
        }));
        setTransactions(mapped);
      } catch (e) {
        console.error('Failed to load transactions', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = transactions.filter(tx => {
    const matchSearch = tx.reference.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || tx.status === filter;
    return matchSearch && matchFilter;
  });

  const downloadCSV = () => {
    const rows = ['Reference,Amount,Status,Date',
      ...filtered.map(t => `${t.reference},${t.amount},${t.status},${t.createdAt}`)];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'aegis-statement.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-gray-400 text-sm mt-0.5">Full ledger history for your accounts.</p>
        </div>
        <button
          id="download-statement-btn"
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary text-sm font-medium text-white"
        >
          <Download className="w-4 h-4" /> Download Statement
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="txn-search"
            type="text"
            placeholder="Search by reference..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'COMPLETED', 'HELD', 'REJECTED', 'APPROVED'].map(f => (
            <button
              key={f}
              id={`filter-${f.toLowerCase()}`}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${filter === f ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'glass text-gray-400 border-gray-700 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
              <th className="text-left px-6 py-4 font-medium">Reference</th>
              <th className="text-left px-6 py-4 font-medium">Type</th>
              <th className="text-left px-6 py-4 font-medium">Counterparty</th>
              <th className="text-right px-6 py-4 font-medium">Amount</th>
              <th className="text-left px-6 py-4 font-medium">Status</th>
              <th className="text-left px-6 py-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx, i) => {
              const isSent = myAccounts.has(tx.senderAccountNumber ?? '');
              return (
                <tr
                  key={tx.id}
                  id={`txn-row-${tx.id}`}
                  onClick={() => setSelected(tx)}
                  className={`cursor-pointer hover:bg-white/3 transition ${i < filtered.length - 1 ? 'border-b border-gray-800/50' : ''}`}
                >
                  <td className="px-6 py-4 font-mono text-white">{tx.reference}</td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 ${isSent ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isSent ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      {isSent ? 'Sent' : 'Received'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300 font-mono text-xs">
                    {isSent ? tx.receiverAccountNumber : tx.senderAccountNumber}
                  </td>
                  <td className={`px-6 py-4 text-right font-semibold ${isSent ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isSent ? '-' : '+'}{formatCurrency(Number(tx.amount))}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[tx.status] || 'bg-gray-500/15 text-gray-400 border-gray-500/30'}`}>{tx.status}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{formatDate(tx.createdAt)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No transactions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transaction Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-strong modal-enter rounded-2xl p-8 w-full max-w-md relative shadow-2xl">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-6">Transaction Receipt</h3>
            <div className="space-y-4 text-sm">
              {[
                ['Reference', selected.reference],
                ['Amount', formatCurrency(Number(selected.amount))],
                ['Status', selected.status],
                ['Risk Score', selected.riskScore ?? 'N/A'],
                ['From', selected.senderAccountNumber],
                ['To', selected.receiverAccountNumber],
                ['Date', formatDate(selected.createdAt)],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between border-b border-gray-800 pb-3">
                  <span className="text-gray-400">{k}</span>
                  <span className="text-white font-medium">{v as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
