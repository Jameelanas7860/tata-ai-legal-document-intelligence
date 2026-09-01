const TONES = {
  brand: { bg: 'bg-brand-50', text: 'text-brand-600', ring: 'ring-brand-100', darkBg: 'dark:bg-brand-950', darkText: 'dark:text-brand-400', darkRing: 'dark:ring-brand-900' },
  success: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', darkBg: 'dark:bg-emerald-950', darkText: 'dark:text-emerald-400', darkRing: 'dark:ring-emerald-900' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100', darkBg: 'dark:bg-amber-950', darkText: 'dark:text-amber-400', darkRing: 'dark:ring-amber-900' },
  error: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100', darkBg: 'dark:bg-rose-950', darkText: 'dark:text-rose-400', darkRing: 'dark:ring-rose-900' },
};

export default function StatCard({ label, value, icon: Icon, trend, tone = 'brand' }) {
  const t = TONES[tone] || TONES.brand;
  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
        {Icon ? (
          <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${t.bg} ${t.text} ${t.darkBg} ${t.darkText} ring-4 ${t.ring} ${t.darkRing}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {trend ? (
        <p className="mt-3 text-xs font-medium text-slate-400 dark:text-slate-500">{trend}</p>
      ) : null}
    </div>
  );
}
