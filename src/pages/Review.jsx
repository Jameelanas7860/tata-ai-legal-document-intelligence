import { useState, useMemo } from 'react';
import {
  ShieldCheck,
  FileText,
  MapPin,
  Tag,
  Eye,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Sparkles,
  ScrollText,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import RiskCard from '../components/RiskCard';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { risks, riskSummary, contractSummary } from '../data/mockData';

const FILTERS = ['All', 'High', 'Medium', 'Low'];
const SORTS = ['Severity', 'Confidence', 'Page'];

const SEVERITY_ORDER = { High: 3, Medium: 2, Low: 1 };

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="truncate text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function Review() {
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Severity');
  const [actionLog, setActionLog] = useState([]);
  const [escalateModal, setEscalateModal] = useState(null);

  const filtered = useMemo(() => {
    let list = risks.filter((r) => filter === 'All' || r.severity === filter);
    list = [...list].sort((a, b) => {
      if (sort === 'Severity') return SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity];
      if (sort === 'Confidence') return b.confidence - a.confidence;
      if (sort === 'Page') return a.page - b.page;
      return 0;
    });
    return list;
  }, [filter, sort]);

  const handleAction = (risk, key) => {
    setActionLog((log) => [...log, { risk: risk.title, action: key, id: Date.now() }]);
    if (key === 'escalate') setEscalateModal(risk);
  };

  const overallStyle =
    riskSummary.overall === 'High' ? 'from-rose-500 to-rose-600' :
    riskSummary.overall === 'Medium' ? 'from-amber-500 to-amber-600' :
    'from-emerald-500 to-emerald-600';

  return (
    <div>
      <PageHeader
        title="Contract Review"
        subtitle="AI-extracted clauses, risk analysis, and recommended actions."
        icon={ShieldCheck}
        actions={
          <>
            <Button variant="secondary" icon={ScrollText}>Export Report</Button>
            <Button variant="primary" icon={CheckCircle2}>Mark Reviewed</Button>
          </>
        }
      />

      {/* Document header */}
      <div className="card mb-6 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Vendor_Agreement.pdf</h2>
              <p className="text-sm text-slate-500">DOC-2401 · 14 pages · Uploaded by Anas Khan</p>
            </div>
          </div>
          <StatusBadge status="Under Review" />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetaItem icon={Tag} label="Document Type" value="Vendor Agreement" />
          <MetaItem icon={MapPin} label="Jurisdiction" value="India" />
          <MetaItem icon={Eye} label="Review Status" value="Under Review" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: summary + risks */}
        <div className="lg:col-span-2">
          {/* Contract summary */}
          <div className="card mb-6 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-700">Contract Summary</h3>
              <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600">AI Generated</span>
            </div>
            <p className="font-serif text-[15px] leading-relaxed text-slate-700">{contractSummary}</p>
          </div>

          {/* Controls */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Risk Analysis</h3>
              <p className="text-sm text-slate-500">{filtered.length} risks found</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
                <Filter className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      filter === f ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-600 focus:outline-none"
                >
                  {SORTS.map((s) => <option key={s} value={s}>Sort: {s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Risk cards */}
          <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map((risk) => (
              <RiskCard key={risk.id} risk={risk} onAction={handleAction} />
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="card p-8 text-center text-sm text-slate-500">
              No risks match the selected filter.
            </div>
          ) : null}
        </div>

        {/* Right: summary panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            {/* Overall risk */}
            <div className={`card overflow-hidden`}>
              <div className={`bg-gradient-to-br ${overallStyle} p-5 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Overall Risk</p>
                    <p className="mt-1 text-3xl font-bold">{riskSummary.overall}</p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-white/70" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-white/80">
                    <span>AI Confidence</span>
                    <span className="font-semibold text-white">{riskSummary.confidence}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-white" style={{ width: `${riskSummary.confidence}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Risk breakdown */}
            <div className="card p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-700">Risk Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-rose-600" />
                    <span className="text-sm font-medium text-rose-700">High Risks</span>
                  </div>
                  <span className="text-lg font-bold text-rose-700">{riskSummary.high}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">Medium Risks</span>
                  </div>
                  <span className="text-lg font-bold text-amber-700">{riskSummary.medium}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Low Risks</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-700">{riskSummary.low}</span>
                </div>
              </div>
            </div>

            {/* Action log */}
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Your Actions</h3>
              {actionLog.length === 0 ? (
                <p className="text-sm text-slate-400">No actions taken yet. Accept, edit, reject, or escalate risks to log them here.</p>
              ) : (
                <div className="space-y-2">
                  {actionLog.slice(-4).reverse().map((log) => (
                    <div key={log.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-slate-700">
                        <span className="font-medium capitalize">{log.action}</span> · {log.risk}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button to="/audit" variant="secondary" className="w-full" icon={ScrollText}>
              View Audit History
            </Button>
          </div>
        </div>
      </div>

      {/* Escalate modal */}
      <Modal
        open={!!escalateModal}
        onClose={() => setEscalateModal(null)}
        title="Escalate Risk"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEscalateModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => setEscalateModal(null)}>Confirm Escalation</Button>
          </>
        }
      >
        {escalateModal ? (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <RiskBadge level={escalateModal.severity} />
              <p className="font-semibold text-slate-900">{escalateModal.title}</p>
            </div>
            <p className="text-sm text-slate-600">
              This risk will be escalated to the Legal Head for review. An entry will be added to the audit trail.
            </p>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Add a note (optional)</label>
              <textarea
                rows={3}
                placeholder="Explain why this risk is being escalated..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
