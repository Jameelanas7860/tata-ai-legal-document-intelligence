import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Sparkles, Cpu, Loader, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ProgressStep from '../components/ProgressStep';
import Button from '../components/Button';
import aiService from '../services/aiService';

const PIPELINE_STEPS = [
  { id: 1, name: 'Document Uploaded', detail: 'File received and queued for analysis' },
  { id: 2, name: 'PDF Extraction / OCR', detail: 'Text extracted from document pages' },
  { id: 3, name: 'Document Parsing & Chunking', detail: 'Document split into semantic chunks for analysis' },
  { id: 4, name: 'Embedding & Vector Storage', detail: 'Chunks embedded and stored for RAG retrieval' },
  { id: 5, name: 'RAG Retrieval', detail: 'Relevant clauses retrieved from organizational knowledge base' },
  { id: 6, name: 'AI Risk Analysis', detail: 'Gemini LLM analyzes clauses for risks with severity and confidence' },
  { id: 7, name: 'Summary Generation', detail: 'Executive summary and recommendations drafted by LLM' },
];

export default function Processing() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [pipelineSteps, setPipelineSteps] = useState(PIPELINE_STEPS);
  const [processingStatus, setProcessingStatus] = useState({ currentStep: 0, progress: 0, status: 'pending' });

  // Fetch real processing status from the backend
  useEffect(() => {
    let active = true;
    let pollTimer;
    let attempts = 0;

    const poll = async () => {
      if (!active) return;
      attempts++;
      try {
        const result = await aiService.getProcessingStatus();
        if (!active) return;

        setProcessingStatus(result);

        if (result.steps && result.steps.length > 0) {
          setPipelineSteps(result.steps);
        }

        if (result.status === 'completed') {
          setCurrentStep(result.steps?.length || PIPELINE_STEPS.length);
          setProgress(100);
          return; // Stop polling
        }

        if (result.status === 'failed') {
          setProgress(0);
          return; // Stop polling
        }

        if (attempts < 60) {
          pollTimer = setTimeout(poll, 2000);
        }
      } catch {
        if (active && attempts < 60) {
          pollTimer = setTimeout(poll, 2000);
        }
      }
    };

    poll();

    return () => {
      active = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, []);

  // Animate progress bar toward target
  useEffect(() => {
    const target = processingStatus.status === 'completed'
      ? 100
      : (currentStep / pipelineSteps.length) * 100;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= target) return p;
        return Math.min(p + 1.5, target);
      });
    }, 30);
    return () => clearInterval(interval);
  }, [currentStep, pipelineSteps.length, processingStatus.status]);

  // Step through pipeline animation
  useEffect(() => {
    if (processingStatus.status === 'completed') return;
    if (currentStep >= pipelineSteps.length) return;
    const timer = setTimeout(() => {
      setCurrentStep((s) => s + 1);
    }, 1100);
    return () => clearTimeout(timer);
  }, [currentStep, pipelineSteps.length, processingStatus.status]);

  const done = processingStatus.status === 'completed' || currentStep >= pipelineSteps.length;
  const failed = processingStatus.status === 'failed';

  const getState = (index) => {
    if (processingStatus.status === 'completed') return 'completed';
    if (index < currentStep) return 'completed';
    if (index === currentStep && !done) return 'processing';
    return 'pending';
  };

  const fileName = processingStatus.name || 'Document';

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Analyzing Document"
        subtitle="AI is extracting, chunking, embedding, and scoring your legal document for risks using the RAG pipeline."
        icon={Cpu}
      />

      {/* Document banner */}
      <div className="card mb-6 flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <FileText className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">{fileName}</p>
          <p className="text-sm text-slate-500">AI-powered analysis in progress</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-brand-600">{Math.round(progress)}%</p>
          <p className="text-xs text-slate-400">{failed ? 'Failed' : done ? 'Complete' : 'Processing'}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card mb-6 p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Overall progress</span>
          <span className="font-semibold text-brand-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps timeline */}
      <div className="card p-6">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-slate-700">Processing Pipeline</h3>
        </div>
        <div className="mt-4">
          {pipelineSteps.map((step, i) => (
            <ProgressStep
              key={step.id || i}
              step={step}
              index={i}
              total={pipelineSteps.length}
              state={getState(i)}
            />
          ))}
        </div>
      </div>

      {/* Failed state */}
      {failed ? (
        <div className="mt-6 flex animate-fade-in flex-col items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-rose-900">Analysis failed</p>
              <p className="text-sm text-rose-700">The AI processing encountered an error. Please try uploading again.</p>
            </div>
          </div>
          <Button onClick={() => navigate('/upload')} icon={ArrowRight} size="lg" variant="danger" className="w-full sm:w-auto">
            Upload Again
          </Button>
        </div>
      ) : done ? (
        <div className="mt-6 flex animate-fade-in flex-col items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900">Analysis complete</p>
              <p className="text-sm text-emerald-700">AI risk analysis finished — review the results</p>
            </div>
          </div>
          <Button onClick={() => navigate('/review')} icon={ArrowRight} size="lg" variant="success" className="w-full sm:w-auto">
            View Analysis
          </Button>
        </div>
      ) : (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
          <Loader className="h-4 w-4 animate-spin text-brand-500" />
          Analyzing... please wait
        </div>
      )}
    </div>
  );
}
