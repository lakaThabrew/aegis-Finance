import { useState } from 'react';
import { Plus, Trash2, Send, X, CheckCircle2 } from 'lucide-react';
import type { Beneficiary } from '../types';

const MOCK_BENEFICIARIES: Beneficiary[] = [
  { id: 'b1', beneficiaryName: 'Alice Johnson', beneficiaryAccountNumber: 'AGS-0099-2024' },
  { id: 'b2', beneficiaryName: 'Bob Smith', beneficiaryAccountNumber: 'AGS-0077-2024' },
  { id: 'b3', beneficiaryName: 'Charlie Lee', beneficiaryAccountNumber: 'AGS-0055-2024' },
];

type Step = 'list' | 'add' | 'transfer' | 'confirm' | 'success';

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(MOCK_BENEFICIARIES);
  const [step, setStep] = useState<Step>('list');
  const [selectedBen, setSelectedBen] = useState<Beneficiary | null>(null);
  const [amount, setAmount] = useState('');
  const [newName, setNewName] = useState('');
  const [newAccNum, setNewAccNum] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const nb: Beneficiary = { id: `b${Date.now()}`, beneficiaryName: newName, beneficiaryAccountNumber: newAccNum };
    setBeneficiaries(prev => [...prev, nb]);
    setNewName(''); setNewAccNum('');
    setStep('list');
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirm');
  };

  const confirmTransfer = async () => {
    setLoading(true);
    // TODO: POST to backend API
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep('success');
  };

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {beneficiaries.map(ben => (
          <div key={ben.id} id={`ben-${ben.id}`} className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-xl font-bold text-blue-300">
                {ben.beneficiaryName.charAt(0)}
              </div>
              <button
                id={`delete-ben-${ben.id}`}
                onClick={() => setBeneficiaries(prev => prev.filter(b => b.id !== ben.id))}
                className="text-gray-600 hover:text-red-400 transition"
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
            <button type="submit" id="confirm-add-beneficiary" className="btn-primary w-full py-3 rounded-xl text-white font-medium">Add Beneficiary</button>
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
            {[['To', selectedBen.beneficiaryName], ['Account', selectedBen.beneficiaryAccountNumber], ['Amount', `$${parseFloat(amount).toFixed(2)}`]].map(([k, v]) => (
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
      <div className="glass-strong rounded-2xl p-8 w-full max-w-md relative shadow-2xl">
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
