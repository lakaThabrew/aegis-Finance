import { useEffect, useState } from 'react';
import { Bell, ShieldCheck, AlertTriangle, ArrowRightLeft, Settings, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../api/client';

type Notification = { id: string; type: string; title: string; message: string; read: boolean; createdAt: string };

const typeStyle: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  security: { icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  transaction: { icon: ArrowRightLeft, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  alert: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  system: { icon: Settings, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Notification[]>('/api/v1/core/notifications')
      .then((response) => setNotifications(response.data))
      .catch((error) => console.error('Failed to load notifications', error))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/api/v1/core/notifications/read-all');
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
    }
  };

  return <div className="page-enter space-y-6 max-w-4xl mx-auto">
    <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-white flex items-center gap-2"><Bell className="w-6 h-6 text-indigo-400" />Notifications</h1><p className="text-gray-400 text-sm mt-1">Stay updated with your account activity and alerts.</p></div><button onClick={() => void markAllRead()} disabled={loading || notifications.every((notification) => notification.read)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 transition-colors disabled:opacity-50"><CheckCircle2 className="w-4 h-4" />Mark all as read</button></div>
    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-indigo-300" /></div> : <div className="space-y-4 mt-8">{notifications.map((notification, idx) => { const style = typeStyle[notification.type] ?? typeStyle.system; const Icon = style.icon; return <div key={notification.id} className={`glass rounded-2xl p-5 border flex gap-5 transition-all duration-300 hover:translate-x-1 ${notification.read ? 'border-white/5 opacity-80' : 'border-indigo-500/30 bg-indigo-500/5'}`} style={{ animationDelay: `${idx * 100}ms` }}><div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${style.bg}`}><Icon className={`w-6 h-6 ${style.color}`} /></div><div className="flex-1 min-w-0 pt-0.5"><div className="flex justify-between items-start mb-1"><h3 className={`font-semibold ${notification.read ? 'text-gray-300' : 'text-white'}`}>{notification.title}</h3><span className="text-xs text-gray-500 whitespace-nowrap ml-4">{new Date(notification.createdAt).toLocaleString()}</span></div><p className="text-sm text-gray-400 leading-relaxed">{notification.message}</p></div>{!notification.read && <div className="flex items-center justify-center pl-2"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" /></div>}</div>; })}{notifications.length === 0 && <p className="py-16 text-center text-sm text-gray-400">No notifications yet.</p>}</div>}
  </div>;
}
