import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../../components/brand/Logo';
import { isFirebaseConfigured } from '../../lib/firebase';

export function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email, password);
      navigate('/admin');
    } catch {
      setError('Incorrect email or password. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-black p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <form onSubmit={onSubmit} className="card space-y-4 p-6">
          <div>
            <h1 className="font-display text-xl font-bold">Admin sign in</h1>
            <p className="mt-1 text-sm text-brand-white/55">Staff access only.</p>
          </div>

          {!isFirebaseConfigured && (
            <p className="rounded border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              Firebase isn’t configured. Set up <code>.env</code> and create an admin user in the
              Firebase console (see the README) before signing in.
            </p>
          )}

          <div>
            <label htmlFor="email" className="field-label">Email</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" />
          </div>
          <div>
            <label htmlFor="password" className="field-label">Password</label>
            <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field-input" />
          </div>

          {error && (
            <p className="flex items-center gap-2 text-sm text-red-400" role="alert">
              <AlertCircle size={16} aria-hidden /> {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
