
import { ArrowRight, CheckCircle2, Fingerprint, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import securityHero from '../assets/aegis-security-hero.png';
import { Navigate } from 'react-router-dom';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060a16] px-5 py-6 sm:p-8 lg:p-10">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1023]/85 shadow-[0_32px_100px_rgba(0,0,0,.42)] backdrop-blur-xl lg:grid-cols-[.94fr_1.06fr]">
        <section className="relative flex items-center justify-center p-7 sm:p-12 lg:p-16">
          <div className="page-enter w-full max-w-[27rem]">
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-violet-600 shadow-lg shadow-indigo-500/30"><ShieldCheck className="h-6 w-6 text-white" /></div>
              <div><p className="text-lg font-bold tracking-tight text-white">Aegis Finance</p><p className="text-xs font-medium tracking-[.16em] text-blue-300">SECURE BANKING</p></div>
            </div>
            <p className="mb-3 text-sm font-semibold tracking-[.18em] text-blue-300">WELCOME BACK</p>
            <h1 className="max-w-sm text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">Your finances, <span className="gradient-text">protected.</span></h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">Sign in to your resilient digital banking space. Every action is protected by continuous verification.</p>

            <div className="mt-9 space-y-5">
              <button id="login-btn" onClick={login} className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white">Secure sign in with Keycloak <ArrowRight className="h-4 w-4" /></button>
            </div>
            <div className="mt-7 flex items-center gap-2 text-xs text-slate-500"><Fingerprint className="h-4 w-4 text-violet-300" />Protected with Keycloak identity and TOTP multi-factor authentication.</div>
          </div>
        </section>
        <section className="relative hidden overflow-hidden border-l border-white/10 bg-[#070d20] lg:block">
          <img src={securityHero} alt="Layered glass security shield protecting the Aegis Finance network" className="login-hero-art absolute inset-0 h-full w-full scale-110 object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070d20] via-transparent to-[#070d20]/20" />
          <div className="absolute inset-x-12 bottom-12 rounded-2xl border border-white/15 bg-[#0b1430]/70 p-5 shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><span className="ambient-glow h-2 w-2 rounded-full bg-emerald-400" />Aegis security status</div>
            <div className="grid grid-cols-3 gap-3 text-xs"><TrustMetric label="Encryption" value="Active" /><TrustMetric label="Fraud watch" value="Online" /><TrustMetric label="Ledger" value="Verified" /></div>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-300"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />Your access is continually evaluated for your protection.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

function TrustMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/[.06] p-3"><p className="text-slate-400">{label}</p><p className="mt-1 font-semibold text-white">{value}</p></div>;
}
