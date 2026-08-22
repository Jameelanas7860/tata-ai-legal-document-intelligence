// Centralized mock data for the AI Legal Document Intelligence System.
// All UI is driven from these files so a FastAPI backend can later swap
// these arrays for real API responses without touching components.

export const DOCUMENT_TYPES = [
  'Vendor Agreement',
  'NDA',
  'Service Agreement',
  'Lease Agreement',
  'Employment Contract',
  'Other',
];

export const BUSINESS_UNITS = [
  'Procurement',
  'Finance',
  'HR',
  'Legal',
  'Operations',
];

export const JURISDICTIONS = ['India', 'USA', 'UK', 'EU'];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const CONFIDENTIALITY = [
  'Public',
  'Internal',
  'Confidential',
  'Highly Confidential',
];

export const documents = [
  {
    id: 'DOC-2401',
    name: 'Vendor Agreement.pdf',
    type: 'Vendor Agreement',
    uploadedBy: 'Anas Khan',
    date: '2026-08-09',
    status: 'Completed',
    risk: 'High',
    jurisdiction: 'India',
    businessUnit: 'Procurement',
    pages: 14,
  },
  {
    id: 'DOC-2402',
    name: 'NDA Agreement.pdf',
    type: 'NDA',
    uploadedBy: 'Priya Sharma',
    date: '2026-08-08',
    status: 'Under Review',
    risk: 'Low',
    jurisdiction: 'USA',
    businessUnit: 'Legal',
    pages: 6,
  },
  {
    id: 'DOC-2403',
    name: 'Service Contract.pdf',
    type: 'Service Agreement',
    uploadedBy: 'Rahul Verma',
    date: '2026-08-07',
    status: 'Completed',
    risk: 'Medium',
    jurisdiction: 'UK',
    businessUnit: 'Finance',
    pages: 22,
  },
  {
    id: 'DOC-2404',
    name: 'Lease Agreement.pdf',
    type: 'Lease Agreement',
    uploadedBy: 'Sneha Patel',
    date: '2026-08-06',
    status: 'Processing',
    risk: 'Medium',
    jurisdiction: 'India',
    businessUnit: 'Operations',
    pages: 18,
  },
  {
    id: 'DOC-2405',
    name: 'Employment Contract.pdf',
    type: 'Employment Contract',
    uploadedBy: 'Vikram Singh',
    date: '2026-08-05',
    status: 'Completed',
    risk: 'Low',
    jurisdiction: 'EU',
    businessUnit: 'HR',
    pages: 9,
  },
  {
    id: 'DOC-2406',
    name: 'Master Services.pdf',
    type: 'Service Agreement',
    uploadedBy: 'Anas Khan',
    date: '2026-08-04',
    status: 'Under Review',
    risk: 'High',
    jurisdiction: 'USA',
    businessUnit: 'Legal',
    pages: 31,
  },
  {
    id: 'DOC-2407',
    name: 'Subcontractor NDA.pdf',
    type: 'NDA',
    uploadedBy: 'Priya Sharma',
    date: '2026-08-03',
    status: 'Completed',
    risk: 'Low',
    jurisdiction: 'India',
    businessUnit: 'Procurement',
    pages: 5,
  },
  {
    id: 'DOC-2408',
    name: 'Office Lease Deed.pdf',
    type: 'Lease Agreement',
    uploadedBy: 'Sneha Patel',
    date: '2026-08-02',
    status: 'Processing',
    risk: 'Medium',
    jurisdiction: 'UK',
    businessUnit: 'Operations',
    pages: 27,
  },
];

export const stats = [
  { label: 'Total Documents', value: 12, icon: 'FileText', trend: '+3 this week', tone: 'brand' },
  { label: 'Completed', value: 8, icon: 'CheckCircle2', trend: '67% completion', tone: 'success' },
  { label: 'Processing', value: 2, icon: 'Loader', trend: 'In pipeline', tone: 'warning' },
  { label: 'High Risk', value: 2, icon: 'ShieldAlert', trend: 'Needs attention', tone: 'error' },
];

export const processingSteps = [
  { id: 1, name: 'Document Uploaded', detail: 'File received and queued for analysis' },
  { id: 2, name: 'PDF Extraction / OCR', detail: 'Text extracted from document pages' },
  { id: 3, name: 'Document Parsing', detail: 'Structure and sections identified' },
  { id: 4, name: 'Clause Extraction', detail: 'Legal clauses isolated and tagged' },
  { id: 5, name: 'Knowledge Retrieval', detail: 'Compared against organizational knowledge base' },
  { id: 6, name: 'AI Risk Analysis', detail: 'Risk indicators flagged with confidence scoring' },
  { id: 7, name: 'Summary Generation', detail: 'Executive summary and review drafted' },
];

export const contractSummary =
  'This agreement governs the relationship between the supplier and the organization and defines obligations, payment terms, confidentiality and termination conditions. The contract establishes a 36-month engagement with quarterly performance reviews, auto-renewal clauses, and caps supplier liability at fees paid during the previous twelve months.';

