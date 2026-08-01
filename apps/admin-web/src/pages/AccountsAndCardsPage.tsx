import { useState, useEffect } from 'react';
import { CreditCard, Wallet, ShieldAlert, CheckCircle2, Loader2, Calendar } from 'lucide-react';
import api from '../api/client';

interface Account {
  id: string;
  customerId: string;
  accountNumber: string;
  currency: string;
  balance: number;
  status: string;
  createdAt: string;
}

interface Card {
  id: string;
  customerId: string;
  cardNumber: string;
  expiry: string;
  isFrozen: boolean;
  onlinePayments: boolean;
  internationalPayments: boolean;
  contactless: boolean;
  createdAt: string;
}

export default function AccountsAndCardsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [accRes, cardRes] = await Promise.all([
          api.get('/api/v1/core/admin/accounts'),
          api.get('/api/v1/core/admin/cards')
        ]);
        setAccounts(accRes.data);
        setCards(cardRes.data);
      } catch (err) {
        console.error('Failed to load accounts and cards', err);
        setError('Failed to fetch data from the server.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  const maskCard = (card: string) => {
    return `•••• •••• •••• ${card.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Accounts & Cards Portfolio</h1>
        <p className="mt-1 text-sm text-slate-400">Comprehensive overview of all customer accounts and issued cards.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-200">{error}</p>
        </div>
      )}

      {/* Accounts Section */}
      <div className="glass rounded-2xl overflow-hidden border border-slate-800">
        <div className="border-b border-slate-800 bg-slate-900/50 px-6 py-5 flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/20 p-2 text-blue-400">
            <Wallet className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">Customer Accounts</h2>
          <span className="ml-auto rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
            Total: {accounts.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 text-xs font-medium uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Account Number</th>
                <th className="px-6 py-4">Customer ID</th>
                <th className="px-6 py-4 text-right">Balance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {accounts.map(acc => (
                <tr key={acc.id} className="hover:bg-white/5 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 font-mono font-medium text-white">{acc.accountNumber}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-400">{acc.customerId}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-slate-200">
                    {formatCurrency(acc.balance, acc.currency)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {acc.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400 border border-rose-500/20">
                        <ShieldAlert className="h-3.5 w-3.5" /> {acc.status}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-400 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    {new Date(acc.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No accounts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards Section */}
      <div className="glass rounded-2xl overflow-hidden border border-slate-800">
        <div className="border-b border-slate-800 bg-slate-900/50 px-6 py-5 flex items-center gap-3">
          <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">Issued Cards</h2>
          <span className="ml-auto rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
            Total: {cards.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 text-xs font-medium uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Card Number</th>
                <th className="px-6 py-4">Customer ID</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4">Permissions</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {cards.map(card => (
                <tr key={card.id} className="hover:bg-white/5 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 font-mono font-medium text-white tracking-widest">
                    {maskCard(card.cardNumber)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-400">{card.customerId}</td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-200">{card.expiry}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex gap-2">
                      {card.onlinePayments && <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase font-bold text-slate-300">Online</span>}
                      {card.internationalPayments && <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase font-bold text-slate-300">Intl</span>}
                      {card.contactless && <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase font-bold text-slate-300">NFC</span>}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {card.isFrozen ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400 border border-rose-500/20">
                        <ShieldAlert className="h-3.5 w-3.5" /> Frozen
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {cards.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No cards found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
