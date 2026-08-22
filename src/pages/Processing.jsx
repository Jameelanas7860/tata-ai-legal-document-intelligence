import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Sparkles, Cpu } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ProgressStep from '../components/ProgressStep';
import Button from '../components/Button';
import { processingSteps } from '../data/mockData';

export default function Processing() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const fileName = 'Vendor_Agreement.pdf';

  // Step through processing pipeline
  useEffect(() => {
    if (currentStep >= processingSteps.length) return;
    const timer = setTimeout(() => {
      setCurrentStep((s) => s + 1);
    }, 1100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Progress bar
  useEffect(() => {
    const target = (currentStep / processingSteps.length) * 100;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= target) return p;
        return Math.min(p + 1.5, target);
      });
    }, 30);
    return () => clearInterval(interval);
  }, [currentStep]);

  const done = currentStep >= processingSteps.length;

  const getState = (index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep && !done) return 'processing';
    return 'pending';
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Analyzing Document"
        subtitle="AI is extracting, parsing, and scoring your legal document for risks."
        icon={Cpu}
      />

      {/* Document banner */}
      <div className="card mb-6 flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <FileText className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">{fileName}</p>
          <p className="text-sm text-slate-500">14 pages · Vendor Agreement · India</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-brand-600">{Math.round(progress)}%</p>
          <p className="text-xs text-slate-400">{done ? 'Complete' : 'Processing'}</p>
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
          {processingSteps.map((step, i) => (
            <ProgressStep
              key={step.id}
              step={step}
              index={i}
              total={processingSteps.length}
              state={getState(i)}
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      {done ? (
        <div className="mt-6 flex animate-fade-in flex-col items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900">Analysis complete</p>
              <p className="text-sm text-emerald-700">6 risks identified · 91% confidence</p>
            </div>
          </div>
          <Button onClick={() => navigate('/review')} icon={ArrowRight} size="lg" variant="success" className="w-full sm:w-auto">
            View Analysis
          </Button>
        </div>
      ) : (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
          Analyzing... please wait
        </div>
      )}
    </div>
  );
}
