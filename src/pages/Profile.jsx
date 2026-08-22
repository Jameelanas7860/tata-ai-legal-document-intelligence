import {
  User as UserIcon,
  Mail,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  ShieldCheck,
  Edit3,
  Save,
  X,
} from 'lucide-react';
import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="truncate text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || '');

  const handleSave = () => {
    updateUser({ name: name.trim() || user.name, role: role.trim() || user.role });
    setEditing(false);
  };

  const handleCancel = () => {
    setName(user.name);
    setRole(user.role);
    setEditing(false);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="My Profile"
        subtitle="View and update your account information."
        icon={UserIcon}
        actions={
          editing ? (
            <>
              <Button variant="secondary" icon={X} onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" icon={Save} onClick={handleSave}>
                Save changes
              </Button>
            </>
          ) : (
            <Button variant="secondary" icon={Edit3} onClick={() => setEditing(true)}>
              Edit profile
            </Button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="card overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-brand-500 to-brand-700" />
            <div className="px-5 pb-5">
              <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-bold text-white ring-4 ring-white">
                {user?.initials || 'U'}
              </div>
              <h2 className="mt-3 text-lg font-semibold text-slate-900">{user?.name}</h2>
              <p className="text-sm text-slate-500">{user?.role}</p>
              <div className="mt-3 flex items-center gap-2">
                <StatusBadge status="Completed" />
                <span className="text-xs text-slate-400">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Account Information</h3>

            {editing ? (
              <div className="space-y-4 py-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Role / Title</label>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>
            ) : (
              <div className="py-1">
                <DetailRow icon={UserIcon} label="Full name" value={user?.name} />
                <DetailRow icon={Briefcase} label="Role" value={user?.role} />
                <DetailRow icon={Mail} label="Email" value={user?.email} />
                <DetailRow icon={Building2} label="Organization" value="Tata Group" />
                <DetailRow icon={Calendar} label="Member since" value="January 2026" />
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Access & Permissions</h3>
            <div className="flex flex-wrap gap-2">
              {['Upload documents', 'Run risk analysis', 'Review & approve', 'View audit trail', 'Escalate risks'].map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
