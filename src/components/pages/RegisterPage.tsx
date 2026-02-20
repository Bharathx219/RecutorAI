import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Briefcase, Users } from 'lucide-react';
import { registerLocalAuthUser, setSessionUser } from '@/lib/session';

function isRecoverableNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('load failed') ||
    message.includes('err_connection_refused')
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<'recruiter' | 'candidate'>('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'recruiter' || roleParam === 'candidate') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const apiBase = (import.meta as ImportMeta).env?.PUBLIC_API_BASE_URL as string;
    const cleanedEmail = email.trim().toLowerCase();
    const cleanedName = name.trim();
    let userId: string = crypto.randomUUID();

    try {
      if (apiBase) {
        try {
          const response = await fetch(`${apiBase}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: cleanedName,
              email: cleanedEmail,
              password,
              role,
            }),
          });

          if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body?.error || 'Unable to register');
          }

          const payload = await response.json();
          userId = payload.userId;
        } catch (remoteError) {
          if (!isRecoverableNetworkError(remoteError)) {
            throw remoteError;
          }
          const localUser = registerLocalAuthUser({
            name: cleanedName,
            email: cleanedEmail,
            role,
            password,
          });
          userId = localUser.userId;
        }
      } else {
        const localUser = registerLocalAuthUser({
          name: cleanedName,
          email: cleanedEmail,
          role,
          password,
        });
        userId = localUser.userId;
      }

      setSessionUser({
        userId,
        name: cleanedName,
        email: cleanedEmail,
        role,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);

    // Redirect to role-specific dashboard
    if (role === 'recruiter') {
      navigate('/recruiter/dashboard');
    } else {
      navigate('/candidate/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">RecruiterAI</h1>
        </Link>

        {/* Register Card */}
        <div className="bg-card-background rounded-2xl p-8 shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Create Account</h2>
          <p className="text-foreground/70 font-paragraph mb-6">Get started with RecruiterAI</p>

          {/* Role Selection */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`flex-1 py-3 px-4 rounded-xl font-paragraph font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                role === 'candidate'
                  ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                  : 'bg-background text-foreground/70 hover:bg-background/80'
              }`}
            >
              <Users className="w-4 h-4" />
              Candidate
            </button>
            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`flex-1 py-3 px-4 rounded-xl font-paragraph font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                role === 'recruiter'
                  ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                  : 'bg-background text-foreground/70 hover:bg-background/80'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Recruiter
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-paragraph font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-background text-foreground rounded-xl border border-card-background focus:border-input-glow focus:outline-none focus:ring-2 focus:ring-input-glow/50 transition-all duration-300 font-paragraph"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-paragraph font-medium text-foreground mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-background text-foreground rounded-xl border border-card-background focus:border-input-glow focus:outline-none focus:ring-2 focus:ring-input-glow/50 transition-all duration-300 font-paragraph"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-paragraph font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-background text-foreground rounded-xl border border-card-background focus:border-input-glow focus:outline-none focus:ring-2 focus:ring-input-glow/50 transition-all duration-300 font-paragraph"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-paragraph font-semibold hover:scale-105 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] mt-6"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
            {error && <p className="text-sm text-progress-red font-paragraph">{error}</p>}
          </form>

          {/* Login Link */}
          <p className="text-center text-foreground/70 font-paragraph text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-secondary transition-colors duration-300 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
