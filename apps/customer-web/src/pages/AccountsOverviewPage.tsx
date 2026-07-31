import { useState, useEffect } from 'react';
import { Wallet, Search, Download, Loader2 } from 'lucide-react';
import type { Account, Transaction } from '../types';
import api from '../api/client';

function formatCurrency(amount: number | string, currency = 'USD') {
  const val = typeof amount === 'number' ? amount : parseFloat(amount);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AccountsOverviewPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloadingAccount, setDownloadingAccount] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await api.get('/api/v1/core/accounts');
        setAccounts(res.data);
      } catch (e) {
        console.error('Failed to load accounts', e);
      } finally {
        setLoading(false);
      }
    }
    loadAccounts();
  }, []);

  const filtered = accounts.filter(acc => 
    acc.accountNumber.toLowerCase().includes(search.toLowerCase()) || 
    acc.currency.toLowerCase().includes(search.toLowerCase()) ||
    acc.status.toLowerCase().includes(search.toLowerCase())
  );

  const downloadStatement = async (accountNumber: string) => {
    setDownloadingAccount(accountNumber);
    try {
      const response = await api.get<Transaction[]>('/api/v1/core/transactions');
      const rows = response.data
        .filter((transaction) => transaction.senderAccount?.accountNumber === accountNumber || transaction.receiverAccount?.accountNumber === accountNumber)
        .map((transaction) => {
          const direction = transaction.senderAccount?.accountNumber === accountNumber ? 'DEBIT' : 'CREDIT';
          const counterparty = direction === 'DEBIT' ? transaction.receiverAccount?.accountNumber : transaction.senderAccount?.accountNumber;
          return [transaction.createdAt, transaction.reference, direction, counterparty ?? '', transaction.amount, transaction.currency, transaction.status];
        });
      const csv = [['Date', 'Reference', 'Direction', 'Counterparty', 'Amount', 'Currency', 'Status'], ...rows]
        .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
        .join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${accountNumber}-statement.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download statement', error);
      alert('Unable to download the statement. Please try again.');
    } finally {
      setDownloadingAccount(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Accounts Overview</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage all your linked bank accounts and balances.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search accounts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition text-sm"
        />
      </div>

      <div className="space-y-4">
        {filtered.map(acc => (
          <div key={acc.id} className="glass rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 card-hover">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Savings Account</h3>
                <p className="text-gray-400 font-mono text-sm">{acc.accountNumber}</p>
                <p className="text-gray-500 text-xs mt-1">Opened on {formatDate(acc.createdAt)}</p>
              </div>
            </div>

            <div className="flex flex-col md:items-end gap-2">
              <p className="text-2xl font-bold text-white">
                {formatCurrency(acc.balance, acc.currency)}
              </p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${acc.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                  {acc.status}
                </span>
                <button
                  onClick={() => void downloadStatement(acc.accountNumber)}
                  disabled={downloadingAccount === acc.accountNumber}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 text-gray-300 text-xs hover:bg-white/10 hover:text-white transition border border-white/10 disabled:opacity-50"
                >
                  {downloadingAccount === acc.accountNumber ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} Statement
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            No accounts found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
