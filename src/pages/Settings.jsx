import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Sparkles,
  Moon,
  Globe,
  Mail,
  Save,
  Check,
  Loader,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';

function Toggle({ enabled, onChange, label, description, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">{label}</p>
          {description ? <p className="text-xs text-slate-500">{description}</p> : null}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-200 ${
          enabled ? 'bg-brand-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

const SELECT_CLASSES =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100';

export default function Settings() {
  const { user } = useAuth();
  const { settings, loaded, updateNotifications, updateAi, updateAppearance } = useSettings();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Settings"
        subtitle="Manage your preferences and platform configuration."
        icon={SettingsIcon}
        actions={
          <Button icon={saved ? Check : Save} onClick={handleSave} variant={saved ? 'success' : 'primary'}>
            {saved ? 'Saved' : 'Save changes'}
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Notifications */}
        <div className="card p-5">
          <div className="mb-2 flex items-center gap-2">
            <Bell className="h-4 w-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-slate-700">Notifications</h3>
          </div>
          <Toggle
            icon={Bell}
            label="Email alerts"
            description="Receive an email when a document analysis completes"
            enabled={settings.notifications.emailAlerts}
            onChange={(v) => updateNotifications({ emailAlerts: v })}
          />
          <Toggle
            icon={Shield}
            label="Risk escalation alerts"
            description="Get notified immediately when a high-risk clause is escalated"
            enabled={settings.notifications.riskEscalations}
            onChange={(v) => updateNotifications({ riskEscalations: v })}
          />
          <Toggle
            icon={Mail}
            label="Weekly digest"
            description="A summary of platform activity every Monday"
            enabled={settings.notifications.weeklyDigest}
            onChange={(v) => updateNotifications({ weeklyDigest: v })}
          />
        </div>

        {/* AI preferences */}
        <div className="card p-5">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-slate-700">AI Analysis</h3>
          </div>
          <Toggle
            icon={Sparkles}
            label="Automatic risk analysis"
            description="Start AI analysis immediately after a document is uploaded"
            enabled={settings.ai.autoAnalysis}
            onChange={(v) => updateAi({ autoAnalysis: v })}
          />
          <div className="border-b border-slate-100 py-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Default risk threshold</label>
            <p className="mb-2 text-xs text-slate-500">Minimum severity to surface in the review summary</p>
            <select
              value={settings.ai.riskThreshold}
              onChange={(e) => updateAi({ riskThreshold: e.target.value })}
              className={SELECT_CLASSES}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
        </div>

        {/* Appearance & locale */}
        <div className="card p-5">
          <div className="mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-slate-700">Appearance & Locale</h3>
          </div>
          <Toggle
            icon={Moon}
            label="Dark mode"
            description="Use a dark theme across the platform (coming soon)"
            enabled={settings.appearance.darkMode}
            onChange={(v) => updateAppearance({ darkMode: v })}
          />
          <div className="border-b border-slate-100 py-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Language</label>
            <select
              value={settings.appearance.language}
              onChange={(e) => updateAppearance({ language: e.target.value })}
              className={SELECT_CLASSES}
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
        </div>

        {/* Account */}
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-slate-700">Account</h3>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">{user?.email}</p>
              <p className="text-xs text-slate-500">Signed in as {user?.name}</p>
            </div>
            <Button to="/profile" variant="secondary" size="sm">
              Manage account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
