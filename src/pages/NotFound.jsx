import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Compass className="h-8 w-8" />
      </div>
      <p className="mt-6 text-6xl font-bold text-slate-900">404</p>
      <h1 className="mt-2 text-xl font-semibold text-slate-800">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button to="/" icon={Home} variant="primary">
          Back to Dashboard
        </Button>
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Go to Profile
        </Link>
      </div>
    </div>
  );
}
