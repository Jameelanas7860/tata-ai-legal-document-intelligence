import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  X,
  ArrowRight,
  FileCheck,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Info,
  Lock,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import documentService from '../services/documentService';

const DOCUMENT_TYPES = [
  'Vendor Agreement',
  'NDA',
  'Service Agreement',
  'Lease Agreement',
  'Employment Contract',
  'Other',
];

const BUSINESS_UNITS = [
  'Procurement',
  'Finance',
  'HR',
  'Legal',
  'Operations',
];

const JURISDICTIONS = ['India', 'USA', 'UK', 'EU'];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const CONFIDENTIALITY = [
  'Public',
  'Internal',
  'Confidential',
  'Highly Confidential',
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ACCEPTED_EXT = ['pdf', 'docx'];
const ACCEPTED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getExtension(name) {
  return name.split('.').pop()?.toLowerCase() || '';
}

const SELECT_CLASSES =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100';
const SELECT_ERROR_CLASSES =
  'w-full rounded-lg border border-rose-300 bg-white px-3 py-2.5 text-sm text-slate-700 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100';
const LABEL_CLASSES = 'mb-1.5 block text-sm font-medium text-slate-700';

export default function UploadDocument() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [form, setForm] = useState({
    documentType: '',
    businessUnit: '',
    jurisdiction: '',
    priority: '',
    confidentiality: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const validateFile = (f) => {
    if (!f) return 'Please select a document to upload.';
    const ext = getExtension(f.name);
    if (!ACCEPTED_EXT.includes(ext) && !ACCEPTED_MIME.includes(f.type)) {
      return 'Unsupported file type. Only PDF or DOCX files are accepted.';
    }
    if (f.size > MAX_FILE_SIZE) {
      return `File is too large. Maximum allowed size is ${formatBytes(MAX_FILE_SIZE)}.`;
    }
    if (f.size === 0) {
      return 'The selected file appears to be empty. Please choose a valid document.';
    }
    return null;
  };

  const handleFile = (f) => {
    const err = validateFile(f);
    setFileError(err);
    if (err) {
      setFile(null);
      return;
    }
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: null }));
  };

  const removeFile = () => {
    setFile(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const validate = () => {
    const er = {};
    const fileErr = validateFile(file);
    if (fileErr) {
      setFileError(fileErr);
      er.file = fileErr;
    }
    if (!form.documentType) er.documentType = 'Please select a document type.';
    if (!form.businessUnit) er.businessUnit = 'Please select a business unit.';
    if (!form.jurisdiction) er.jurisdiction = 'Please select a jurisdiction.';
    if (!form.priority) er.priority = 'Please select a review priority.';
    if (!form.confidentiality) er.confidentiality = 'Please select a confidentiality level.';
    return er;
  };

  const handleSubmit = async () => {
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length > 0) {
      const firstError = document.querySelector('[data-error="true"]');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);
    setUploadError(null);
    try {
      await documentService.uploadDocument(file, form);
      navigate('/processing');
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.');
      setSubmitting(false);
    }
  };

  const isFormComplete =
    file && !fileError && form.documentType && form.businessUnit && form.jurisdiction && form.priority && form.confidentiality;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Upload Legal Document"
        subtitle="Upload a legal document to begin AI-powered analysis."
        icon={UploadCloud}
      />

      {uploadError ? (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Upload zone */}
        <div className="lg:col-span-3">
          <div className={`card relative p-6 transition-opacity ${submitting ? 'pointer-events-none opacity-60' : ''}`}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Document File</h3>
              {file && !fileError ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Ready
                </span>
              ) : null}
            </div>

            {!file ? (
              <div
                onClick={() => !submitting && inputRef.current?.click()}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !submitting) {
                    e.preventDefault();
                    inputRef.current?.click();
                  }
                }}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                role="button"
                tabIndex={0}
                aria-label="Drag and drop a file or browse to select a document"
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center outline-none transition-all focus-visible:ring-2 focus-visible:ring-brand-300 ${
                  dragging
                    ? 'border-brand-400 bg-brand-50'
                    : fileError
                    ? 'border-rose-300 bg-rose-50/40 hover:border-rose-400'
                    : 'border-slate-300 bg-slate-50/50 hover:border-brand-300 hover:bg-brand-50/30'
                }`}
              >
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm transition-colors ${
                  dragging ? 'bg-brand-100 text-brand-600' : fileError ? 'bg-rose-100 text-rose-500' : 'bg-white text-brand-500'
                }`}>
                  <UploadCloud className="h-8 w-8" />
                </div>
                <p className="mt-4 text-base font-semibold text-slate-700">
                  Drag &amp; drop your PDF here
                </p>
                <p className="mt-1 text-sm text-slate-400">or browse files</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">PDF</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">DOCX</span>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </div>
            ) : (
              <div className={`rounded-xl border p-4 transition-colors ${
                fileError ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-slate-50/50'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    fileError ? 'bg-rose-50 text-rose-500' : 'bg-brand-50 text-brand-600'
                  }`}>
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{file.name}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                      <span><span className="text-slate-400">Size:</span> {formatBytes(file.size)}</span>
                      <span><span className="text-slate-400">Type:</span> {getExtension(file.name).toUpperCase()}</span>
                      {!fileError ? (
                        <span className="text-emerald-600"><span className="text-slate-400">Status:</span> Ready for analysis</span>
                      ) : null}
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    aria-label="Remove selected file"
                    className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* File error */}
            {fileError ? (
              <div data-error="true" className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            ) : null}

            {/* Upload instructions */}
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Info className="h-3.5 w-3.5" />
                Upload guidelines
              </div>
              <ul className="mt-2.5 space-y-1.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  Supported formats: <span className="font-medium text-slate-700">PDF, DOCX</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  Maximum file size: <span className="font-medium text-slate-700">{formatBytes(MAX_FILE_SIZE)}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  Text-based PDFs and scanned documents are both supported (OCR applied automatically).
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  Documents are processed securely and never shared with third parties.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Metadata form */}
        <div className="lg:col-span-2">
          <div className={`card p-6 transition-opacity ${submitting ? 'pointer-events-none opacity-60' : ''}`}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Document Metadata</h3>
              <span className="text-xs text-slate-400">All fields required</span>
            </div>
            <div className="space-y-4">
              <Field
                label="Document Type"
                value={form.documentType}
                onChange={handleChange('documentType')}
                error={errors.documentType}
                placeholder="Select type..."
                options={DOCUMENT_TYPES}
              />
              <Field
                label="Business Unit"
                value={form.businessUnit}
                onChange={handleChange('businessUnit')}
                error={errors.businessUnit}
                placeholder="Select unit..."
                options={BUSINESS_UNITS}
              />
              <Field
                label="Jurisdiction"
                value={form.jurisdiction}
                onChange={handleChange('jurisdiction')}
                error={errors.jurisdiction}
                placeholder="Select jurisdiction..."
                options={JURISDICTIONS}
              />
              <Field
                label="Review Priority"
                value={form.priority}
                onChange={handleChange('priority')}
                error={errors.priority}
                placeholder="Select priority..."
                options={PRIORITIES}
              />
              <Field
                label="Confidentiality"
                value={form.confidentiality}
                onChange={handleChange('confidentiality')}
                error={errors.confidentiality}
                placeholder="Select level..."
                options={CONFIDENTIALITY}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit bar */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:p-5">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
              <span className="font-medium text-slate-700">Uploading and starting analysis...</span>
            </>
          ) : isFormComplete ? (
            <>
              <FileCheck className="h-5 w-5 text-emerald-500" />
              <span>Everything looks ready. Your document will be processed with AI-powered risk analysis.</span>
            </>
          ) : (
            <>
              <FileCheck className="h-5 w-5 text-brand-500" />
              <span>Select a file and fill in the metadata to begin analysis.</span>
            </>
          )}
        </div>
        <Button
          onClick={handleSubmit}
          icon={submitting ? Loader2 : Sparkles}
          size="lg"
          className="w-full sm:w-auto"
          disabled={submitting}
        >
          {submitting ? 'Uploading...' : 'Upload & Analyze'}
          {!submitting ? <ArrowRight className="h-4 w-4" /> : null}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, error, placeholder, options }) {
  return (
    <div data-error={error ? 'true' : 'false'}>
      <label className={LABEL_CLASSES}>
        {label}
        <span className="ml-0.5 text-rose-500">*</span>
      </label>
      <select
        value={value}
        onChange={onChange}
        className={error ? SELECT_ERROR_CLASSES : SELECT_CLASSES}
        aria-invalid={!!error}
      >
        <option value="">{placeholder}</option>
        {options.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      {error ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
