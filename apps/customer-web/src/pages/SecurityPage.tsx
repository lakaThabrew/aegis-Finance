import { useEffect, useState } from 'react';
import { ShieldAlert, Smartphone, Lock, AlertTriangle, Clock, CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import securityHero from '../assets/aegis-security-hero.png';
import type { Account } from '../types';
import api from '../api/client';

const SEV_STYLE: Record<string, string> = {
  info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  critical: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const SEV_ICON: Record<string, React.ReactNode> = {
  info: <CheckCircle2 className="w-4 h-4 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 shrink-0" />,
  critical: <ShieldAlert className="w-4 h-4 shrink-0" />,
};

type LinkedCard = {
  id: string;
  accountId: string | null;
  cardNumber: string;
  isFrozen: boolean;
};

type TrustedDevice = {
  id: string;
  name: string;
  location: string;
  trusted: boolean;
  lastSeen: string;
};

type TrustedDeviceResponse = {
  id: string;
  deviceName: string;
  trusted: boolean;
  lastSeen: string;
};

type SecurityAuditEvent = {
  id: string;
  eventType: string;
  message: string;
  createdAt: string;
};

function severityFor(eventType: string) {
  if (eventType === 'ACCOUNT_FROZEN') return 'critical';
  if (eventType.includes('FAILED') || eventType.includes('BLOCKED')) return 'warning';
  return 'info';
}

export default function SecurityPage() {
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<LinkedCard[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [freezeSaving, setFreezeSaving] = useState(false);
  const [freezeError, setFreezeError] = useState<string | null>(null);
  const [auditEvents, setAuditEvents] = useState<SecurityAuditEvent[]>([]);

  useEffect(() => {
    async function loadSecurityControls() {
      try {
        const [accountResponse, cardResponse, auditResponse, deviceResponse] = await Promise.all([
          api.get<Account[]>('/api/v1/core/accounts'),
          api.get<LinkedCard[]>('/api/v1/core/cards'),
          api.get<SecurityAuditEvent[]>('/api/v1/core/security/events'),
          api.get<TrustedDeviceResponse[]>('/api/v1/core/security/devices'),
        ]);
        setAccounts(accountResponse.data);
        setCards(cardResponse.data);
        setAuditEvents(auditResponse.data);
        setDevices(deviceResponse.data.map((device) => ({ id: device.id, name: device.deviceName, location: 'Last seen', trusted: device.trusted, lastSeen: new Date(device.lastSeen).toLocaleString() })));
        if (accountResponse.data[0]) setSelectedAccountId(accountResponse.data[0].id);
      } catch (error) {
        console.error('Failed to load account security controls', error);
        setFreezeError('Unable to load account security controls.');
      }
    }
    void loadSecurityControls();
  }, []);

  const toggleTrust = async (device: TrustedDevice) => {
    try {
      const response = await api.patch<TrustedDeviceResponse>(`/api/v1/core/security/devices/${device.id}`, { trusted: !device.trusted });
      setDevices((current) => current.map((entry) => entry.id === device.id ? { ...entry, trusted: response.data.trusted } : entry));
    } catch (error) {
      console.error('Failed to update trusted device', error);
      setFreezeError('Unable to update the device trust status.');
    }
  };

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId);
  const linkedCards = cards.filter((card) => card.accountId === selectedAccountId);
  const isFrozen = selectedAccount?.status === 'FROZEN';

  const toggleAccountFreeze = async () => {
    if (!selectedAccount) return;
    const frozen = !isFrozen;
    setFreezeSaving(true);
    setFreezeError(null);
    try {
      const response = await api.patch<Account>(`/api/v1/core/accounts/${selectedAccount.id}/freeze`, { frozen });
      setAccounts((current) => current.map((account) => account.id === response.data.id ? response.data : account));
      setCards((current) => current.map((card) => card.accountId === response.data.id ? { ...card, isFrozen: frozen } : card));
    } catch (error) {
      console.error('Failed to update account freeze status', error);
      setFreezeError('Unable to update the account freeze status.');
    } finally {
      setFreezeSaving(false);
    }
  };

  return (
    <div className="page-enter space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Security Center</h1>
        <p className="text-gray-400 text-sm mt-0.5">Monitor your account security and manage access.</p>
      </div>

      <section className="relative min-h-44 overflow-hidden rounded-2xl border border-blue-400/20 bg-[#0a1531] p-6 sm:p-7">
        <img src={securityHero} alt="Aegis layered security shield" className="visual-float absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09142e] via-[#09142e]/85 to-[#09142e]/20" />
        <div className="relative max-w-sm"><p className="mb-2 text-xs font-bold tracking-[.18em] text-blue-200">ZERO-TRUST PROTECTION</p><h2 className="text-2xl font-bold tracking-tight text-white">Your security posture is strong.</h2><p className="mt-2 text-sm leading-6 text-blue-100/70">Aegis continuously checks your devices, transactions, and active sessions.</p></div>
      </section>

      {/* Account Freeze */}
      <div className={`rounded-2xl p-6 border transition-all ${isFrozen ? 'bg-red-500/10 border-red-500/30' : 'glass border-gray-800'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isFrozen ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
              <Lock className={`w-6 h-6 ${isFrozen ? 'text-red-400' : 'text-blue-400'}`} />
            </div>
            <div>
              <p className="text-white font-semibold">Account Freeze</p>
              <p className="text-sm text-gray-400">{isFrozen ? 'This account and its linked card are frozen. Transfers are blocked.' : 'Freeze one account and its linked card if you suspect fraud.'}</p>
            </div>
          </div>
          <button
            id="freeze-account-btn"
            onClick={() => void toggleAccountFreeze()}
            disabled={!selectedAccount || freezeSaving}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition disabled:opacity-50 ${isFrozen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'}`}
          >
            {freezeSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-gray-400">Account<select value={selectedAccountId} onChange={(event) => setSelectedAccountId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/20 p-2.5 text-sm text-white"><option value="">Select an account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.accountNumber} · {account.status}</option>)}</select></label>
          <div className="rounded-xl border border-white/10 bg-white/[.03] p-3"><p className="flex items-center gap-2 text-xs font-medium text-gray-400"><CreditCard className="h-3.5 w-3.5" />Linked cards</p><p className="mt-1 text-sm font-semibold text-white">{linkedCards.length} card{linkedCards.length === 1 ? '' : 's'} {isFrozen && linkedCards.length > 0 ? 'frozen' : 'protected'}</p></div>
        </div>
        {freezeError && <p className="mt-3 text-sm text-red-300">{freezeError}</p>}
      </div>

      {/* Trusted Devices */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Trusted Devices</h2>
        <div className="space-y-3">
          {devices.map(device => (
            <div
              key={device.id}
              id={`device-${device.id}`}
              className={`glass rounded-xl p-4 flex items-center gap-4 ${!device.trusted ? 'border-red-500/30' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${device.trusted ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                <Smartphone className={`w-5 h-5 ${device.trusted ? 'text-emerald-400' : 'text-red-400'}`} />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{device.name}</p>
                <p className="text-gray-400 text-xs">{device.location} · {device.lastSeen}</p>
              </div>
              {!device.trusted && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30 mr-2">Unrecognized</span>
              )}
              <button
                id={`trust-device-${device.id}`}
                onClick={() => void toggleTrust(device)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${device.trusted ? 'text-gray-400 border-gray-700 hover:text-red-400 hover:border-red-500/30' : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'}`}
              >
                {device.trusted ? 'Remove Trust' : 'Trust Device'}
              </button>
            </div>
          ))}
          {devices.length === 0 && <p className="rounded-xl border border-white/10 p-4 text-sm text-gray-400">No signed-in devices have been recorded yet.</p>}
        </div>
      </div>

      {/* Audit Trail */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Audit Trail</h2>
        <div className="glass rounded-2xl overflow-hidden">
          {auditEvents.length === 0 && <p className="p-5 text-sm text-gray-400">No security events have been recorded yet.</p>}
          {auditEvents.map((entry, i) => {
            const severity = severityFor(entry.eventType);
            return (
              <div
                key={entry.id}
                id={`audit-${entry.id}`}
                className={`flex items-center gap-4 p-4 ${i < auditEvents.length - 1 ? 'border-b border-gray-800/60' : ''}`}
              >
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${SEV_STYLE[severity]}`}>
                  {SEV_ICON[severity]}
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </span>
                <p className="flex-1 text-sm text-gray-300">{entry.message}</p>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(entry.createdAt).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
