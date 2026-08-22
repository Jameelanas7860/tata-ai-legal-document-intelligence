import { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  FileText,
  Quote,
  Lightbulb,
  Check,
  Pencil,
  X,
  ArrowUpRight,
} from 'lucide-react';
import Button from './Button';

const SEVERITY = {
  High: {
    label: 'HIGH',
    bar: 'bg-rose-500',
    chip: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: ShieldAlert,
    ring: 'ring-rose-100',
    glow: 'shadow-rose-100',
  },
  Medium: {
    label: 'MEDIUM',
    bar: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Shield,
    ring: 'ring-amber-100',
    glow: 'shadow-amber-100',
  },
  Low: {
    label: 'LOW',
    bar: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ShieldCheck,
    ring: 'ring-emerald-100',
    glow: 'shadow-emerald-100',
  },
};

const ACTIONS = [
  { key: 'accept', label: 'Accept', icon: Check, variant: 'success', size: 'sm' },
  { key: 'edit', label: 'Edit', icon: Pencil, variant: 'secondary', size: 'sm' },
  { key: 'reject', label: 'Reject', icon: X, variant: 'ghost', size: 'sm' },
  { key: 'escalate', label: 'Escalate', icon: ArrowUpRight, variant: 'danger', size: 'sm' },
];

export default function RiskCard({ risk, onAction }) {
  const s = SEVERITY[risk.severity] || SEVERITY.Low;
  const Icon = s.icon;
  const [actioned, setActioned] = useState(null);

  const handleAction = (key) => {
    setActioned(key);
    if (onAction) onAction(risk, key);
  };

  return (
    <div className={`card overflow-hidden ring-4 ${s.ring} transition-shadow hover:shadow-md`}>
      <div className={`h-1 w-full ${s.bar}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.chip} border`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{risk.title}</h3>
              <p className="mt-0.5 text-xs text-slate-400">{risk.id} · {risk.clause}</p>
            </div>
          </div>
          <span className={`shrink-0 rounded-md border px-2 py-1 text-xs font-bold tracking-wide ${s.chip}`}>
            {s.label}
          </span>
        </div>

        {/* Confidence bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">AI Confidence</span>
            <span className="font-semibold text-slate-700">{risk.confidence}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${s.bar} transition-all duration-700`}
              style={{ width: `${risk.confidence}%` }}
            />
          </div>
        </div>

        {/* Evidence */}
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Quote className="h-3.5 w-3.5" />
            Evidence
          </div>
          <p className="mt-1.5 text-sm italic text-slate-700">"{risk.evidence}"</p>
        </div>

        {/* Reason */}
        {risk.reason ? (
          <div className="mt-3">
            <p className="text-xs font-medium text-slate-500">Why this is flagged</p>
            <p className="mt-1 text-sm text-slate-600">{risk.reason}</p>
          </div>
        ) : null}

        {/* Recommendation */}
        {risk.recommendation ? (
          <div className="mt-3 flex gap-2 rounded-lg bg-brand-50/60 p-3">
            <Lightbulb className="h-4 w-4 shrink-0 text-brand-500" />
            <div>
              <p className="text-xs font-medium text-brand-700">Recommendation</p>
              <p className="mt-0.5 text-sm text-slate-600">{risk.recommendation}</p>
            </div>
          </div>
        ) : null}

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" /> Page {risk.page}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          {ACTIONS.map((a) => (
            <Button
              key={a.key}
              variant={actioned === a.key ? 'primary' : a.variant}
              size={a.size}
              icon={a.icon}
              onClick={() => handleAction(a.key)}
              className={actioned && actioned !== a.key ? 'opacity-50' : ''}
            >
              {actioned === a.key ? `${a.label}ed` : a.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
