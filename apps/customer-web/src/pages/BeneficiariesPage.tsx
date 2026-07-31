import { useState, useEffect } from 'react';
import { Plus, Trash2, Send, X, CheckCircle2, Loader2 } from 'lucide-react';
import type { Beneficiary, Account } from '../types';
import api from '../api/client';

type Step = 'list' | 'add' | 'transfer' | 'confirm' | 'success';

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [step, setStep] = useState<Step>('list');
  const [selectedBen, setSelectedBen] = useState<Beneficiary | null>(null);
  const [amount, setAmount] = useState('');
  const [newName, setNewName] = useState('');
  const [newAccNum, setNewAccNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bens, accs] = await Promise.all([
          api.get('/api/v1/core/beneficiaries'),
          api.get('/api/v1/core/accounts')
        ]);
        setBeneficiaries(bens.data);
        setAccounts(accs.data);
      } catch (e) {
        console.error('Failed to load data', e);
      } finally {
        setPageLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/v1/core/beneficiaries', {
        beneficiaryName: newName,
        beneficiaryAccountNumber: newAccNum
      });
      setBeneficiaries(prev => [...prev, res.data]);
      setNewName(''); setNewAccNum('');
      setStep('list');
    } catch (e) {
      console.error('Failed to add beneficiary', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirm');
  };

  const handleDelete = async (beneficiary: Beneficiary) => {
    if (!window.confirm(`Remove ${beneficiary.beneficiaryName} from your beneficiaries?`)) return;
    setDeletingId(beneficiary.id);
    try {
      await api.delete(`/api/v1/core/beneficiaries/${beneficiary.id}`);
      setBeneficiaries((current) => current.filter((item) => item.id !== beneficiary.id));
    } catch (error) {
      console.error('Failed to delete beneficiary', error);
      alert('Unable to remove beneficiary. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const confirmTransfer = async () => {
    setLoading(true);
    try {
      const senderAccountNumber = accounts.length > 0 ? accounts[0].accountNumber : 'UNKNOWN';
      await api.post('/api/v1/core/transfer', {
        senderAccountNumber: senderAccountNumber,
        receiverAccountNumber: selectedBen?.beneficiaryAccountNumber,
        amount: parseFloat(amount)
      });
      setStep('success');
    } catch (e) {
      console.error('Failed to process transfer', e);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="flex items-center justify-center h-64 text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Beneficiaries</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage trusted recipients for transfers.</p>
        </div>
        <button
          id="add-beneficiary-btn"
          onClick={() => setStep('add')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary text-sm font-medium text-white"
        >
          <Plus className="w-4 h-4" /> Add Beneficiary
        </button>
      </div>

      {/* Beneficiary Grid */}
      <div className="stagger-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {beneficiaries.map(ben => (
          <div key={ben.id} id={`ben-${ben.id}`} className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-xl font-bold text-blue-300">
                {ben.beneficiaryName.charAt(0)}
              </div>
              <button
                id={`delete-ben-${ben.id}`}
                onClick={() => void handleDelete(ben)}
                disabled={deletingId === ben.id}
                className="text-gray-600 hover:text-red-400 transition disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-white font-semibold">{ben.beneficiaryName}</p>
            <p className="text-gray-400 text-sm font-mono mb-4">{ben.beneficiaryAccountNumber}</p>
            <button
              id={`transfer-to-${ben.id}`}
              onClick={() => { setSelectedBen(ben); setStep('transfer'); }}
              className="flex items-center gap-2 w-full justify-center py-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition text-sm font-medium"
            >
              <Send className="w-3.5 h-3.5" /> Send Money
            </button>
          </div>
        ))}
      </div>

      {/* Add Beneficiary Modal */}
      {step === 'add' && (
        <Modal title="Add Beneficiary" onClose={() => setStep('list')}>
          <form onSubmit={handleAdd} className="space-y-4">
            <FormField label="Full Name" id="new-ben-name" value={newName} onChange={setNewName} placeholder="e.g. Alice Johnson" />
            <FormField label="Account Number" id="new-ben-account" value={newAccNum} onChange={setNewAccNum} placeholder="AGS-XXXX-2024" />
            <button type="submit" disabled={loading} id="confirm-add-beneficiary" className="btn-primary w-full py-3 rounded-xl text-white font-medium disabled:opacity-60">{loading ? 'Adding...' : 'Add Beneficiary'}</button>
          </form>
        </Modal>
      )}

      {/* Transfer Modal */}
      {step === 'transfer' && selectedBen && (
        <Modal title="Send Money" onClose={() => setStep('list')}>
          <div className="mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-gray-400">Sending to</p>
            <p className="text-white font-semibold">{selectedBen.beneficiaryName}</p>
            <p className="text-gray-400 text-xs font-mono">{selectedBen.beneficiaryAccountNumber}</p>
          </div>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount (USD)</label>
              <input
                id="transfer-amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                placeholder="0.00"
                className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <button type="submit" id="preview-transfer-btn" className="btn-primary w-full py-3 rounded-xl text-white font-medium">Preview Transfer</button>
          </form>
        </Modal>
      )}

      {/* Confirm Modal */}
      {step === 'confirm' && selectedBen && (
        <Modal title="Confirm Transfer" onClose={() => setStep('list')}>
          <div className="space-y-3 text-sm mb-6">
            {[['To', selectedBen.beneficiaryName], ['Account', selectedBen.beneficiaryAccountNumber], ['Amount', `$${parseFloat(amount || '0').toFixed(2)}`]].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-gray-800 pb-3">
                <span className="text-gray-400">{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep('transfer')} className="flex-1 py-3 rounded-xl glass text-gray-300 hover:text-white transition text-sm font-medium">Back</button>
            <button id="confirm-transfer-btn" onClick={confirmTransfer} disabled={loading} className="flex-1 py-3 rounded-xl btn-primary text-white font-medium text-sm disabled:opacity-60">
              {loading ? 'Processing...' : 'Confirm & Send'}
            </button>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      {step === 'success' && (
        <Modal title="Transfer Submitted" onClose={() => { setStep('list'); setAmount(''); setSelectedBen(null); }}>
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-white font-semibold mb-2">Transfer Submitted!</p>
            <p className="text-gray-400 text-sm">Your transfer has been queued. If flagged by fraud detection, it may require admin review.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-strong modal-enter rounded-2xl p-8 w-full max-w-md relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition"><X className="w-5 h-5" /></button>
        <h3 className="text-lg font-bold text-white mb-6">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, id, value, onChange, placeholder }: { label: string; id: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        placeholder={placeholder}
        className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
      />
    </div>
  );
}
