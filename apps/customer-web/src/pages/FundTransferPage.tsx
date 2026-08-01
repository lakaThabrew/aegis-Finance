import { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { Account } from '../types';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

function formatCurrency(amount: number | string, currency = 'USD') {
  const val = typeof amount === 'number' ? amount : parseFloat(amount);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val);
}

export default function FundTransferPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [senderAccount, setSenderAccount] = useState('');
  const [receiverAccount, setReceiverAccount] = useState('');
  const [amount, setAmount] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await api.get('/api/v1/core/accounts');
        setAccounts(res.data);
        if (res.data.length > 0) {
          setSenderAccount(res.data[0].accountNumber);
        }
      } catch (e) {
        console.error('Failed to load accounts', e);
        setError('Failed to load accounts.');
      } finally {
        setLoading(false);
      }
    }
    loadAccounts();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!senderAccount || !receiverAccount || !amount || parseFloat(amount) <= 0) {
      setError('Please provide valid transfer details.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/v1/core/transfer', {
        senderAccountNumber: senderAccount,
        receiverAccountNumber: receiverAccount,
        amount: parseFloat(amount),
        currency: 'USD'
      });
      setSuccess(true);
      setAmount('');
      setReceiverAccount('');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('Transfer failed: One or both accounts involved are currently frozen or inactive.');
      } else {
        setError(err.response?.data?.message || 'Transfer failed. Please check balance and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="page-enter max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Transfer Funds</h1>
        <p className="text-gray-400 text-sm mt-0.5">Securely send money to internal or external beneficiaries.</p>
      </div>

      <div className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute right-[-4rem] top-[-4rem] h-40 w-40 rounded-full border border-blue-500/10 bg-blue-500/5 blur-xl pointer-events-none" />

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-emerald-300 font-medium">Transfer Successful</p>
              <p className="text-emerald-400/80 mt-1">Your funds have been transferred securely.</p>
              <button onClick={() => navigate('/transactions')} className="text-emerald-400 font-medium mt-2 underline text-xs">View Transactions</button>
            </div>
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">From Account</label>
            <select
              value={senderAccount}
              onChange={(e) => setSenderAccount(e.target.value)}
              className="w-full bg-black/20 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition appearance-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.accountNumber} className="bg-gray-900">
                  {acc.accountNumber} - {formatCurrency(acc.balance, acc.currency)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">To Beneficiary / Account Number</label>
            <input
              type="text"
              placeholder="e.g. AGS-0099-2024"
              value={receiverAccount}
              onChange={(e) => setReceiverAccount(e.target.value)}
              className="w-full bg-black/20 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/20 border border-gray-700 rounded-xl pl-8 pr-4 py-3 text-white font-mono focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary py-3.5 rounded-xl font-medium text-white flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? 'Processing...' : 'Confirm Transfer'}
          </button>
        </form>
      </div>
    </div>
  );
}
