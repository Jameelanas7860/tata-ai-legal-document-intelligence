import { FileText, MoreVertical } from 'lucide-react';
import StatusBadge from './StatusBadge';
import RiskBadge from './RiskBadge';

export default function DocumentCard({ document, onClick }) {
  const doc = document;
  return (
    <div
      onClick={onClick}
      className="card group cursor-pointer p-4 transition-all hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-900 group-hover:text-brand-700">{doc.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">{doc.type} · {doc.pages} pages</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={doc.status} />
            <RiskBadge level={doc.risk} />
          </div>
        </div>
        <button className="rounded-md p-1 text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 group-hover:opacity-100">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
