import { useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';
import { CheckCircle2, Loader2, LockKeyhole, Mail, Save, ShieldCheck, UserRound } from 'lucide-react';
import api from '../api/client';

type Profile = {
  id: string;
  customerId: string;
  fullName: string;
  email: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  riskScore: number;
  createdAt: string;
};

function requestError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: string; message?: string } | undefined;
    return data?.detail ?? data?.message ?? fallback;
  }
  return fallback;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get<Profile>('/api/v1/core/profile');
        setProfile(response.data);
        setFullName(response.data.fullName);
        setEmail(response.data.email);
      } catch (requestFailure) {
        setError(requestError(requestFailure, 'Unable to load your profile.'));
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await api.put<Profile>('/api/v1/core/profile', { fullName, email });
      setProfile(response.data);
      setFullName(response.data.fullName);
      setEmail(response.data.email);
      setMessage('Your profile has been updated.');
    } catch (requestFailure) {
      setError(requestError(requestFailure, 'Unable to update your profile.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-white"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="page-enter mx-auto max-w-4xl space-y-7">
      <div>
        <p className="mb-1 text-[11px] font-bold tracking-[.18em] text-blue-300">ACCOUNT SETTINGS</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Profile & settings</h1>
        <p className="mt-1 text-sm text-slate-400">Update the contact details associated with your banking profile.</p>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
      {message && <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"><CheckCircle2 className="h-4 w-4" />{message}</div>}

      {profile && (
        <div className="grid gap-6 lg:grid-cols-[1.45fr_.9fr]">
          <form onSubmit={saveProfile} className="glass rounded-2xl p-6 sm:p-7">
            <div className="mb-6 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300"><UserRound className="h-5 w-5" /></div><div><h2 className="font-semibold text-white">Personal profile</h2><p className="text-xs text-slate-400">Keep your customer details up to date.</p></div></div>
            <div className="space-y-4">
              <label className="block text-sm text-slate-300"><span className="mb-1.5 block">Full name</span><input required value={fullName} onChange={(event) => setFullName(event.target.value)} className="input" /></label>
              <label className="block text-sm text-slate-300"><span className="mb-1.5 block">Email address</span><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input pl-10" /></div></label>
              <label className="block text-sm text-slate-300"><span className="mb-1.5 block">Customer ID</span><input value={profile.customerId} disabled className="input cursor-not-allowed opacity-60" /></label>
            </div>
            <div className="mt-6 flex justify-end"><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save profile</button></div>
          </form>

          <div className="space-y-6">
            <section className="glass rounded-2xl p-6"><div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300"><ShieldCheck className="h-5 w-5" /></div><div><h2 className="font-semibold text-white">Verification</h2><p className="text-xs text-slate-400">Identity status</p></div></div><dl className="space-y-3 text-sm"><Detail label="KYC status" value={profile.verificationStatus} /><Detail label="Risk score" value={`${profile.riskScore} / 100`} /><Detail label="Customer since" value={new Date(profile.createdAt).toLocaleDateString()} /></dl></section>
            <section className="glass rounded-2xl p-6"><div className="mb-3 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300"><LockKeyhole className="h-5 w-5" /></div><div><h2 className="font-semibold text-white">Sign-in security</h2><p className="text-xs text-slate-400">Managed by Keycloak</p></div></div><p className="text-sm leading-6 text-slate-400">Password and multi-factor authentication are protected through the secure identity provider.</p></section>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0"><dt className="text-slate-400">{label}</dt><dd className="font-medium text-white">{value}</dd></div>;
}
