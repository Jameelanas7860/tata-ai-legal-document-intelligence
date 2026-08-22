import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

export default function ForgotPassword() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-lg">
            <Scale className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Legal Intelligence</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tata Group · Enterprise</p>
        </div>

        <div className="card p-6 sm:p-8">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Check your email</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                If an account exists for <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span>, you'll receive a password reset link shortly.
              </p>
              <Link
                to="/login"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                <ArrowLeft className="h-4 w-4" /> {t('backToSignIn')}
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('resetPassword')}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{t('email')}</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
                    />
                  </div>
                </div>

                {error ? (
                  <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">{error}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-full bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    t('sendResetLink')
                  )}
                </button>
              </form>

              <Link
                to="/login"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              >
                <ArrowLeft className="h-4 w-4" /> {t('backToSignIn')}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
