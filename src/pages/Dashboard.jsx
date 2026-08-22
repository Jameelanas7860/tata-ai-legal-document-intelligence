import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Loader,
  ShieldAlert,
  UploadCloud,
  ArrowRight,
  TrendingUp,
  Clock,
  Search,
  X,
  RotateCcw,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { stats, documents } from '../data/mockData';

const ICONS = { FileText, CheckCircle2, Loader, ShieldAlert };

const STATUS_FILTERS = ['All', 'Completed', 'Processing', 'Under Review'];
const RISK_FILTERS = ['All', 'High', 'Medium', 'Low'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [search, setSearch] = useState('');

  const isFiltered =
    statusFilter !== 'All' || riskFilter !== 'All' || search.trim() !== '';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((d) => {
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      const matchesRisk = riskFilter === 'All' || d.risk === riskFilter;
      const matchesSearch =
        q === '' ||
        d.name.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.uploadedBy.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q);
      return matchesStatus && matchesRisk && matchesSearch;
    });
  }, [statusFilter, riskFilter, search]);

  const clearFilters = () => {
    setStatusFilter('All');
    setRiskFilter('All');
    setSearch('');
  };

  const goReview = () => navigate('/review');

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Legal Document Intelligence"
        subtitle="Review, analyze and manage legal documents with AI-powered risk intelligence."
        actions={
          <Button to="/upload" icon={UploadCloud} size="lg">
            Upload Document
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={ICONS[s.icon]}
            trend={s.trend}
            tone={s.tone}
          />
        ))}
      </div>

      {/* Risk banner + pipeline */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Attention required</p>
                <p className="text-lg font-semibold text-slate-900">
                  2 high-risk contracts need review
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Vendor Agreement &amp; Master Services flagged by AI analysis
                </p>
              </div>
            </div>
            <Button
              to="/review"
              variant="danger"
              icon={ArrowRight}
              className="w-full sm:w-auto"
            >
              Review now
            </Button>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Processing pipeline</p>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Avg. analysis time</span>
              <span className="font-semibold text-slate-900">4.2 min</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Documents in queue</span>
              <span className="font-semibold text-slate-900">2</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">AI accuracy</span>
              <span className="font-semibold text-emerald-600">91%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent documents */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent Documents</h2>
            <p className="text-sm text-slate-500">
              {filtered.length} of {documents.length} documents
            </p>
          </div>

          {/* Persistent search */}
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents, type, owner..."
              aria-label="Search documents"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-700 placeholder-slate-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            {search ? (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Filter rows */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Status
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-200 ${
                      statusFilter === f
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-slate-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden h-6 w-px bg-slate-200 sm:block" />

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Risk
              </span>
              <div className="flex flex-wrap gap-1.5">
                {RISK_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setRiskFilter(f)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-200 ${
                      riskFilter === f
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-slate-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isFiltered ? (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 self-start rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 sm:self-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear filters
            </button>
          ) : null}
        </div>

        {/* Desktop table */}
        <div className="card hidden overflow-hidden lg:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/60 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Document</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Uploaded By</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Risk</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={goReview}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && goReview()}
                  className="cursor-pointer outline-none transition-colors hover:bg-brand-50/40 focus-visible:bg-brand-50/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-300"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{doc.name}</p>
                        <p className="text-xs text-slate-400">
                          {doc.id} · {doc.pages} pages
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{doc.type}</td>
                  <td className="px-5 py-3.5 text-slate-600">{doc.uploadedBy}</td>
                  <td className="px-5 py-3.5 text-slate-500">{doc.date}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <RiskBadge level={doc.risk} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <div className="p-10">
              <EmptyState
                icon={Search}
                title="No documents found"
                description="No documents match your current search or filters. Try adjusting them to see results."
                action={
                  <Button variant="secondary" icon={RotateCcw} onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            </div>
          ) : null}
        </div>

        {/* Tablet/mobile cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              onClick={goReview}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && goReview()}
              className="card cursor-pointer p-4 outline-none transition-all hover:border-brand-300 hover:shadow-md focus-visible:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-200"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">{doc.name}</p>
                  <p className="text-xs text-slate-400">
                    {doc.type} · {doc.uploadedBy}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <StatusBadge status={doc.status} />
                    <RiskBadge level={doc.risk} />
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" /> {doc.date}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
              </div>
            </div>
          ))}
          {filtered.length === 0 ? (
            <div className="sm:col-span-2">
              <EmptyState
                icon={Search}
                title="No documents found"
                description="No documents match your current search or filters. Try adjusting them to see results."
                action={
                  <Button variant="secondary" icon={RotateCcw} onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
