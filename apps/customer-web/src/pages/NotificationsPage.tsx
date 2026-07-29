import { Bell, ShieldCheck, AlertTriangle, ArrowRightLeft, Settings, CheckCircle2 } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'security',
    title: 'New Device Login',
    message: 'We detected a login from a new device (MacBook Pro) in Colombo, LK.',
    time: '2 hours ago',
    icon: ShieldCheck,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    read: false,
  },
  {
    id: 2,
    type: 'transaction',
    title: 'Transfer Completed',
    message: 'Your transfer of Rs 50,000 to John Doe (AGS-0045) was successful.',
    time: 'Yesterday at 14:30',
    icon: ArrowRightLeft,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    read: true,
  },
  {
    id: 3,
    type: 'alert',
    title: 'Account Update Required',
    message: 'Please update your KYC documents to remove the transfer limits on your account.',
    time: '3 days ago',
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    read: true,
  },
  {
    id: 4,
    type: 'system',
    title: 'System Maintenance',
    message: 'Aegis Finance will undergo scheduled maintenance this Sunday from 2 AM to 4 AM.',
    time: '5 days ago',
    icon: Settings,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10 border-slate-500/20',
    read: true,
  }
];

export default function NotificationsPage() {
  return (
    <div className="page-enter space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-400" />
            Notifications
          </h1>
          <p className="text-gray-400 text-sm mt-1">Stay updated with your account activity and alerts.</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 transition-colors">
          <CheckCircle2 className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="space-y-4 mt-8">
        {NOTIFICATIONS.map((notif, idx) => (
          <div 
            key={notif.id} 
            className={`glass rounded-2xl p-5 border flex gap-5 transition-all duration-300 hover:translate-x-1 ${notif.read ? 'border-white/5 opacity-80' : 'border-indigo-500/30 bg-indigo-500/5'}`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${notif.bg}`}>
              <notif.icon className={`w-6 h-6 ${notif.color}`} />
            </div>
            
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`font-semibold ${notif.read ? 'text-gray-300' : 'text-white'}`}>
                  {notif.title}
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{notif.time}</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {notif.message}
              </p>
            </div>
            
            {!notif.read && (
              <div className="flex items-center justify-center pl-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
