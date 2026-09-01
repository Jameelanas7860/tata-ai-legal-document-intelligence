import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Download, Filter, Search, Loader } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import AuditTimeline from '../components/AuditTimeline';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import auditService from '../services/auditService';

export default function AuditHistory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await auditService.getAuditHistory();
        if (active) {
          setEvents(data);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleExport = useCallback(async () => {
    try {
      const csv = await auditService.exportAuditLog('csv');
      auditService.downloadExport(csv, 'audit-log.csv');
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, []);

  const statuses = ['All', 'Completed', 'Escalated'];

  const filtered = events.filter((e) => {
    const matchesSearch =
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.user.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Audit History"
        subtitle="Track document processing and review activities."
        icon={History}
        actions={<Button variant="secondary" icon={Download} onClick={handleExport}>Export Log</Button>}
      />

      {error ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-slate-600">{error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="card p-10 text-center">
          <History className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No audit events yet. Upload and analyze a document to see activity here.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Timeline */}
          <div className="lg:col-span-1">
            <div className="card p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-700">Activity Timeline</h3>
              <AuditTimeline events={events} />
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-2">
            <div className="card p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Audit Log</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search..."
                      className="rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
                    <Filter className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
                    {statuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                          statusFilter === s ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-lg border border-slate-200 md:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50/60 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Action</th>
                      <th className="px-4 py-3 font-semibold">User</th>
                      <th className="px-4 py-3 font-semibold">Timestamp</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{e.action}</p>
                          <p className="text-xs text-slate-400">{e.detail}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-700">{e.user}</p>
                          <p className="text-xs text-slate-400">{e.role}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          <p>{e.date}</p>
                          <p className="text-xs text-slate-400">{e.timestamp}</p>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {filtered.map((e) => (
                  <div key={e.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{e.action}</p>
                        <p className="text-xs text-slate-400">{e.detail}</p>
                      </div>
                      <StatusBadge status={e.status} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>{e.user} · {e.role}</span>
                      <span>{e.date} · {e.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">No audit entries match your search.</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
