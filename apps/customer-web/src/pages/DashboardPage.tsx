import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, Copy, CheckCircle2, RefreshCw, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import type { Account, Transaction } from '../types';
import api from '../api/client';
import securityHero from '../assets/aegis-security-hero.png';

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function timeAgo(isoDate: string) {
  if (!isoDate) return '';
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
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cfg[status] || 'bg-gray-500/15 text-gray-400 border-gray-500/30'}`}>{status}</span>
  );
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accRes, txRes] = await Promise.all([
        api.get('/api/v1/core/accounts'),
        api.get('/api/v1/core/transactions')
      ]);
      setAccounts(accRes.data);
      // Sort transactions by date descending
      const sortedTxs = txRes.data.sort((a: Transaction, b: Transaction) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTransactions(sortedTxs);
      if (accRes.data.length > 0 && !selectedAccount) {
        setSelectedAccount(accRes.data[0]);
      } else if (accRes.data.length > 0 && selectedAccount) {
        // update selected account reference
        const updated = accRes.data.find((a: Account) => a.id === selectedAccount.id);
        if (updated) setSelectedAccount(updated);
      }
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyAccount = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(num);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading && accounts.length === 0) {
    return <div className="flex items-center justify-center h-64 text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const totalBalance = accounts.reduce((s, a) => s + (typeof a.balance === 'number' ? a.balance : parseFloat(a.balance as string)), 0);

  return (
    <div className="page-enter space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-[11px] font-bold tracking-[.18em] text-blue-300">PERSONAL OVERVIEW</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Good morning, Alex.</h1>
          <p className="mt-1 text-sm text-slate-400">Everything is secure. Here is your financial pulse.</p>
        </div>
        <button onClick={loadData} className="glass flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-slate-300 transition hover:text-white disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Total Balance Card */}
      <div className="relative overflow-hidden rounded-[1.5rem] border border-blue-300/25 bg-gradient-to-br from-[#2862d6] via-[#4254c9] to-[#6a43ba] p-7 shadow-[0_24px_48px_rgba(32,59,163,.3)] sm:p-9">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZyIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48cGF0aCBkPSJNMCA0MCBMNDAgMCBNLTEwIDEwIEwxMCAtMTAgTTMwIDUwIEw1MCAzMCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')] opacity-40" />
        <div className="absolute right-[-2rem] top-[-3rem] h-52 w-52 rounded-full border border-white/15 bg-white/10" />
        <div className="absolute bottom-[-8rem] right-[15%] h-52 w-52 rounded-full border border-white/10" />
        <img src={securityHero} alt="Aegis security shield" className="visual-float pointer-events-none absolute -right-8 -top-12 hidden h-[19rem] w-[28rem] object-cover opacity-35 mix-blend-screen md:block" />
        <div className="relative z-10">
          <div className="mb-7 flex items-center justify-between"><div className="flex items-center gap-2 text-blue-100">
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-medium">Total Portfolio Balance</span>
          </div><span className="flex items-center gap-1.5 rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100"><ShieldCheck className="h-3.5 w-3.5" />Protected</span></div>
          <p className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{formatCurrency(totalBalance)}</p>
          <div className="mt-3 flex items-center gap-1.5 text-sm text-emerald-200">
            <TrendingUp className="w-4 h-4" />
            <span>+2.4% from last month</span>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div>
        <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold text-white">Your accounts</h2><p className="text-xs text-slate-500">Select an account to view its activity</p></div><Sparkles className="h-4 w-4 text-violet-300" /></div>
        <div className="stagger-in grid grid-cols-1 gap-4 md:grid-cols-2">
          {accounts.map(acc => (
            <div
              key={acc.id}
              id={`account-${acc.id}`}
              onClick={() => setSelectedAccount(acc)}
              className={`glass rounded-2xl p-6 cursor-pointer card-hover transition-all ${selectedAccount?.id === acc.id ? 'border-blue-500/50 ring-1 ring-blue-500/30' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-blue-400" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${acc.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                  {acc.status}
                </span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{formatCurrency(typeof acc.balance === 'number' ? acc.balance : parseFloat(acc.balance as string), acc.currency)}</p>
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
          {accounts.length === 0 && <div className="text-gray-500">No accounts found.</div>}
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
          {transactions.filter(tx => !selectedAccount || tx.senderAccount?.accountNumber === selectedAccount.accountNumber || tx.receiverAccount?.accountNumber === selectedAccount.accountNumber).slice(0, 10).map((tx) => {
            // Note: The API returns the nested account objects instead of just strings.
            const senderNum = (tx as any).senderAccount?.accountNumber || tx.senderAccountNumber;
            const receiverNum = (tx as any).receiverAccount?.accountNumber || tx.receiverAccountNumber;
            
            const isSent = selectedAccount ? senderNum === selectedAccount.accountNumber : true;
            
            return (
              <div
                key={tx.id}
                id={`txn-${tx.id}`}
                className={`flex items-center gap-4 p-4 hover:bg-white/3 transition border-b border-gray-800/60 last:border-0`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSent ? 'bg-red-500/15' : 'bg-emerald-500/15'}`}>
                  {isSent ? <ArrowUpRight className="w-5 h-5 text-red-400" /> : <ArrowDownLeft className="w-5 h-5 text-emerald-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{tx.reference}</p>
                  <p className="text-gray-400 text-xs truncate">
                    {isSent ? `To: ${receiverNum}` : `From: ${senderNum}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-semibold text-sm ${isSent ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isSent ? '-' : '+'}{formatCurrency(typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount as string))}
                  </p>
                  <p className="text-gray-500 text-xs">{timeAgo(tx.createdAt)}</p>
                </div>
                <StatusBadge status={tx.status} />
              </div>
            );
          })}
          {transactions.length === 0 && <div className="p-8 text-center text-gray-500">No recent transactions.</div>}
        </div>
      </div>
    </div>
  );
}