export const risks = [
  {
    id: 'RISK-01',
    title: 'Limitation of Liability',
    severity: 'High',
    confidence: 92,
    evidence:
      "Supplier's liability is limited to fees paid during the previous twelve months.",
    page: 7,
    clause: 'Section 9.2',
    reason:
      "Diverges from the organization's approved liability position, which requires a minimum cap of 24 months of fees.",
    recommendation:
      'Negotiate the liability cap upward to at least 24 months and add carve-outs for IP infringement and gross negligence.',
  },
  {
    id: 'RISK-02',
    title: 'Termination Clause',
    severity: 'Medium',
    confidence: 84,
    evidence:
      'Either party may terminate the agreement with thirty days notice.',
    page: 11,
    clause: 'Section 12.1',
    reason:
      'A 30-day notice period is shorter than the corporate standard of 90 days for strategic vendor agreements.',
    recommendation:
      'Increase the notice period to 90 days and add transition assistance obligations for supplier-initiated termination.',
  },
  {
    id: 'RISK-03',
    title: 'Confidentiality',
    severity: 'Low',
    confidence: 95,
    evidence:
      'Confidential information shall be protected for a period of five years from disclosure.',
    page: 5,
    clause: 'Section 6.3',
    reason:
      'Five-year confidentiality term aligns with organizational policy. No material deviation detected.',
    recommendation: 'No action required. Clause is within approved parameters.',
  },
  {
    id: 'RISK-04',
    title: 'Indemnification',
    severity: 'High',
    confidence: 88,
    evidence:
      'Supplier indemnification is capped at $250,000 per claim, excluding consequential damages.',
    page: 9,
    clause: 'Section 10.4',
    reason:
      'Indemnity cap is well below the contract value and may not cover material IP or data-breach claims.',
    recommendation:
      'Raise the per-claim cap to $1,000,000 and remove the exclusion for data-protection claims.',
  },
  {
    id: 'RISK-05',
    title: 'Governing Law',
    severity: 'Medium',
    confidence: 79,
    evidence:
      'This agreement shall be governed by the laws of the State of Delaware, USA.',
    page: 13,
    clause: 'Section 14.1',
    reason:
      'Delaware governing law is outside the preferred Indian jurisdiction for domestic procurement contracts.',
    recommendation:
      'Where the counterparty operates in India, prefer Indian law and arbitration seated in Mumbai.',
  },
  {
    id: 'RISK-06',
    title: 'Data Protection',
    severity: 'Low',
    confidence: 91,
    evidence:
      'Supplier agrees to comply with applicable data protection regulations including GDPR.',
    page: 8,
    clause: 'Section 7.2',
    reason:
      'General GDPR reference is present but lacks specific subprocessor notification requirements.',
    recommendation:
      'Add explicit subprocessor notification (minimum 30 days) and audit rights for personal data handling.',
  },
];

export const riskSummary = {
  overall: 'High',
  high: 2,
  medium: 3,
  low: 4,
  confidence: 91,
};

export const auditEvents = [
  {
    id: 1,
    action: 'Document Uploaded',
    user: 'Anas Khan',
    role: 'User',
    timestamp: '10:20 AM',
    date: '2026-08-09',
    status: 'Completed',
    detail: 'Vendor_Agreement.pdf uploaded for analysis',
  },
  {
    id: 2,
    action: 'OCR Completed',
    user: 'System',
    role: 'System',
    timestamp: '10:21 AM',
    date: '2026-08-09',
    status: 'Completed',
    detail: 'Text extracted from 14 pages with 99.2% confidence',
  },
  {
    id: 3,
    action: 'Document Parsed',
    user: 'System',
    role: 'System',
    timestamp: '10:22 AM',
    date: '2026-08-09',
    status: 'Completed',
    detail: '14 sections and 42 clauses identified',
  },
  {
    id: 4,
    action: 'Clauses Extracted',
    user: 'System',
    role: 'System',
    timestamp: '10:22 AM',
    date: '2026-08-09',
    status: 'Completed',
    detail: '6 high-priority clauses flagged for review',
  },
  {
    id: 5,
    action: 'Knowledge Retrieval Completed',
    user: 'System',
    role: 'System',
    timestamp: '10:23 AM',
    date: '2026-08-09',
    status: 'Completed',
    detail: 'Matched against 1,247 organizational precedent documents',
  },
  {
    id: 6,
    action: 'Risk Analysis Generated',
    user: 'AI System',
    role: 'AI',
    timestamp: '10:24 AM',
    date: '2026-08-09',
    status: 'Completed',
    detail: '6 risks identified — 2 High, 2 Medium, 2 Low',
  },
  {
    id: 7,
    action: 'Risk Escalated',
    user: 'Reviewer',
    role: 'Reviewer',
    timestamp: '10:27 AM',
    date: '2026-08-09',
    status: 'Escalated',
    detail: 'Limitation of Liability (RISK-01) escalated to Legal Head',
  },
];

export const notifications = [
  { id: 1, title: 'Risk escalation required', detail: 'Vendor Agreement flagged 2 high-risk clauses', time: '5m ago', unread: true },
  { id: 2, title: 'Analysis complete', detail: 'Service Contract.pdf is ready for review', time: '1h ago', unread: true },
  { id: 3, title: 'New document uploaded', detail: 'Sneha Patel uploaded Lease Agreement.pdf', time: '3h ago', unread: false },
];

export const currentUser = {
  name: 'Anas Khan',
  role: 'Legal Counsel',
  initials: 'AK',
};
