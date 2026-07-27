import { useState } from 'react';
import { ShieldAlert, Smartphone, Lock, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

const MOCK_DEVICES = [
  { id: 'd1', name: 'Chrome on Windows', trusted: true, lastSeen: '2 hours ago', location: 'Colombo, LK' },
  { id: 'd2', name: 'Safari on iPhone', trusted: true, lastSeen: '1 day ago', location: 'Colombo, LK' },
  { id: 'd3', name: 'Firefox on Linux', trusted: false, lastSeen: '5 minutes ago', location: 'Unknown' },
];

const MOCK_AUDIT = [
  { id: 'a1', event: 'Login successful', timestamp: '2026-07-27 10:22 AM', severity: 'info' },
  { id: 'a2', event: 'Transfer $1,500 to AGS-0099-2024 — COMPLETED', timestamp: '2026-07-27 09:15 AM', severity: 'info' },
  { id: 'a3', event: 'Transfer $25,000 to AGS-0077-2024 — HELD (Risk Score: 85)', timestamp: '2026-07-27 08:55 AM', severity: 'warning' },
  { id: 'a4', event: 'Unrecognized device login attempt blocked', timestamp: '2026-07-26 11:03 PM', severity: 'critical' },
];

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

export default function SecurityPage() {
  const [frozen, setFrozen] = useState(false);
  const [devices, setDevices] = useState(MOCK_DEVICES);

  const toggleTrust = (id: string) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, trusted: !d.trusted } : d));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Security Center</h1>
        <p className="text-gray-400 text-sm mt-0.5">Monitor your account security and manage access.</p>
      </div>

      {/* Account Freeze */}
      <div className={`rounded-2xl p-6 border transition-all ${frozen ? 'bg-red-500/10 border-red-500/30' : 'glass border-gray-800'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${frozen ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
              <Lock className={`w-6 h-6 ${frozen ? 'text-red-400' : 'text-blue-400'}`} />
            </div>
            <div>
              <p className="text-white font-semibold">Account Freeze</p>
              <p className="text-sm text-gray-400">{frozen ? 'Your account is currently frozen. All transactions are blocked.' : 'Instantly freeze all transactions if you suspect fraud.'}</p>
            </div>
          </div>
          <button
            id="freeze-account-btn"
            onClick={() => setFrozen(!frozen)}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition ${frozen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'}`}
          >
            {frozen ? 'Unfreeze Account' : 'Freeze Account'}
          </button>
        </div>
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
                onClick={() => toggleTrust(device.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${device.trusted ? 'text-gray-400 border-gray-700 hover:text-red-400 hover:border-red-500/30' : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'}`}
              >
                {device.trusted ? 'Remove Trust' : 'Trust Device'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Trail */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Audit Trail</h2>
        <div className="glass rounded-2xl overflow-hidden">
          {MOCK_AUDIT.map((entry, i) => (
            <div
              key={entry.id}
              id={`audit-${entry.id}`}
              className={`flex items-center gap-4 p-4 ${i < MOCK_AUDIT.length - 1 ? 'border-b border-gray-800/60' : ''}`}
            >
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${SEV_STYLE[entry.severity]}`}>
                {SEV_ICON[entry.severity]}
                {entry.severity.charAt(0).toUpperCase() + entry.severity.slice(1)}
              </span>
              <p className="flex-1 text-sm text-gray-300">{entry.event}</p>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs shrink-0">
                <Clock className="w-3.5 h-3.5" />
                {entry.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
