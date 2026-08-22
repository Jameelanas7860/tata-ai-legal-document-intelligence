import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  Loader,
  ShieldCheck,
  History,
  Scale,
  X,
  User,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

const NAV_KEYS = [
  { to: '/', labelKey: 'dashboard', icon: LayoutDashboard, end: true },
  { to: '/upload', labelKey: 'uploadDocument', icon: UploadCloud },
  { to: '/processing', labelKey: 'processing', icon: Loader },
  { to: '/review', labelKey: 'reviewRisk', icon: ShieldCheck },
  { to: '/audit', labelKey: 'auditHistory', icon: History },
];

const ACCOUNT_KEYS = [
  { to: '/profile', labelKey: 'profile', icon: User },
  { to: '/settings', labelKey: 'settings', icon: SettingsIcon },
];

export default function Sidebar({ open, onClose }) {
  const { t } = useI18n();
  const NAV = NAV_KEYS.map((i) => ({ ...i, label: t(i.labelKey) }));
  const ACCOUNT_NAV = ACCOUNT_KEYS.map((i) => ({ ...i, label: t(i.labelKey) }));

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden dark:bg-slate-950/70"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-sm">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-slate-900 dark:text-slate-100">Legal Intelligence</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Tata Group · Enterprise</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('workspace')}
          </p>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`h-5 w-5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`}
                  />
                  {item.label}
                  {isActive ? (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <nav className="flex flex-col gap-1 px-4 pb-4">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('account')}
          </p>
          {ACCOUNT_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`h-5 w-5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`}
                  />
                  {item.label}
                  {isActive ? (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="absolute inset-x-4 bottom-4">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-brand-50 to-slate-50 p-4 dark:border-slate-800 dark:from-brand-950 dark:to-slate-800">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t('aiEngineStatus')}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400">{t('operational')} · Gemini 1.5</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
