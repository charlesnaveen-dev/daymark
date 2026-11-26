import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { user, isCloudMode, signIn, signUp, signInLocalDev } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signin') {
        const res = await signIn(email.trim(), password);
        if (res.error) setError(res.error);
      } else {
        const res = await signUp(
          email.trim(),
          password,
          displayName.trim() || 'Creator'
        );
        if (res.error) {
          setError(res.error);
        } else if (res.needsVerification) {
          setNotice(
            'Account created. Please check your email to confirm your address before signing in.'
          );
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-primary)] text-base font-bold text-white">
            D
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              DAYMARK
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Make every day count.
            </p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          {mode === 'signin' ? 'Sign in to your workspace' : 'Create your account'}
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {isCloudMode
            ? 'Your records are synced privately with Supabase.'
            : 'Supabase credentials are not configured. You can use Local Dev Mode.'}
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3.5 py-2.5 text-sm text-[var(--danger)]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--success)]/30 bg-[var(--success-soft)] px-3.5 py-2.5 text-sm text-[var(--success)]"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <label
                htmlFor="login-name"
                className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
              >
                Display name
              </label>
              <input
                id="login-name"
                name="displayName"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
            >
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
            >
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={
                mode === 'signin' ? 'current-password' : 'new-password'
              }
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-primary-hover)] disabled:opacity-60"
          >
            <span>
              {busy
                ? 'Please wait...'
                : mode === 'signin'
                  ? 'Sign in'
                  : 'Create account'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {!isCloudMode && (
          <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
            <button
              type="button"
              onClick={() => signInLocalDev('Creator', 'local@daymark.app')}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
            >
              Continue in Local Dev Mode (Browser Storage)
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-[var(--text-secondary)]">
          {mode === 'signin' ? (
            <>
              Need an initial account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setNotice(null);
                }}
                className="font-medium text-[var(--accent-primary)] hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setNotice(null);
                }}
                className="font-medium text-[var(--accent-primary)] hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
