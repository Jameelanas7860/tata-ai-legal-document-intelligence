import { CheckCircle2, Loader2, Circle, User, Cpu, Sparkles, ShieldAlert } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ROLE_ICON = {
  User: User,
  System: Cpu,
  AI: Sparkles,
  Reviewer: ShieldAlert,
};

export default function AuditTimeline({ events }) {
  return (
    <div className="relative">
      {events.map((event, i) => {
        const isLast = i === events.length - 1;
        const Icon = ROLE_ICON[event.role] || Circle;
        const roleColor =
          event.role === 'AI' ? 'bg-violet-50 text-violet-600' :
          event.role === 'System' ? 'bg-slate-100 text-slate-600' :
          event.role === 'Reviewer' ? 'bg-rose-50 text-rose-600' :
          'bg-brand-50 text-brand-600';

        return (
          <div key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast ? (
              <div className="absolute left-[19px] top-10 h-full w-0.5 bg-slate-200" />
            ) : null}
            <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${roleColor}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{event.action}</p>
                  <p className="text-sm text-slate-500">{event.detail}</p>
                </div>
                <StatusBadge status={event.status} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <span className="font-medium text-slate-600">{event.user}</span>
                <span>·</span>
                <span>{event.role}</span>
                <span>·</span>
                <span>{event.date} · {event.timestamp}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
