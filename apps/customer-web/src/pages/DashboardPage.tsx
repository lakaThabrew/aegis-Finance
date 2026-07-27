import { useState } from 'react';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, Copy, CheckCircle2, RefreshCw } from 'lucide-react';
import type { Account, Transaction } from '../types';

// --- Mock data (replace with API calls when backend is ready) ---
const MOCK_ACCOUNTS: Account[] = [
  { id: 'acc-1', accountNumber: 'AGS-0001-2024', currency: 'USD', balance: 24856.75, status: 'ACTIVE' },
  { id: 'acc-2', accountNumber: 'AGS-0002-2024', currency: 'USD', balance: 5200.00, status: 'ACTIVE' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', reference: 'TXN-8F3A1B', senderAccountNumber: 'AGS-0001-2024', receiverAccountNumber: 'AGS-0099-2024', amount: 1500, currency: 'USD', status: 'COMPLETED', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 't2', reference: 'TXN-2C9E7D', senderAccountNumber: 'AGS-0099-2024', receiverAccountNumber: 'AGS-0001-2024', amount: 3000, currency: 'USD', status: 'COMPLETED', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 't3', reference: 'TXN-5A4F2E', senderAccountNumber: 'AGS-0001-2024', receiverAccountNumber: 'AGS-0077-2024', amount: 25000, currency: 'USD', status: 'HELD', riskScore: 85, createdAt: new Date(Date.now() - 3600000).toISOString() },
];

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function timeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return 'Just now';
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StatusBadge({ status }: { status: Transaction['status'] }) {
  const cfg: Record<string, string> = {
    COMPLETED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    HELD: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    REJECTED: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cfg[status]}`}>{status}</span>
  );
}

export default function DashboardPage() {
  const [accounts] = useState<Account[]>(MOCK_ACCOUNTS);
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account>(MOCK_ACCOUNTS[0]);

  const copyAccount = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(num);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Welcome back! Here's your financial overview.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm text-gray-300 hover:text-white transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Total Balance Card */}
      <div className="relative rounded-2xl overflow-hidden p-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZyIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48cGF0aCBkPSJNMCA0MCBMNDAgMCBNLTEwIDEwIEwxMCAtMTAgTTMwIDUwIEw1MCAzMCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')] opacity-40" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-200 mb-2">
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-medium">Total Portfolio Balance</span>
          </div>
          <p className="text-5xl font-bold text-white tracking-tight">{formatCurrency(totalBalance)}</p>
          <div className="flex items-center gap-1.5 mt-3 text-emerald-300 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+2.4% from last month</span>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Your Accounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map(acc => (
            <div
              key={acc.id}
              id={`account-${acc.id}`}
              onClick={() => setSelectedAccount(acc)}
              className={`glass rounded-2xl p-6 cursor-pointer card-hover transition-all ${selectedAccount.id === acc.id ? 'border-blue-500/50 ring-1 ring-blue-500/30' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-blue-400" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${acc.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                  {acc.status}
                </span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{formatCurrency(acc.balance, acc.currency)}</p>
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm font-mono">{acc.accountNumber}</p>
                <button
                  id={`copy-account-${acc.id}`}
                  onClick={e => { e.stopPropagation(); copyAccount(acc.accountNumber); }}
                  className="text-gray-500 hover:text-white transition"
                >
                  {copied === acc.accountNumber ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <a href="/transactions" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition">
            View all <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="glass rounded-2xl overflow-hidden">
          {transactions.slice(0, 4).map((tx, i) => {
            const isSent = tx.senderAccountNumber === selectedAccount.accountNumber;
            return (
              <div
                key={tx.id}
                id={`txn-${tx.id}`}
                className={`flex items-center gap-4 p-4 hover:bg-white/3 transition ${i < transactions.length - 1 ? 'border-b border-gray-800/60' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSent ? 'bg-red-500/15' : 'bg-emerald-500/15'}`}>
                  {isSent ? <ArrowUpRight className="w-5 h-5 text-red-400" /> : <ArrowDownLeft className="w-5 h-5 text-emerald-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{tx.reference}</p>
                  <p className="text-gray-400 text-xs truncate">
                    {isSent ? `To: ${tx.receiverAccountNumber}` : `From: ${tx.senderAccountNumber}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-semibold text-sm ${isSent ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isSent ? '-' : '+'}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-gray-500 text-xs">{timeAgo(tx.createdAt)}</p>
                </div>
                <StatusBadge status={tx.status} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
