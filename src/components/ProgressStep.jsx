import { CheckCircle2, Loader2, Circle } from 'lucide-react';

const STATES = {
  completed: { icon: CheckCircle2, color: 'text-emerald-500', ring: 'bg-emerald-500', label: 'Completed' },
  processing: { icon: Loader2, color: 'text-brand-500', ring: 'bg-brand-500', label: 'Processing', spin: true },
  pending: { icon: Circle, color: 'text-slate-300', ring: 'bg-slate-200', label: 'Pending' },
};

export default function ProgressStep({ step, index, total, state = 'pending' }) {
  const s = STATES[state] || STATES.pending;
  const Icon = s.icon;
  const isLast = index === total - 1;

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {/* connector line */}
      {!isLast ? (
        <div className="absolute left-[15px] top-8 h-full w-0.5 bg-slate-200">
          <div
            className={`h-full w-full ${state === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'}`}
          />
        </div>
      ) : null}

      <div className="relative z-10 shrink-0">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white ${
            state === 'completed' ? 'bg-emerald-50' : state === 'processing' ? 'bg-brand-50' : 'bg-slate-50'
          }`}
        >
          <Icon className={`h-4 w-4 ${s.color} ${s.spin ? 'animate-spin' : ''}`} />
        </div>
      </div>

      <div className="flex-1 pt-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900">{step.name}</p>
          <span
            className={`text-xs font-medium ${
              state === 'completed' ? 'text-emerald-600' : state === 'processing' ? 'text-brand-600' : 'text-slate-400'
            }`}
          >
            {s.label}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-slate-500">{step.detail}</p>
      </div>
    </div>
  );
}
